'use client'

import { useActionState } from 'react'
import { signIn } from '../actions/auth'

export function LoginForm() {
  const [state, action, pending] = useActionState(signIn, null)
  return (
    <form action={action} className="adm-form" style={{ gap: 14 }}>
      <div className="adm-field">
        <label htmlFor="email">Email</label>
        <input className="input" id="email" name="email" type="email" autoComplete="username" required />
      </div>
      <div className="adm-field">
        <label htmlFor="password">Password</label>
        <input className="input" id="password" name="password" type="password" autoComplete="current-password" required />
      </div>
      {state && !state.ok && <p className="notice error" role="alert">{state.error}</p>}
      <button className="btn btn-primary" disabled={pending}>{pending ? 'Signing in…' : 'Sign in'}</button>
    </form>
  )
}
