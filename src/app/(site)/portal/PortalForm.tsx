'use client'

import { useActionState } from 'react'
import { unlockPortal, type PortalState } from '@/app/actions/portal'

export function PortalForm() {
  const [state, action, pending] = useActionState<PortalState, FormData>(unlockPortal, null)
  return (
    <form action={action} style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', alignItems: 'flex-end', marginTop: 'calc(1.5 * var(--leading))', maxWidth: 460 }}>
      <div className="field" style={{ flex: '1 1 240px' }}>
        <label htmlFor="p-code">Clinic access code</label>
        <input className="input" id="p-code" name="code" autoComplete="off" autoCapitalize="characters" spellCheck={false} placeholder="XXXXX-XXXXX" required maxLength={40} />
      </div>
      <button type="submit" className="btn btn-primary" disabled={pending}>{pending ? 'Checking…' : 'Enter portal'}</button>
      {state?.error && <p className="form-error" role="alert" style={{ flexBasis: '100%' }}>{state.error}</p>}
    </form>
  )
}
