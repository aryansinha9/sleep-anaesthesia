import sanitizeHtml from 'sanitize-html'

// Rich text is restricted to a fixed vocabulary so admin content can never
// carry its own layout, styling or scripts. Applied on save AND on render.

const SAFE_HREF = /^(https?:\/\/|mailto:|tel:|\/(?!\/)|#)/i

function options(variant: 'full' | 'basic'): sanitizeHtml.IOptions {
  return {
    allowedTags: [...(variant === 'full' ? ['h2', 'h3'] : []), 'p', 'br', 'strong', 'b', 'em', 'i', 'ul', 'ol', 'li', 'a'],
    allowedAttributes: { a: ['href'] },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowProtocolRelative: false,
    transformTags: {
      b: 'strong',
      i: 'em',
      // Demote any heading the editor could not have produced.
      ...(variant === 'full' ? { h1: 'h2', h4: 'h3', h5: 'h3', h6: 'h3' } : { h1: 'p', h2: 'p', h3: 'p', h4: 'p', h5: 'p', h6: 'p' }),
      a: (tagName, attribs) => {
        const href = (attribs.href || '').trim()
        const safe: Record<string, string> = SAFE_HREF.test(href) ? { href } : {}
        return { tagName, attribs: safe }
      },
    },
    exclusiveFilter: (frame) => frame.tag === 'p' && !frame.text.trim() && !frame.mediaChildren?.length,
  }
}

export function sanitizeRichText(html: string, variant: 'full' | 'basic' = 'full'): string {
  return sanitizeHtml(html || '', options(variant)).trim()
}

/** Plain-text fields: strip every tag and collapse whitespace. */
export function toPlainText(value: string): string {
  return sanitizeHtml(value || '', { allowedTags: [], allowedAttributes: {} })
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
}

export function richTextLength(html: string): number {
  return toPlainText(html).length
}
