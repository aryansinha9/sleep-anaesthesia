import type { SiteSettings } from '@/content/types'
import { groupedHours } from '@/lib/format'

export function Hours({ hours, caption }: { hours: SiteSettings['hours']; caption?: string }) {
  return (
    <table className="hours">
      {caption && <caption className="visually-hidden">{caption}</caption>}
      <tbody>
        {groupedHours(hours).map((r) => (
          <tr key={r.days}><th scope="row">{r.days}</th><td>{r.value}</td></tr>
        ))}
      </tbody>
    </table>
  )
}
