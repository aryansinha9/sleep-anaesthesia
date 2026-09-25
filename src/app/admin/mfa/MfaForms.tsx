'use client'

import { useState, useTransition } from 'react'
import { startMfaEnrollment, verifyMfa } from '../actions/auth'

function CodeForm({ factorId, label }: { factorId: string; label: string }) {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [pending, start] = useTransition()
  return (
    <form className="adm-form" style={{ gap: 12 }} onSubmit={(e) => {
      e.preventDefault()
      setError('')
      start(async () => { const r = await verifyMfa(factorId, code); if (r && !r.ok) setError(r.error) })
    }}>
      <div className="adm-field">
        <label htmlFor="code">{label}</label>
        <input className="input" id="code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} required autoFocus style={{ fontSize: 22, letterSpacing: '0.3em', textAlign: 'center' }} />
      </div>
      {error && <p className="notice error" role="alert">{error}</p>}
      <button className="btn btn-primary" disabled={pending || code.length !== 6}>{pending ? 'Checking…' : 'Verify'}</button>
    </form>
  )
}

export function MfaVerify({ factorId }: { factorId: string }) {
  return (
    <>
      <p className="muted" style={{ margin: 0 }}>Open your authenticator app and enter the 6-digit code for Sleep Anaesthesia.</p>
      <CodeForm factorId={factorId} label="6-digit code" />
      <p className="muted" style={{ margin: 0, fontSize: 13 }}>Lost your phone? Ask another admin to reset your two-factor authentication.</p>
    </>
  )
}

export function MfaEnroll() {
  const [setup, setSetup] = useState<{ factorId: string; qr: string; secret: string } | null>(null)
  const [error, setError] = useState('')
  const [pending, start] = useTransition()
  if (!setup) {
    return (
      <>
        <p className="muted" style={{ margin: 0 }}>Every dashboard account must use an authenticator app (Google Authenticator, Microsoft Authenticator, 1Password, Authy or similar) as a second sign-in step.</p>
        {error && <p className="notice error" role="alert">{error}</p>}
        <button className="btn btn-primary" disabled={pending} onClick={() => start(async () => {
          const r = await startMfaEnrollment()
          if (r.ok) setSetup(r.data)
          else setError(r.error)
        })}>{pending ? 'Preparing…' : 'Set up authenticator app'}</button>
      </>
    )
  }
  return (
    <>
      <p className="muted" style={{ margin: 0 }}>1. Scan this QR code with your authenticator app.</p>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="qr" src={setup.qr} alt="QR code for your authenticator app" />
      <details><summary style={{ cursor: 'pointer', fontSize: 14 }}>Can&apos;t scan? Enter this key instead</summary><code>{setup.secret}</code></details>
      <CodeForm factorId={setup.factorId} label="2. Enter the 6-digit code it shows" />
    </>
  )
}
