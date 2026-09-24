// Environment access. Public values only; the service role key is read in
// src/lib/supabase/admin.ts, which is server-only.

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://sleepanaesthesia.com.au').replace(/\/$/, '')
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)

export const PUBLIC_MEDIA_PREFIX = SUPABASE_URL ? `${SUPABASE_URL}/storage/v1/object/public/public-media/` : ''

const EXTERNAL_IMAGE_HOSTS = ['https://i.ytimg.com/', 'https://i.vimeocdn.com/']

/** Only images we host (seed files or our storage bucket) or video thumbnails may render. */
export function isAllowedMediaSrc(src: string): boolean {
  if (!src) return false
  if (src.startsWith('/uploads/') && !src.includes('..')) return true
  if (PUBLIC_MEDIA_PREFIX && src.startsWith(PUBLIC_MEDIA_PREFIX)) return true
  return EXTERNAL_IMAGE_HOSTS.some((h) => src.startsWith(h))
}

export function isOwnStorageUrl(src: string, ext: string): boolean {
  return Boolean(PUBLIC_MEDIA_PREFIX) && src.startsWith(PUBLIC_MEDIA_PREFIX) && src.toLowerCase().endsWith(ext) && !src.includes('..')
}
