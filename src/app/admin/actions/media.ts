'use server'

import { randomUUID } from 'node:crypto'
import sharp from 'sharp'
import type { ImageRef } from '@/content/types'
import { guard, UserError, type ActionResult } from '@/lib/admin/result'
import { requireStaff } from '@/lib/auth'
import { createSupabaseServiceClient } from '@/lib/supabase/admin'
import { parseVideoUrl, youtubeThumbnail } from '@/lib/video'

// Upload pipeline (brief §14.5–14.6).
//  1. The browser asks for a one-time signed upload URL (size/type pre-checked).
//  2. The file goes straight to the private bucket (large files never pass
//     through our server's request size limits).
//  3. The server downloads it, checks the real file type from its bytes (not
//     the extension), and for images: auto-rotates, crops to the slot's aspect
//     ratio, strips all metadata including GPS, and writes WebP variants to
//     the public bucket. The original is then deleted.

const IMAGE_MAX = 10 * 1024 * 1024
const VIDEO_MAX = 200 * 1024 * 1024
const CAPTIONS_MAX = 512 * 1024
const WIDTHS = [480, 960, 1440, 1920]
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

function sniffImage(buf: Buffer): 'jpeg' | 'png' | 'webp' | null {
  if (buf.length < 12) return null
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'jpeg'
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'png'
  if (buf.subarray(0, 4).toString('ascii') === 'RIFF' && buf.subarray(8, 12).toString('ascii') === 'WEBP') return 'webp'
  return null
}

const isMp4 = (buf: Buffer) => buf.length >= 12 && buf.subarray(4, 8).toString('ascii') === 'ftyp'

const tmpPath = (p: string) => /^(images|videos)\/[0-9a-f-]{36}\.(bin|mp4)$/.test(p)

export async function createUpload(kind: 'image' | 'video', size: number, type: string): Promise<ActionResult<{ path: string; token: string }>> {
  return guard(async () => {
    await requireStaff()
    if (kind === 'image') {
      if (!IMAGE_TYPES.includes(type)) throw new UserError('Please choose a JPG, PNG or WebP image.')
      if (!(size > 0 && size <= IMAGE_MAX)) throw new UserError('That image is larger than 10 MB. Please choose a smaller file.')
    } else {
      if (type !== 'video/mp4') throw new UserError('Please choose an MP4 video file.')
      if (!(size > 0 && size <= VIDEO_MAX)) throw new UserError('That video is larger than 200 MB. For long videos, upload to YouTube or Vimeo and paste the link instead.')
    }
    const path = `${kind === 'image' ? 'images' : 'videos'}/${randomUUID()}.${kind === 'image' ? 'bin' : 'mp4'}`
    const { data, error } = await createSupabaseServiceClient().storage.from('private-uploads').createSignedUploadUrl(path)
    if (error || !data) throw new UserError('Could not start the upload. Please try again.')
    return { ok: true, data: { path, token: data.token } }
  })
}

async function removeTmp(path: string) {
  await createSupabaseServiceClient().storage.from('private-uploads').remove([path]).catch(() => undefined)
}

export async function processImage(
  path: string,
  crop: { x: number; y: number; width: number; height: number },
  aspect: [number, number],
): Promise<ActionResult<ImageRef>> {
  return guard(async () => {
    await requireStaff()
    if (!tmpPath(path) || !path.startsWith('images/')) throw new UserError('Invalid upload.')
    const db = createSupabaseServiceClient()
    const { data: blob, error } = await db.storage.from('private-uploads').download(path)
    if (error || !blob) throw new UserError('The upload could not be found. Please try again.')
    const buf = Buffer.from(await blob.arrayBuffer())
    try {
      if (buf.length > IMAGE_MAX) throw new UserError('That image is larger than 10 MB. Please choose a smaller file.')
      if (!sniffImage(buf)) throw new UserError('That file is not a real JPG, PNG or WebP image. Renamed files are not accepted.')

      // Auto-orient first so crop coordinates match what the browser displayed.
      const oriented = await sharp(buf, { limitInputPixels: 60_000_000 }).rotate().toBuffer({ resolveWithObject: true })
      const W = oriented.info.width
      const H = oriented.info.height
      const left = Math.max(0, Math.min(W - 1, Math.round(crop.x)))
      const top = Math.max(0, Math.min(H - 1, Math.round(crop.y)))
      let width = Math.max(1, Math.min(W - left, Math.round(crop.width)))
      let height = Math.max(1, Math.min(H - top, Math.round(crop.height)))
      // Enforce the slot's aspect ratio server-side (the crop tool locks it in the browser too).
      const target = aspect[0] / aspect[1]
      if (Math.abs(width / height - target) > 0.02) {
        if (width / height > target) width = Math.round(height * target)
        else height = Math.round(width / target)
      }
      if (width < 320) throw new UserError('That image is too small. Please use a photo at least 320 pixels wide.')

      const cropped = sharp(oriented.data).extract({ left, top, width, height })
      const widths = [...new Set(WIDTHS.filter((w) => w < width).concat(Math.min(width, 1920)))].sort((a, b) => a - b)
      const id = randomUUID()
      const variants: { width: number; src: string }[] = []
      let finalHeight = height
      for (const w of widths) {
        // sharp drops EXIF/XMP/GPS metadata unless asked to keep it.
        const out = await cropped.clone().resize({ width: w, withoutEnlargement: true }).webp({ quality: 80 }).toBuffer({ resolveWithObject: true })
        const key = `images/${id}/${w}.webp`
        const { error: upErr } = await db.storage.from('public-media').upload(key, out.data, { contentType: 'image/webp', cacheControl: '31536000', upsert: false })
        if (upErr) throw new UserError('Could not save the processed image. Please try again.')
        variants.push({ width: out.info.width, src: db.storage.from('public-media').getPublicUrl(key).data.publicUrl })
        finalHeight = out.info.height
      }
      const largest = variants[variants.length - 1]
      return { ok: true, data: { src: largest.src, width: largest.width, height: finalHeight, alt: '', variants } }
    } finally {
      await removeTmp(path)
    }
  })
}

export async function finalizeVideo(path: string): Promise<ActionResult<{ url: string }>> {
  return guard(async () => {
    await requireStaff()
    if (!tmpPath(path) || !path.startsWith('videos/')) throw new UserError('Invalid upload.')
    const db = createSupabaseServiceClient()
    const { data: signed } = await db.storage.from('private-uploads').createSignedUrl(path, 60)
    if (!signed) throw new UserError('The upload could not be found. Please try again.')
    const head = await fetch(signed.signedUrl, { headers: { Range: 'bytes=0-31' } })
    const bytes = Buffer.from(await head.arrayBuffer())
    const total = Number((head.headers.get('content-range') || '').split('/')[1] || 0)
    if (!isMp4(bytes)) {
      await removeTmp(path)
      throw new UserError('That file is not a real MP4 video. Renamed files are not accepted.')
    }
    if (total > VIDEO_MAX) {
      await removeTmp(path)
      throw new UserError('That video is larger than 200 MB.')
    }
    const dest = `videos/${randomUUID()}.mp4`
    const { error } = await db.storage.from('private-uploads').move(path, dest, { destinationBucket: 'public-media' })
    if (error) {
      await removeTmp(path)
      throw new UserError('Could not publish the video file. Please try again.')
    }
    return { ok: true, data: { url: db.storage.from('public-media').getPublicUrl(dest).data.publicUrl } }
  })
}

export async function uploadCaptions(form: FormData): Promise<ActionResult<{ url: string }>> {
  return guard(async () => {
    await requireStaff()
    const file = form.get('file')
    if (!(file instanceof File)) throw new UserError('Choose a .vtt captions file.')
    if (file.size > CAPTIONS_MAX) throw new UserError('Captions files must be under 512 KB.')
    const text = await file.text()
    if (!/^﻿?WEBVTT/.test(text)) throw new UserError('That is not a WebVTT (.vtt) captions file.')
    const db = createSupabaseServiceClient()
    const key = `captions/${randomUUID()}.vtt`
    const { error } = await db.storage.from('public-media').upload(key, new Blob([text], { type: 'text/vtt' }), { contentType: 'text/vtt', cacheControl: '31536000' })
    if (error) throw new UserError('Could not save the captions file.')
    return { ok: true, data: { url: db.storage.from('public-media').getPublicUrl(key).data.publicUrl } }
  })
}

/** YouTube / Vimeo thumbnail for the poster image (replaceable in the form). */
export async function fetchVideoThumbnail(url: string, title: string): Promise<ActionResult<ImageRef>> {
  return guard(async () => {
    await requireStaff()
    const parsed = parseVideoUrl(url)
    if (!parsed) throw new UserError('Enter a valid YouTube or Vimeo link.')
    const alt = `Video: ${title || 'Sleep Anaesthesia'}`.slice(0, 200)
    if (parsed.provider === 'youtube') return { ok: true, data: { src: youtubeThumbnail(parsed.id), width: 480, height: 360, alt } }
    const res = await fetch(`https://vimeo.com/api/oembed.json?url=${encodeURIComponent(`https://vimeo.com/${parsed.id}`)}&width=1280`, { cache: 'no-store' })
    if (!res.ok) throw new UserError('Could not fetch the Vimeo thumbnail. Check the video is public, or upload a poster image.')
    const j = (await res.json()) as { thumbnail_url?: string; thumbnail_width?: number; thumbnail_height?: number }
    if (!j.thumbnail_url?.startsWith('https://i.vimeocdn.com/')) throw new UserError('Could not fetch the Vimeo thumbnail. Upload a poster image instead.')
    return { ok: true, data: { src: j.thumbnail_url, width: j.thumbnail_width || 1280, height: j.thumbnail_height || 720, alt } }
  })
}
