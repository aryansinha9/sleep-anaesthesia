import { notFound, redirect } from 'next/navigation'
import { EntryEditor } from '@/components/admin/EntryEditor'
import { COLLECTION_BY_KEY, isCollectionKey } from '@/content/collections'
import { emptyEntry, pathFor } from '@/lib/admin/defaults'
import { getEntry, getVersions } from '@/lib/admin/queries'
import { requireStaffPage } from '@/lib/auth'

export default async function EntryPage({ params, searchParams }: { params: Promise<{ collection: string; id: string }>; searchParams: Promise<{ slot?: string; placement?: string }> }) {
  const { collection, id } = await params
  if (!isCollectionKey(collection)) notFound()
  const def = COLLECTION_BY_KEY[collection]
  if (def.singleton) redirect(`/admin/content/${collection}`)
  const staff = await requireStaffPage(def.adminOnly ? 'admin' : 'editor')

  if (id === 'new') {
    const sp = await searchParams
    const initial = emptyEntry(collection)
    if (collection === 'media' && sp.slot) initial.slot = sp.slot
    if (collection === 'videos' && sp.placement) initial.placement = sp.placement
    return <EntryEditor def={{ key: collection }} id={null} initial={initial} status="draft" previewPath={null} versions={[]} isAdmin={staff.role === 'admin'} />
  }

  const entry = await getEntry(collection, id)
  if (!entry) notFound()
  const versions = await getVersions(entry.id)
  return (
    <EntryEditor
      def={{ key: collection }}
      id={entry.id}
      initial={{ ...emptyEntry(collection), ...entry.data }}
      status={entry.status}
      previewPath={pathFor(collection, entry.data)}
      versions={versions.map((v) => ({ id: v.id, kind: v.kind, createdAt: v.createdAt, by: v.by }))}
      isAdmin={staff.role === 'admin'}
    />
  )
}
