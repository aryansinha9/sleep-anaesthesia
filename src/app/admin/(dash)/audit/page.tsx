import { COLLECTION_BY_KEY, isCollectionKey } from '@/content/collections'
import type { CollectionKey } from '@/content/types'
import { requireStaffPage } from '@/lib/auth'
import { createSupabaseServerClient } from '@/lib/supabase/server'

const ACTIONS: Record<string, string> = {
  create: 'Created draft', 'create+publish': 'Created and published', 'update-draft': 'Saved draft', publish: 'Published', unpublish: 'Unpublished',
  'discard-draft': 'Discarded draft', delete: 'Moved to bin', restore: 'Restored', 'delete-permanently': 'Deleted permanently', update: 'Updated',
  'invite-user': 'Invited user', 'remove-user': 'Removed user', 'disable-user': 'Removed access', 'enable-user': 'Restored access', 'change-role': 'Changed role',
}

export default async function AuditPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  await requireStaffPage('admin')
  const page = Math.max(0, Number((await searchParams).page || 0) || 0)
  const db = await createSupabaseServerClient()
  const { data } = await db.from('audit_log').select('*').order('at', { ascending: false }).range(page * 100, page * 100 + 99)
  return (
    <>
      <h1>Activity log</h1>
      <p className="lead">Every create, edit, publish and delete, with who did it and when. Entries cannot be edited or removed.</p>
      <div className="adm-scroll">
        <table className="adm-table">
          <thead><tr><th>When</th><th>Who</th><th>What</th><th>Item</th></tr></thead>
          <tbody>
            {(data || []).map((r) => (
              <tr key={r.id}>
                <td style={{ whiteSpace: 'nowrap' }}>{new Date(r.at).toLocaleString('en-AU', { dateStyle: 'medium', timeStyle: 'short' })}</td>
                <td>{r.actor_email || 'System'}</td>
                <td>{ACTIONS[r.action] || r.action}</td>
                <td className="title">{isCollectionKey(String(r.target)) ? COLLECTION_BY_KEY[String(r.target) as CollectionKey].singular : r.target}{r.summary ? `: ${r.summary}` : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="actions-bar" style={{ marginTop: 12 }}>
        {page > 0 && <a className="btn btn-secondary btn-sm" href={`?page=${page - 1}`}>← Newer</a>}
        {(data || []).length === 100 && <a className="btn btn-secondary btn-sm" href={`?page=${page + 1}`}>Older →</a>}
      </div>
    </>
  )
}
