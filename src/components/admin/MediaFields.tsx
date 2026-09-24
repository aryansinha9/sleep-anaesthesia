'use client'

import { useCallback, useRef, useState } from 'react'
import Cropper, { type Area } from 'react-easy-crop'
import { createUpload, finalizeVideo, processImage, uploadCaptions } from '@/app/admin/actions/media'
import type { ImageRef } from '@/content/types'
import { createSupabaseUploadClient } from '@/lib/supabase/browser'
import { useToast } from './Toast'

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MB = 1024 * 1024

/**
 * Image upload with a crop tool locked to the slot's aspect ratio. Alt text
 * is required whenever an image is set.
 */
export function ImageField({ id, value, onChange, aspect, invalid, altError }: {
  id: string; value: ImageRef | null; onChange: (v: ImageRef | null) => void; aspect: [number, number]; invalid?: boolean; altError?: string
}) {
  const toast = useToast()
  const input = useRef<HTMLInputElement>(null)
  const dialog = useRef<HTMLDialogElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [area, setArea] = useState<Area | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const onComplete = useCallback((_: Area, px: Area) => setArea(px), [])

  function choose(f: File | undefined) {
    if (!f) return
    if (!IMAGE_TYPES.includes(f.type)) return toast('error', 'Please choose a JPG, PNG or WebP image.')
    if (f.size > 10 * MB) return toast('error', `That image is ${(f.size / MB).toFixed(1)} MB. The limit is 10 MB.`)
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setZoom(1)
    setCrop({ x: 0, y: 0 })
    dialog.current?.showModal()
  }

  async function upload() {
    if (!file || !area) return
    setBusy('Uploading…')
    try {
      const ticket = await createUpload('image', file.size, file.type)
      if (!ticket.ok) throw new Error(ticket.error)
      const { error } = await createSupabaseUploadClient().storage.from('private-uploads').uploadToSignedUrl(ticket.data.path, ticket.data.token, file, { contentType: file.type })
      if (error) throw new Error('Upload failed. Check your connection and try again.')
      setBusy('Optimising…')
      const r = await processImage(ticket.data.path, area, aspect)
      if (!r.ok) throw new Error(r.error)
      onChange({ ...r.data, alt: value?.alt || '' })
      dialog.current?.close()
      toast('success', 'Image uploaded. Remember to add alt text.')
    } catch (e) {
      toast('error', e instanceof Error ? e.message : 'Upload failed.')
    } finally {
      setBusy(null)
      if (input.current) input.current.value = ''
    }
  }

  const ratio = `${aspect[0]} / ${aspect[1]}`
  return (
    <div className="img-field">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {value ? <img src={value.variants?.[0]?.src || value.src} alt="" style={{ aspectRatio: ratio }} /> : <div className="img-empty" style={{ aspectRatio: ratio }}>No image</div>}
      <div style={{ display: 'grid', gap: 10, flex: '1 1 260px' }}>
        <div className="actions-bar">
          <input ref={input} id={id} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => choose(e.target.files?.[0])} />
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => input.current?.click()}>{value ? 'Replace image' : 'Upload image'}</button>
          {value && <button type="button" className="btn btn-danger btn-sm" onClick={() => onChange(null)}>Remove</button>}
        </div>
        {value && (
          <div className="adm-field" data-error={!!altError}>
            <label htmlFor={`${id}-alt`}>Alt text<span className="req">*</span><span className="count" data-over={value.alt.length > 200}>{value.alt.length}/200</span></label>
            <input className="input" id={`${id}-alt`} value={value.alt} maxLength={200} aria-invalid={!!altError || (invalid && !value.alt)} onChange={(e) => onChange({ ...value, alt: e.target.value })} placeholder="Describe what the image shows" />
            <p className="help">Describes the image for people using screen readers and for Google. E.g. &ldquo;Anaesthetist monitoring a sedated patient in a dental chair&rdquo;.</p>
            {altError && <p className="err">{altError}</p>}
          </div>
        )}
        <p className="help" style={{ margin: 0, fontSize: 13, color: 'var(--color-muted)' }}>JPG, PNG or WebP, up to 10 MB. You&apos;ll crop it to fit this space ({aspect[0]}:{aspect[1]}). Location data is removed automatically.</p>
      </div>
      <dialog ref={dialog} className="adm-dialog wide" onClose={() => { if (preview) URL.revokeObjectURL(preview); setPreview(null) }}>
        <h2>Crop image</h2>
        <p className="muted" style={{ margin: '0 0 12px', fontSize: 14 }}>Drag to position. The frame is fixed to the shape of this space on the website.</p>
        <div className="crop-wrap">
          {preview && <Cropper image={preview} crop={crop} zoom={zoom} aspect={aspect[0] / aspect[1]} onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={onComplete} />}
        </div>
        <label className="adm-field" style={{ marginTop: 12 }}>
          <span className="lbl">Zoom</span>
          <input type="range" min={1} max={3} step={0.05} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} />
        </label>
        <div className="actions-bar">
          <button type="button" className="btn btn-secondary" onClick={() => dialog.current?.close()} disabled={!!busy}>Cancel</button>
          <button type="button" className="btn btn-primary" onClick={upload} disabled={!!busy || !area}>{busy || 'Crop and upload'}</button>
        </div>
      </dialog>
    </div>
  )
}

export function VideoFileField({ id, value, onChange }: { id: string; value: string; onChange: (v: string) => void }) {
  const toast = useToast()
  const input = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState<string | null>(null)
  async function choose(f: File | undefined) {
    if (!f) return
    if (f.type !== 'video/mp4') return toast('error', 'Please choose an MP4 video file.')
    if (f.size > 200 * MB) return toast('error', `That video is ${(f.size / MB).toFixed(0)} MB. The limit is 200 MB; for longer videos use YouTube or Vimeo.`)
    setBusy(`Uploading ${(f.size / MB).toFixed(0)} MB…`)
    try {
      const ticket = await createUpload('video', f.size, f.type)
      if (!ticket.ok) throw new Error(ticket.error)
      const { error } = await createSupabaseUploadClient().storage.from('private-uploads').uploadToSignedUrl(ticket.data.path, ticket.data.token, f, { contentType: 'video/mp4' })
      if (error) throw new Error('Upload failed. Check your connection and try again.')
      setBusy('Checking file…')
      const r = await finalizeVideo(ticket.data.path)
      if (!r.ok) throw new Error(r.error)
      onChange(r.data.url)
      toast('success', 'Video uploaded.')
    } catch (e) {
      toast('error', e instanceof Error ? e.message : 'Upload failed.')
    } finally {
      setBusy(null)
      if (input.current) input.current.value = ''
    }
  }
  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <p className="notice" style={{ margin: 0 }}>Tip: YouTube or Vimeo links are recommended for longer videos. Uploaded videos use the website&apos;s bandwidth and storage.</p>
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      {value && <video src={value} controls preload="metadata" style={{ width: '100%', maxWidth: 420, borderRadius: 10 }} />}
      <div className="actions-bar">
        <input ref={input} id={id} type="file" accept="video/mp4" hidden onChange={(e) => choose(e.target.files?.[0])} />
        <button type="button" className="btn btn-secondary btn-sm" disabled={!!busy} onClick={() => input.current?.click()}>{busy || (value ? 'Replace video' : 'Upload MP4')}</button>
        {value && !busy && <button type="button" className="btn btn-danger btn-sm" onClick={() => onChange('')}>Remove</button>}
      </div>
    </div>
  )
}

export function CaptionsField({ id, value, onChange }: { id: string; value: string; onChange: (v: string) => void }) {
  const toast = useToast()
  const input = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  async function choose(f: File | undefined) {
    if (!f) return
    if (!f.name.toLowerCase().endsWith('.vtt')) return toast('error', 'Please choose a .vtt captions file.')
    setBusy(true)
    const fd = new FormData()
    fd.append('file', f)
    const r = await uploadCaptions(fd)
    setBusy(false)
    if (input.current) input.current.value = ''
    if (!r.ok) return toast('error', r.error)
    onChange(r.data.url)
    toast('success', 'Captions uploaded.')
  }
  return (
    <div className="actions-bar" style={{ alignItems: 'center' }}>
      <input ref={input} id={id} type="file" accept=".vtt,text/vtt" hidden onChange={(e) => choose(e.target.files?.[0])} />
      <button type="button" className="btn btn-secondary btn-sm" disabled={busy} onClick={() => input.current?.click()}>{busy ? 'Uploading…' : value ? 'Replace captions' : 'Upload .vtt file'}</button>
      {value && <><span className="badge badge-live">Captions added</span><button type="button" className="btn btn-danger btn-sm" onClick={() => onChange('')}>Remove</button></>}
    </div>
  )
}
