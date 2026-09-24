import type { Faq } from '@/content/types'
import { sanitizeRichText, toPlainText } from '@/lib/sanitize'
import { FaqList } from './FaqList'

const CATEGORY_LABELS: Record<string, string> = {
  pay: 'Payment & Medicare', iv: 'IV sedation', ga: 'General anaesthesia',
  book: 'Booking & scheduling', clin: 'Clinical & safety', admin: 'Billing & admin',
}

export function FaqSection({ faqs, kicker, title, searchLabel, placeholder, id = 'faq' }: { faqs: Faq[]; kicker: string; title: string; searchLabel: string; placeholder: string; id?: string }) {
  if (!faqs.length) return null
  const cats = [...new Set(faqs.map((f) => f.category))]
  const items = faqs.map((f) => {
    const answerHtml = sanitizeRichText(f.answer, 'basic')
    return { question: f.question, answerHtml, category: f.category, text: (f.question + ' ' + toPlainText(answerHtml)).toLowerCase() }
  })
  return (
    <section id={id} className="section">
      <span className="kicker">{kicker}</span>
      <h2 className="section-title">{title}</h2>
      <FaqList items={items} categories={cats.map((c) => ({ value: c, label: CATEGORY_LABELS[c] || c }))} searchLabel={searchLabel} placeholder={placeholder} />
    </section>
  )
}
