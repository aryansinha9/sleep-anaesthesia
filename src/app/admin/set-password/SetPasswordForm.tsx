'use client'

import { useActionState } from 'react'
import { setPassword } from '../actions/auth'

export function SetPasswordForm() {
  const [state, action, pending] = useActionState(setPassword, null)
  return (
    <form action={action} className="adm-form" style={{ gap: 14 }}>
      <div className="adm-field">
        <label htmlFor="password">New password</label>
        <input className="input" id="password" name="password" type="password" autoComplete="new-password" minLength={12} required />
      </div>
      <div className="adm-field">
        <label htmlFor="confirm">Confirm password</label>
        <input className="input" id="confirm" name="confirm" type="password" autoComplete="new-password" minLength={12} required />
      </div>
      {state && !state.ok && <p className="notice error" role="alert">{state.error}</p>}
      <button className="btn btn-primary" disabled={pending}>{pending ? 'Saving…' : 'Save password'}</button>
    </form>
  )
}
