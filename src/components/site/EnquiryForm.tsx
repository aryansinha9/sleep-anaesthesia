'use client'

import { useActionState, useState } from 'react'
import { submitEnquiry, type EnquiryState } from '@/app/actions/enquiry'

// Short, low-friction enquiry form with separate clinic and patient paths.
export function EnquiryForm({ defaultAudience = 'patient', page, title = 'Send us an enquiry', id = 'enquire', lockAudience = false }: {
  defaultAudience?: 'clinic' | 'patient'; page: string; title?: string; id?: string; lockAudience?: boolean
}) {
  const [state, action, pending] = useActionState<EnquiryState, FormData>(submitEnquiry, { status: 'idle' })
  const [audience, setAudience] = useState(defaultAudience)
  const [started] = useState(() => Date.now())
  const err = (k: string) => state.errors?.[k]
  const fid = (k: string) => `${id}-${k}`

  if (state.status === 'ok') {
    return <div className="enquiry" id={id}><h2>Thank you</h2><p className="form-success" role="status">{state.message || 'We will be in touch shortly.'}</p></div>
  }
  return (
    <form className="enquiry" id={id} action={action} noValidate>
      <h2>{title}</h2>
      <input type="hidden" name="page" value={page} />
      <input type="hidden" name="started" value={started} />
      <div className="hp" aria-hidden="true"><label>Website <input name="website" tabIndex={-1} autoComplete="off" /></label></div>
      {lockAudience ? <input type="hidden" name="audience" value={audience} /> : (
        <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
          <legend className="field" style={{ marginBottom: 8, fontSize: 14, fontWeight: 600 }}>I am a…</legend>
          <div className="choice-row">
            <label className="choice"><input type="radio" name="audience" value="clinic" checked={audience === 'clinic'} onChange={() => setAudience('clinic')} />Dental clinic</label>
            <label className="choice"><input type="radio" name="audience" value="patient" checked={audience === 'patient'} onChange={() => setAudience('patient')} />Patient</label>
          </div>
        </fieldset>
      )}
      <div className="form-grid">
        <div className="field">
          <label htmlFor={fid('name')}>Your name *</label>
          <input className="input" id={fid('name')} name="name" autoComplete="name" maxLength={80} required aria-invalid={!!err('name')} aria-describedby={err('name') ? fid('name-e') : undefined} />
          {err('name') && <p className="form-error" id={fid('name-e')}>{err('name')}</p>}
        </div>
        {audience === 'clinic' && (
          <div className="field">
            <label htmlFor={fid('clinic')}>Clinic name *</label>
            <input className="input" id={fid('clinic')} name="clinic" autoComplete="organization" maxLength={120} aria-invalid={!!err('clinic')} aria-describedby={err('clinic') ? fid('clinic-e') : undefined} />
            {err('clinic') && <p className="form-error" id={fid('clinic-e')}>{err('clinic')}</p>}
          </div>
        )}
        <div className="field">
          <label htmlFor={fid('email')}>Email</label>
          <input className="input" id={fid('email')} name="email" type="email" autoComplete="email" maxLength={160} aria-invalid={!!err('email')} aria-describedby={err('email') ? fid('email-e') : undefined} />
          {err('email') && <p className="form-error" id={fid('email-e')}>{err('email')}</p>}
        </div>
        <div className="field">
          <label htmlFor={fid('phone')}>Phone</label>
          <input className="input" id={fid('phone')} name="phone" type="tel" autoComplete="tel" maxLength={20} aria-invalid={!!err('phone')} aria-describedby={err('phone') ? fid('phone-e') : undefined} />
          {err('phone') && <p className="form-error" id={fid('phone-e')}>{err('phone')}</p>}
        </div>
      </div>
      <div className="field">
        <label htmlFor={fid('message')}>{audience === 'clinic' ? 'How can we help your clinic?' : 'How can we help?'}</label>
        <textarea className="input" id={fid('message')} name="message" maxLength={1500} rows={4} />
        <p className="muted" style={{ fontSize: 14, margin: 0 }}>Please don&apos;t include detailed medical information. We&apos;ll discuss that with you directly.</p>
      </div>
      {state.status === 'error' && <p className="form-error" role="alert">{state.message}</p>}
      <div><button type="submit" className="btn btn-primary" disabled={pending}>{pending ? 'Sending…' : 'Send enquiry'}</button></div>
      <p className="muted" style={{ fontSize: 13.5, margin: 0 }}>We use your details only to respond to your enquiry. See our <a href="/privacy">privacy policy</a>.</p>
    </form>
  )
}
