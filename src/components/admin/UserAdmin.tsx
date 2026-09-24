'use client'

import { useRouter } from 'next/navigation'
import { useActionState, useEffect, useRef } from 'react'
import { changeRole, inviteUser, resetUserMfa, setUserDisabled } from '@/app/admin/actions/users'
import { ConfirmButton } from './Confirm'
import { useResultToast } from './Toast'

export function InviteForm() {
  const [state, action, pending] = useActionState(inviteUser, null)
  const show = useResultToast()
  const form = useRef<HTMLFormElement>(null)
  useEffect(() => { if (state) { show(state); if (state.ok) form.current?.reset() } }, [state, show])
  return (
    <form ref={form} action={action} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
      <div className="adm-field" style={{ flex: '1 1 240px' }}>
        <label htmlFor="inv-email">Email</label>
        <input className="input" id="inv-email" name="email" type="email" required />
      </div>
      <div className="adm-field">
        <label htmlFor="inv-role">Role</label>
        <select className="input" id="inv-role" name="role" defaultValue="editor"><option value="editor">Editor</option><option value="admin">Admin</option></select>
      </div>
      <button className="btn btn-primary" disabled={pending}>{pending ? 'Sending…' : 'Send invitation'}</button>
    </form>
  )
}

export function UserRowActions({ userId, role, disabled }: { userId: string; role: string; disabled: boolean }) {
  const router = useRouter()
  const show = useResultToast()
  const other = role === 'admin' ? 'editor' : 'admin'
  return (
    <div className="actions-bar" style={{ justifyContent: 'flex-end' }}>
      <ConfirmButton className="btn btn-secondary btn-sm" label={`Make ${other}`} title={`Change role to ${other}?`} confirmLabel="Change role"
        body={<p style={{ margin: 0 }}>{other === 'admin' ? 'Admins can change settings, manage users and permanently delete content.' : 'Editors can manage content and media only.'}</p>}
        onConfirm={async () => { if (show(await changeRole(userId, other))) router.refresh() }} />
      <ConfirmButton className="btn btn-secondary btn-sm" label="Reset 2FA" title="Reset two-factor authentication?" confirmLabel="Reset"
        body={<p style={{ margin: 0 }}>Use this if they lost their phone. They will set up a new authenticator app at their next sign-in.</p>}
        onConfirm={async () => { if (show(await resetUserMfa(userId))) router.refresh() }} />
      <ConfirmButton className={disabled ? 'btn btn-secondary btn-sm' : 'btn btn-danger btn-sm'} danger={!disabled} label={disabled ? 'Restore access' : 'Remove access'}
        title={disabled ? 'Restore access?' : 'Remove dashboard access?'} confirmLabel={disabled ? 'Restore' : 'Remove access'}
        body={<p style={{ margin: 0 }}>{disabled ? 'They will be able to sign in again.' : 'They will lose access immediately. Their past changes stay in the activity log.'}</p>}
        onConfirm={async () => { if (show(await setUserDisabled(userId, !disabled))) router.refresh() }} />
    </div>
  )
}
