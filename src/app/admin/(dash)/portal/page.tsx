import { NewPortalCode, PortalCodeActions } from '@/components/admin/PortalAdmin'
import { requireStaffPage } from '@/lib/auth'
import { createSupabaseServerClient } from '@/lib/supabase/server'

const fmt = (d: string | null) => (d ? new Date(d).toLocaleString('en-AU', { dateStyle: 'medium', timeStyle: 'short' }) : 'Never')

export default async function PortalCodesPage() {
  await requireStaffPage('admin')
  const db = await createSupabaseServerClient()
  const { data, error } = await db.from('portal_access_codes').select('id, clinic_name, active, created_at, last_used_at').order('created_at', { ascending: false })
  return (
    <>
      <h1>Clinic portal codes</h1>
      <p className="lead">The dental portal holds the general anaesthesia clinic suitability requirements and site logistics. Give each partner clinic its own code, so you can switch one clinic off without affecting the others.</p>
      {error ? (
        <p className="notice error">The portal table hasn&apos;t been set up in the database yet. Run the migration <code>supabase/migrations/20261001000000_portal_access_codes.sql</code> (see ADMIN_SETUP.md).</p>
      ) : (
        <>
          <div className="adm-card" style={{ marginBottom: 16 }}>
            <h2>New access code</h2>
            <NewPortalCode />
          </div>
          {!data?.length ? <div className="adm-card"><p style={{ margin: 0 }}>No access codes yet.</p></div> : (
            <div className="adm-scroll">
              <table className="adm-table">
                <thead><tr><th>Clinic</th><th>Status</th><th>Created</th><th>Last used</th><th><span className="visually-hidden">Actions</span></th></tr></thead>
                <tbody>
                  {data.map((c) => (
                    <tr key={c.id}>
                      <td className="title">{c.clinic_name}</td>
                      <td>{c.active ? <span className="badge badge-live">On</span> : <span className="badge badge-hidden">Off</span>}</td>
                      <td>{fmt(c.created_at)}</td>
                      <td>{fmt(c.last_used_at)}</td>
                      <td><PortalCodeActions id={c.id} active={c.active} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </>
  )
}
