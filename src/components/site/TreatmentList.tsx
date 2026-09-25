import Link from 'next/link'
import type { Treatment } from '@/content/types'

/** Responsive treatment list: one column on phones, more as space allows. */
export function TreatmentList({ treatments, extra = [] }: { treatments: Treatment[]; extra?: string[] }) {
  if (!treatments.length && !extra.length) return null
  return (
    <ul className="treatment-list">
      {treatments.map((t) => <li key={t.slug}><Link href={`/treatments/${t.slug}`}>{t.menuLabel}</Link></li>)}
      {extra.map((e) => <li key={e}><span className="item">{e}</span></li>)}
    </ul>
  )
}
