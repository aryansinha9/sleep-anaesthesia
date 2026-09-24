'use client'

import { useRouter } from 'next/navigation'
import { purgeEntry, restoreEntry } from '@/app/admin/actions/content'
import { ConfirmButton } from './Confirm'
import { useResultToast } from './Toast'

export function BinActions({ collection, id, canPurge }: { collection: string; id: string; canPurge: boolean }) {
  const router = useRouter()
  const show = useResultToast()
  return (
    <div className="actions-bar" style={{ justifyContent: 'flex-end' }}>
      <ConfirmButton className="btn btn-secondary btn-sm" label="Restore" title="Restore this item?" confirmLabel="Restore"
        body={<p style={{ margin: 0 }}>It comes back with the same status it had before (published items go live again).</p>}
        onConfirm={async () => { if (show(await restoreEntry(collection, id))) router.refresh() }} />
      {canPurge && (
        <ConfirmButton className="btn btn-danger btn-sm" danger label="Delete permanently" title="Delete permanently?" confirmLabel="Delete forever"
          body={<p style={{ margin: 0 }}>This cannot be undone. The item and its version history will be erased.</p>}
          onConfirm={async () => { if (show(await purgeEntry(collection, id))) router.refresh() }} />
      )}
    </div>
  )
}
