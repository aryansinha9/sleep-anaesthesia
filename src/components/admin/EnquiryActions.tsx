'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { deleteEnquiry, setEnquiryHandled } from '@/app/admin/actions/enquiries'
import { ConfirmButton } from './Confirm'
import { useResultToast } from './Toast'

export function EnquiryActions({ id, handled }: { id: string; handled: boolean }) {
  const router = useRouter()
  const show = useResultToast()
  const [pending, start] = useTransition()
  return (
    <div className="actions-bar">
      <button type="button" className="btn btn-secondary btn-sm" disabled={pending} onClick={() => start(async () => { if (show(await setEnquiryHandled(id, !handled))) router.refresh() })}>{handled ? 'Mark as new' : 'Mark handled'}</button>
      <ConfirmButton className="btn btn-danger btn-sm" danger label="Delete" title="Delete this enquiry?" confirmLabel="Delete" body={<p style={{ margin: 0 }}>This cannot be undone.</p>}
        onConfirm={async () => { if (show(await deleteEnquiry(id))) router.refresh() }} />
    </div>
  )
}
