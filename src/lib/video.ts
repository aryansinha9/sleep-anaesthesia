// YouTube / Vimeo link parsing. Only these two hosts are accepted; anything
// else (including pasted <iframe> embed code) is rejected.

export type ParsedVideo = { provider: 'youtube' | 'vimeo'; id: string }

const YT_ID = /^[A-Za-z0-9_-]{11}$/
const VIMEO_ID = /^\d{6,12}$/

export function parseVideoUrl(input: string): ParsedVideo | null {
  const raw = (input || '').trim()
  if (!raw || raw.includes('<')) return null
  let url: URL
  try {
    url = new URL(raw)
  } catch {
    return null
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null
  const host = url.hostname.toLowerCase().replace(/^www\./, '').replace(/^m\./, '')
  const parts = url.pathname.split('/').filter(Boolean)

  if (host === 'youtu.be') {
    return YT_ID.test(parts[0] || '') ? { provider: 'youtube', id: parts[0] } : null
  }
  if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    let id: string | null = null
    if (parts[0] === 'watch') id = url.searchParams.get('v')
    else if (['embed', 'shorts', 'live', 'v'].includes(parts[0])) id = parts[1] || null
    return id && YT_ID.test(id) ? { provider: 'youtube', id } : null
  }
  if (host === 'vimeo.com' || host === 'player.vimeo.com') {
    const id = [...parts].reverse().find((p) => VIMEO_ID.test(p))
    return id ? { provider: 'vimeo', id } : null
  }
  return null
}

export function embedUrl(v: ParsedVideo): string {
  return v.provider === 'youtube'
    ? `https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0&modestbranding=1`
    : `https://player.vimeo.com/video/${v.id}?autoplay=1&dnt=1`
}

export function youtubeThumbnail(id: string): string {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
}
