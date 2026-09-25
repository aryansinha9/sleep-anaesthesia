'use client'

import { useActionState } from 'react'
import { requestPasswordReset } from '../actions/auth'

export function ForgotForm() {
  const [state, action, pending] = useActionState(requestPasswordReset, null)
  if (state?.ok) return <p className="notice ok" role="status">{state.message}</p>
  return (
    <form action={action} className="adm-form" style={{ gap: 14 }}>
      <div className="adm-field">
        <label htmlFor="email">Email</label>
        <input className="input" id="email" name="email" type="email" autoComplete="username" required />
      </div>
      {state && !state.ok && <p className="notice error" role="alert">{state.error}</p>}
      <button className="btn btn-primary" disabled={pending}>{pending ? 'Sending…' : 'Send reset link'}</button>
    </form>
  )
}
