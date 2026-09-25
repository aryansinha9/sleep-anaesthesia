'use client'

import { useMemo, useState } from 'react'

type Item = { question: string; answerHtml: string; category: string; text: string }

// Searchable, filterable FAQ list. All answers are in the server-rendered
// HTML (crawlable); filtering only hides items in the browser.
export function FaqList({ items, categories, searchLabel, placeholder }: { items: Item[]; categories: { value: string; label: string }[]; searchLabel: string; placeholder: string }) {
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('all')
  const labels = Object.fromEntries(categories.map((c) => [c.value, c.label]))
  const needle = q.trim().toLowerCase()
  const shown = useMemo(() => items.map((it) => (cat === 'all' || it.category === cat) && (!needle || it.text.includes(needle))), [items, cat, needle])
  const count = shown.filter(Boolean).length
  const name = `faqcat-${searchLabel.replace(/\W+/g, '')}`
  return (
    <>
      <div className="faq-tools">
        <div className="faq-search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
          <input className="input" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={placeholder} aria-label={searchLabel} />
        </div>
        {categories.length > 1 && (
          <div className="seg" role="radiogroup" aria-label="Filter by category">
            {[{ value: 'all', label: 'All' }, ...categories].map((c) => (
              <label className="seg-opt" key={c.value}>
                <input type="radio" name={name} value={c.value} checked={cat === c.value} onChange={() => setCat(c.value)} />
                <span>{c.label}</span>
              </label>
            ))}
          </div>
        )}
        <span className="faq-count" aria-live="polite">{count} of {items.length} questions</span>
      </div>
      {items.map((it, i) => (
        <details className="qa" key={i} hidden={!shown[i]} open={needle.length >= 3 && shown[i] ? true : undefined}>
          <summary>
            <span>{categories.length > 1 && <span className="qa-cat">{labels[it.category]}</span>}{it.question}</span>
            <span className="qa-mark" aria-hidden="true">+</span>
          </summary>
          <div className="qa-body" dangerouslySetInnerHTML={{ __html: it.answerHtml }} />
        </details>
      ))}
      {count === 0 && <p className="faq-empty">No questions match your search. Try a different word, or <a href="/contact">ask us directly</a>.</p>}
    </>
  )
}
