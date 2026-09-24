import type { EntryStatus } from '@/lib/admin/queries'

const LABELS: Record<EntryStatus, [string, string]> = {
  live: ['badge-live', 'Published'],
  changes: ['badge-changes', 'Unpublished changes'],
  draft: ['badge-draft', 'Draft (not live)'],
}

export function StatusBadge({ status }: { status: EntryStatus }) {
  const [cls, label] = LABELS[status]
  return <span className={`badge ${cls}`}>{label}</span>
}
