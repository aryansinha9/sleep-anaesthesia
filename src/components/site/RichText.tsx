import { sanitizeRichText } from '@/lib/sanitize'

// Dashboard rich text is sanitised again at render time (defence in depth).
export function RichText({ html, variant = 'full', className = 'prose' }: { html: string; variant?: 'full' | 'basic'; className?: string }) {
  const clean = sanitizeRichText(html, variant)
  if (!clean) return null
  return <div className={className} dangerouslySetInnerHTML={{ __html: clean }} />
}
