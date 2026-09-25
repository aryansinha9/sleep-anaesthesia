import type { DayKey, SiteSettings } from '@/content/types'

export const DAY_LABELS: [DayKey, string, string][] = [
  ['mon', 'Monday', 'Mon'], ['tue', 'Tuesday', 'Tue'], ['wed', 'Wednesday', 'Wed'], ['thu', 'Thursday', 'Thu'], ['fri', 'Friday', 'Fri'], ['sat', 'Saturday', 'Sat'], ['sun', 'Sunday', 'Sun'],
]

/** "09:00" → "9:00am" */
export function formatTime(t: string): string {
  const [h, m] = t.split(':').map(Number)
  const suffix = h >= 12 ? 'pm' : 'am'
  const hour = h % 12 || 12
  return `${hour}:${String(m).padStart(2, '0')}${suffix}`
}

/** Consecutive days with the same hours collapse into one row: "Monday – Friday". */
export function groupedHours(hours: SiteSettings['hours']): { days: string; value: string }[] {
  const rows: { from: string; to: string; value: string }[] = []
  for (const [key, long] of DAY_LABELS) {
    const h = hours[key]
    const value = h.closed ? 'Closed' : `${formatTime(h.open)} – ${formatTime(h.close)}`
    const last = rows[rows.length - 1]
    if (last && last.value === value) last.to = long
    else rows.push({ from: long, to: long, value })
  }
  return rows.map((r) => ({ days: r.from === r.to ? r.from : `${r.from} – ${r.to}`, value: r.value }))
}

export const formatMoney = (n: number) => '$' + n.toLocaleString('en-AU')

export const telHref = (phone: string) => 'tel:' + phone.replace(/[^\d+]/g, '')

export function fullAddress(s: Pick<SiteSettings, 'street' | 'suburb' | 'city' | 'state' | 'postcode'>) {
  return `${s.street}, ${s.suburb}, ${s.city}, ${s.state} ${s.postcode}`
}
