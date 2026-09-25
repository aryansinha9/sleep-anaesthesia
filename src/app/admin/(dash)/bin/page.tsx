import { BinActions } from '@/components/admin/BinActions'
import { COLLECTION_BY_KEY } from '@/content/collections'
import { entryTitle, listDeleted } from '@/lib/admin/queries'
import { requireStaffPage } from '@/lib/auth'

export default async function BinPage() {
  const staff = await requireStaffPage()
  const items = (await listDeleted()).filter((e) => !COLLECTION_BY_KEY[e.collection].adminOnly || staff.role === 'admin')
  return (
    <>
      <h1>Bin</h1>
      <p className="lead">Deleted items stay here for 30 days and can be restored. After that they are removed permanently.{staff.role === 'admin' ? ' Admins can also delete items permanently now.' : ''}</p>
      {items.length === 0 ? <div className="adm-card"><p style={{ margin: 0 }}>The bin is empty.</p></div> : (
        <div className="adm-scroll">
          <table className="adm-table">
            <thead><tr><th>Item</th><th>Type</th><th>Deleted</th><th>Days left</th><th><span className="visually-hidden">Actions</span></th></tr></thead>
            <tbody>
              {items.map((e) => {
                const left = Math.max(0, 30 - Math.floor((Date.now() - new Date(e.deletedAt!).getTime()) / 86_400_000))
                return (
                  <tr key={e.id}>
                    <td className="title">{entryTitle(e)}</td>
                    <td>{COLLECTION_BY_KEY[e.collection].singular}</td>
                    <td>{new Date(e.deletedAt!).toLocaleDateString('en-AU')}</td>
                    <td>{left}</td>
                    <td><BinActions collection={e.collection} id={e.id} canPurge={staff.role === 'admin'} /></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
