'use client'

import { useRouter } from 'next/navigation'
import { useActionState, useEffect, useRef } from 'react'
import { createPortalCode, deletePortalCode, setPortalCodeActive } from '@/app/admin/actions/portal'
import { ConfirmButton } from './Confirm'
import { useResultToast } from './Toast'

export function NewPortalCode() {
  const [state, action, pending] = useActionState(createPortalCode, null)
  const show = useResultToast()
  const form = useRef<HTMLFormElement>(null)
  useEffect(() => { if (state) { show(state); if (state.ok) form.current?.reset() } }, [state, show])
  return (
    <>
      <form ref={form} action={action} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div className="adm-field" style={{ flex: '1 1 280px' }}>
          <label htmlFor="pc-clinic">Clinic name</label>
          <input className="input" id="pc-clinic" name="clinic" maxLength={120} required placeholder="e.g. Smith Street Dental" />
        </div>
        <button className="btn btn-primary" disabled={pending}>{pending ? 'Creating…' : 'Create access code'}</button>
      </form>
      {state?.ok && (
        <div className="notice ok" style={{ marginTop: 14 }} role="status">
          <p style={{ margin: '0 0 6px' }}>Access code for <strong>{state.data.clinic}</strong>. Copy it now and send it to the clinic; for security it won&apos;t be shown again.</p>
          <code style={{ fontSize: 22, letterSpacing: '0.12em', fontWeight: 700 }}>{state.data.code}</code>
        </div>
      )}
    </>
  )
}

export function PortalCodeActions({ id, active }: { id: string; active: boolean }) {
  const router = useRouter()
  const show = useResultToast()
  return (
    <div className="actions-bar" style={{ justifyContent: 'flex-end' }}>
      <ConfirmButton className="btn btn-secondary btn-sm" label={active ? 'Switch off' : 'Switch on'} title={active ? 'Switch this code off?' : 'Switch this code on?'} confirmLabel={active ? 'Switch off' : 'Switch on'}
        body={<p style={{ margin: 0 }}>{active ? 'The clinic will no longer be able to open the portal, including any browser already signed in.' : 'The clinic will be able to use this code again.'}</p>}
        onConfirm={async () => { if (show(await setPortalCodeActive(id, !active))) router.refresh() }} />
      <ConfirmButton className="btn btn-danger btn-sm" danger label="Delete" title="Delete this code?" confirmLabel="Delete" body={<p style={{ margin: 0 }}>This cannot be undone. Create a new code if the clinic needs access again.</p>}
        onConfirm={async () => { if (show(await deletePortalCode(id))) router.refresh() }} />
    </div>
  )
}
