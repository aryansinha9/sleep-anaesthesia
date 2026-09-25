'use client'

import { useState } from 'react'

// Unchanged behaviour from the previous site: the portal itself is not part
// of this brief, so the form still only shows the "incorrect password" note.
export function PortalForm() {
  const [error, setError] = useState(false)
  return (
    <form onSubmit={(e) => { e.preventDefault(); setError(true) }} style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', alignItems: 'flex-end', marginTop: 'calc(1.5 * var(--leading))', maxWidth: 460 }}>
      <div className="field" style={{ flex: '1 1 240px' }}>
        <label htmlFor="p-pass">Password</label>
        <input className="input" id="p-pass" type="password" required />
      </div>
      <button type="submit" className="btn btn-primary">Enter portal</button>
      {error && <p className="form-error" role="alert" style={{ flexBasis: '100%' }}>Incorrect password. Contact our team if you&apos;ve lost your access code.</p>}
    </form>
  )
}
