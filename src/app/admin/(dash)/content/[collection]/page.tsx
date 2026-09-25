import Link from 'next/link'
import { notFound } from 'next/navigation'
import { EntryEditor } from '@/components/admin/EntryEditor'
import { EntryList, type ListRow } from '@/components/admin/EntryList'
import { COLLECTION_BY_KEY, isCollectionKey, PLACEMENT_LABELS } from '@/content/collections'
import { SEED } from '@/content/seed'
import { SLOT_BY_KEY } from '@/content/slots'
import type { CollectionKey } from '@/content/types'
import { pathFor } from '@/lib/admin/defaults'
import { entryTitle, getSingleton, getVersions, listEntries, type AdminEntry } from '@/lib/admin/queries'
import { requireStaffPage } from '@/lib/auth'

function subtitle(collection: CollectionKey, d: Record<string, unknown>): string {
  switch (collection) {
    case 'treatments': return `/treatments/${d.slug}${d.visibleInMenu ? '' : ' · hidden from menu'}`
    case 'locations': return d.kind === 'primary' ? `Main area · ${d.state} · has page` : `Town · ${d.region} · ${d.active ? 'active' : 'inactive'}${d.hasPage ? ' · has page' : ''}`
    case 'videos': return `${PLACEMENT_LABELS[String(d.placement)] || ''} · ${String(d.source).toUpperCase()}${d.visible ? '' : ' · hidden'}`
    case 'media': return SLOT_BY_KEY[String(d.slot)]?.label || String(d.slot)
    case 'faqs': return `${d.page === 'clinics' ? 'Dental clinics' : 'Patient info'} · ${d.category}`
    case 'testimonials': return d.visible ? 'Visible' : 'Hidden'
    default: return ''
  }
}

function thumbOf(d: Record<string, unknown>): string | null {
  const img = (d.image || d.poster || d.before) as { src?: string } | null
  return img?.src || null
}

export default async function CollectionPage({ params }: { params: Promise<{ collection: string }> }) {
  const { collection } = await params
  if (!isCollectionKey(collection)) notFound()
  const def = COLLECTION_BY_KEY[collection]
  const staff = await requireStaffPage(def.adminOnly ? 'admin' : 'editor')

  if (def.singleton) {
    const entry = await getSingleton(collection)
    const versions = entry ? await getVersions(entry.id) : []
    const initial = entry?.data ?? (SEED[collection][0] as unknown as Record<string, unknown>)
    return (
      <EntryEditor
        def={{ key: collection }}
        id={entry?.id ?? null}
        initial={{ ...(SEED[collection][0] as unknown as Record<string, unknown>), ...initial }}
        status={entry?.status ?? 'draft'}
        previewPath={pathFor(collection, initial)}
        versions={versions.map((v) => ({ id: v.id, kind: v.kind, createdAt: v.createdAt, by: v.by }))}
        isAdmin={staff.role === 'admin'}
      />
    )
  }

  const entries: AdminEntry[] = await listEntries(collection)
  const rows: ListRow[] = entries.map((e) => ({ id: e.id, title: entryTitle(e), subtitle: subtitle(collection, e.data), status: e.status, thumb: thumbOf(e.data) }))
  return (
    <>
      <div className="adm-head">
        <div>
          <h1>{def.label}</h1>
          <p className="lead">{def.description}</p>
        </div>
        <Link className="btn btn-primary" href={`/admin/content/${collection}/new`}>Add {def.singular.toLowerCase()}</Link>
      </div>
      {rows.length === 0 ? (
        <div className="adm-card"><p style={{ margin: 0 }}>Nothing here yet. <Link href={`/admin/content/${collection}/new`}>Add the first {def.singular.toLowerCase()}</Link>.</p></div>
      ) : (
        <EntryList collection={collection} rows={rows} sortable={Boolean(def.sortable)} />
      )}
    </>
  )
}
