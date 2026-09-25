import { EnquiryActions } from '@/components/admin/EnquiryActions'
import { requireStaffPage } from '@/lib/auth'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export default async function EnquiriesPage() {
  await requireStaffPage('admin')
  const db = await createSupabaseServerClient()
  const { data } = await db.from('enquiries').select('*').order('created_at', { ascending: false }).limit(200)
  return (
    <>
      <h1>Enquiries</h1>
      <p className="lead">Messages sent through the website&apos;s enquiry forms (most recent 200).</p>
      {!data?.length ? <div className="adm-card"><p style={{ margin: 0 }}>No enquiries yet.</p></div> : (
        <div style={{ display: 'grid', gap: 12 }}>
          {data.map((e) => (
            <article className="adm-card" key={e.id} style={{ opacity: e.handled_at ? 0.7 : 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <div>
                  <strong>{e.name}</strong>{e.clinic && <> · {e.clinic}</>} <span className={`badge ${e.audience === 'clinic' ? 'badge-changes' : 'badge-hidden'}`}>{e.audience === 'clinic' ? 'Dental clinic' : 'Patient'}</span>
                  <div className="muted" style={{ fontSize: 13 }}>{new Date(e.created_at).toLocaleString('en-AU', { dateStyle: 'medium', timeStyle: 'short' })} · from {e.page || 'website'}</div>
                </div>
                <EnquiryActions id={e.id} handled={Boolean(e.handled_at)} />
              </div>
              <p style={{ margin: '10px 0 6px' }}>{e.email && <a href={`mailto:${e.email}`}>{e.email}</a>}{e.email && e.phone && ' · '}{e.phone && <a href={`tel:${e.phone.replace(/[^\d+]/g, '')}`}>{e.phone}</a>}</p>
              {e.message && <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{e.message}</p>}
            </article>
          ))}
        </div>
      )}
    </>
  )
}
