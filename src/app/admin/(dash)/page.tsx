import Link from 'next/link'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { COLLECTION_BY_KEY, PLACEMENT_LABELS } from '@/content/collections'
import { MEDIA_SLOTS } from '@/content/slots'
import { entryTitle, listAllEntries } from '@/lib/admin/queries'
import { requireStaffPage } from '@/lib/auth'

// Dashboard home: what's missing, what's waiting to be published.
export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const staff = await requireStaffPage()
  const all = await listAllEntries()
  const live = (c: string) => all.filter((e) => e.collection === c && e.publishedData)
  const sp = await searchParams

  const videos = live('videos').map((e) => e.publishedData!)
  const media = live('media').map((e) => e.publishedData!)
  const videoSlots = (['clinics_overview', 'general_anaesthesia', 'iv_sedation', 'patient_info'] as const).map((p) => ({
    key: p, label: PLACEMENT_LABELS[p], filled: videos.some((v) => v.placement === p && v.visible),
  }))
  const photoSlots = MEDIA_SLOTS.map((s) => ({ ...s, count: media.filter((m) => m.slot === s.key && m.image).length }))
  const settings = live('settings')[0]?.publishedData as Record<string, unknown> | undefined
  const towns = all.filter((e) => e.collection === 'locations' && e.data.kind === 'town')
  const pending = all.filter((e) => e.status !== 'live')

  const setupTodo = [
    !settings?.phone && 'Phone number is blank, so the phone line is hidden on the site.',
    !settings?.googleReviewUrl && 'No Google review link yet.',
    !settings?.googleBusinessProfileUrl && 'No Google Business Profile link yet.',
    (!settings?.chatProvider || settings.chatProvider === 'none') && 'Chat widget is off.',
  ].filter(Boolean) as string[]

  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Dashboard</h1>
          <p className="lead">Empty spaces are hidden on the live site until you add content. Nothing you save as a draft changes the live site until you publish it.</p>
        </div>
        <Link className="btn btn-secondary" href="/" target="_blank">View live site ↗</Link>
      </div>
      {sp.error === 'admin-only' && <p className="notice error" style={{ marginBottom: 16 }}>That page is for admins only.</p>}

      <div className="adm-grid">
        <section className="adm-card">
          <h2>Videos</h2>
          <ul className="sortable" style={{ gap: 6 }}>
            {videoSlots.map((v) => (
              <li key={v.key} style={{ padding: '8px 10px' }}>
                <span className="t">{v.label}</span>
                {v.filled ? <span className="badge badge-live">Added</span> : <span className="badge badge-empty">Not yet added</span>}
              </li>
            ))}
          </ul>
          <p style={{ margin: '12px 0 0' }}><Link className="btn btn-primary btn-sm" href="/admin/content/videos/new">Add a video</Link></p>
        </section>

        <section className="adm-card">
          <h2>Photo spaces</h2>
          <ul className="sortable" style={{ gap: 6 }}>
            {photoSlots.map((s) => (
              <li key={s.key} style={{ padding: '8px 10px' }}>
                <span className="t">{s.label}</span>
                {s.count ? <span className="badge badge-live">{s.multiple ? `${s.count} photo${s.count > 1 ? 's' : ''}` : 'Added'}</span> : <span className="badge badge-empty">Empty</span>}
              </li>
            ))}
          </ul>
          <p style={{ margin: '12px 0 0' }}><Link className="btn btn-primary btn-sm" href="/admin/content/media/new">Add a photo</Link></p>
        </section>

        <section className="adm-card">
          <h2>Waiting to be published</h2>
          {pending.length === 0 ? <p className="muted" style={{ margin: 0 }}>Everything is published.</p> : (
            <ul className="sortable" style={{ gap: 6 }}>
              {pending.slice(0, 12).map((e) => (
                <li key={e.id} style={{ padding: '8px 10px' }}>
                  <span className="t"><Link href={COLLECTION_BY_KEY[e.collection].singleton ? `/admin/content/${e.collection}` : `/admin/content/${e.collection}/${e.id}`}>{entryTitle(e)}</Link><small>{COLLECTION_BY_KEY[e.collection].singular}</small></span>
                  <StatusBadge status={e.status} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="adm-card">
          <h2>Service areas</h2>
          <p className="muted" style={{ marginTop: 0 }}>{towns.filter((t) => t.data.active).length} of {towns.length} towns are marked as actively serviced. Only active towns appear on the site.</p>
          <Link className="btn btn-secondary btn-sm" href="/admin/content/locations">Manage locations</Link>
        </section>

        {staff.role === 'admin' && setupTodo.length > 0 && (
          <section className="adm-card">
            <h2>Site settings to finish</h2>
            <ul style={{ margin: '0 0 12px', paddingLeft: 18 }}>{setupTodo.map((t) => <li key={t}>{t}</li>)}</ul>
            <Link className="btn btn-secondary btn-sm" href="/admin/content/settings">Open site settings</Link>
          </section>
        )}
      </div>
    </>
  )
}
