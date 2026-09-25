import 'server-only'
import { z } from 'zod'
import { isAllowedMediaSrc, isOwnStorageUrl } from '@/lib/env'
import { richTextLength, sanitizeRichText, toPlainText } from '@/lib/sanitize'
import { parseVideoUrl } from '@/lib/video'
import { COLLECTION_BY_KEY, type FieldDef } from './collections'
import type { CollectionData, CollectionKey } from './types'

// Server-side validation, generated from the same field registry as the
// admin forms. Every save goes through here: text is stripped of markup,
// rich text is sanitised, limits and required fields are enforced.

const PATTERNS = {
  phone: { re: /^[0-9 +()-]*$/, msg: 'Use digits, spaces, + ( ) and - only.' },
  postcode: { re: /^\d{4}$/, msg: 'Enter a 4-digit postcode.' },
  time: { re: /^([01]\d|2[0-3]):[0-5]\d$/, msg: 'Use 24-hour time, e.g. 09:00.' },
}

const TIME = z.string().regex(PATTERNS.time.re, PATTERNS.time.msg)

function required(field: FieldDef, s: z.ZodType<string>) {
  return field.required ? s.refine((v) => v.trim().length > 0, `${field.label} is required.`) : s
}

function textSchema(field: Extract<FieldDef, { type: 'text' | 'textarea' }>) {
  let s = z
    .string()
    .default('')
    .transform((v) => toPlainText(v).replace(field.type === 'text' ? /\s+/g : /[ \t]+/g, ' ').trim())
    .pipe(z.string().max(field.max, `${field.label} must be ${field.max} characters or fewer.`)) as z.ZodType<string>
  if (field.type === 'text' && field.pattern) {
    const p = PATTERNS[field.pattern]
    s = s.refine((v) => !v || p.re.test(v), p.msg)
  }
  return required(field, s)
}

function urlSchema(field: Extract<FieldDef, { type: 'url' }>) {
  return required(
    field,
    z
      .string()
      .default('')
      .transform((v) => v.trim())
      .refine((v) => {
        if (!v) return true
        if (field.allowRelative && /^\/(?!\/)[\w\-./#?=&%]*$/.test(v)) return true
        try {
          const u = new URL(v)
          if (u.protocol !== 'https:' && u.protocol !== 'http:') return false
          if (field.hosts) {
            const host = u.hostname.replace(/^www\./, '')
            return field.hosts.some((h) => host === h || host.endsWith('.' + h))
          }
          return true
        } catch {
          return false
        }
      }, field.allowRelative ? 'Enter a page on this site starting with / or a full https:// address.' : 'Enter a full web address starting with https://'),
  )
}

const imageSchema = (field: FieldDef) =>
  z
    .object({
      src: z.string().refine(isAllowedMediaSrc, 'Images must be uploaded through the dashboard.'),
      width: z.number().int().positive(),
      height: z.number().int().positive(),
      alt: z
        .string()
        .transform((v) => toPlainText(v).trim())
        .pipe(z.string().min(1, `Alt text is required for "${field.label}". Describe what the image shows.`).max(200, 'Alt text must be 200 characters or fewer.')),
      variants: z.array(z.object({ width: z.number().int().positive(), src: z.string().refine(isAllowedMediaSrc) })).max(8).optional(),
    })
    .nullable()
    .default(null)
    .refine((v) => !field.required || v !== null, `${field.label} is required.`)

function fieldSchema(field: FieldDef): z.ZodType {
  switch (field.type) {
    case 'text':
    case 'textarea':
      return textSchema(field)
    case 'richtext':
      return z
        .string()
        .default('')
        .transform((v) => sanitizeRichText(v, field.variant))
        .refine((v) => richTextLength(v) <= field.max, `${field.label} must be ${field.max} characters or fewer.`)
        .refine((v) => !field.required || richTextLength(v) > 0, `${field.label} is required.`)
    case 'number':
      return z.coerce.number().int('Whole numbers only.').min(field.min).max(field.max)
    case 'boolean':
      return z.boolean().default(false)
    case 'select':
      return z.enum(field.options.map((o) => o.value) as [string, ...string[]], { message: `Choose a valid option for ${field.label}.` })
    case 'slug':
      return z
        .string()
        .transform((v) => v.trim().toLowerCase())
        .pipe(z.string().min(1, 'Web address is required.').max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lower-case letters, numbers and single hyphens only.'))
    case 'url':
      return urlSchema(field)
    case 'email':
      return required(field, z.string().default('').transform((v) => v.trim()).refine((v) => !v || z.email().safeParse(v).success, 'Enter a valid email address.'))
    case 'date':
      return z.string().default('').refine((v) => !v || /^\d{4}-\d{2}-\d{2}$/.test(v), 'Enter a valid date.')
    case 'image':
      return imageSchema(field)
    case 'hours':
      return z.object(
        Object.fromEntries(
          ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map((d) => [
            d,
            z.object({ closed: z.boolean(), open: TIME, close: TIME }).refine((h) => h.closed || h.open < h.close, 'Closing time must be after opening time.'),
          ]),
        ),
      )
    case 'list':
      return z.array(z.object(Object.fromEntries(field.fields.map((f) => [f.name, fieldSchema(f)])))).max(field.maxItems, `${field.label}: ${field.maxItems} items at most.`).default([])
    case 'videofile':
      return z.string().default('').refine((v) => !v || isOwnStorageUrl(v, '.mp4'), 'Upload the video through the dashboard.')
    case 'captions':
      return z.string().default('').refine((v) => !v || isOwnStorageUrl(v, '.vtt'), 'Upload the captions file through the dashboard.')
  }
}

const CHAT_ID = {
  tawk: /^[a-f0-9]{24}\/[a-z0-9]{6,16}$/i,
  crisp: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
}

function collectionSchema(key: CollectionKey) {
  const def = COLLECTION_BY_KEY[key]
  const base = z.object(Object.fromEntries(def.fields.map((f) => [f.name, fieldSchema(f)])))
  return base.superRefine((raw, ctx) => {
    const v = raw as Record<string, unknown>
    if (key === 'videos') {
      if (v.source === 'upload') {
        if (!v.fileUrl) ctx.addIssue({ code: 'custom', path: ['fileUrl'], message: 'Upload an MP4 file.' })
        if (!v.poster) ctx.addIssue({ code: 'custom', path: ['poster'], message: 'A poster image is required for uploaded videos.' })
      } else {
        const parsed = parseVideoUrl(String(v.url || ''))
        if (!parsed || parsed.provider !== v.source)
          ctx.addIssue({ code: 'custom', path: ['url'], message: `Enter a valid ${v.source === 'vimeo' ? 'Vimeo' : 'YouTube'} link, e.g. ${v.source === 'vimeo' ? 'https://vimeo.com/123456789' : 'https://www.youtube.com/watch?v=…'}` })
      }
    }
    if (key === 'settings') {
      const provider = v.chatProvider as 'none' | 'tawk' | 'crisp'
      if (provider !== 'none' && !CHAT_ID[provider].test(String(v.chatId || '')))
        ctx.addIssue({ code: 'custom', path: ['chatId'], message: provider === 'tawk' ? 'Tawk.to IDs look like 64a1b2c3d4e5f6a7b8c9d0e1/1h2i3j4k5.' : 'Crisp Website IDs look like 1a2b3c4d-1a2b-1a2b-1a2b-1a2b3c4d5e6f.' })
    }
    if (key === 'banner' && v.enabled && !v.message)
      ctx.addIssue({ code: 'custom', path: ['message'], message: 'Enter a message, or switch the banner off.' })
    if (key === 'locations' && v.kind === 'town' && v.hasPage) {
      if (richTextLength(String(v.body || '')) < 300)
        ctx.addIssue({ code: 'custom', path: ['body'], message: 'A town page needs at least 300 characters of content specific to that town. Otherwise, turn off "Has its own page".' })
    }
  })
}

const cache = new Map<CollectionKey, z.ZodType>()

export type ValidationResult<K extends CollectionKey> =
  | { ok: true; data: CollectionData[K] }
  | { ok: false; errors: Record<string, string> }

export function validateEntry<K extends CollectionKey>(key: K, input: unknown): ValidationResult<K> {
  if (!cache.has(key)) cache.set(key, collectionSchema(key))
  const result = cache.get(key)!.safeParse(input)
  if (result.success) return { ok: true, data: result.data as CollectionData[K] }
  const errors: Record<string, string> = {}
  for (const issue of result.error.issues) {
    const path = issue.path.join('.') || '_form'
    if (!errors[path]) errors[path] = issue.message
  }
  return { ok: false, errors }
}
