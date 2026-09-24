'use client'

import { useRef, useState, useTransition } from 'react'

/** A button that asks for confirmation in a dialog before running its action. */
export function ConfirmButton({ label, title, body, confirmLabel, onConfirm, className = 'btn btn-secondary', danger = false, disabled = false }: {
  label: React.ReactNode; title: string; body: React.ReactNode; confirmLabel: string; onConfirm: () => Promise<unknown> | unknown; className?: string; danger?: boolean; disabled?: boolean
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const [pending, start] = useTransition()
  const [busy, setBusy] = useState(false)
  return (
    <>
      <button type="button" className={className} disabled={disabled || pending || busy} onClick={() => ref.current?.showModal()}>{label}</button>
      <dialog ref={ref} className="adm-dialog" onClick={(e) => { if (e.target === ref.current) ref.current?.close() }}>
        <h2>{title}</h2>
        <div className="muted" style={{ fontSize: 15 }}>{body}</div>
        <div className="actions-bar">
          <button type="button" className="btn btn-secondary" onClick={() => ref.current?.close()}>Cancel</button>
          <button type="button" className={danger ? 'btn btn-danger' : 'btn btn-primary'} disabled={pending || busy} autoFocus
            onClick={() => start(async () => { setBusy(true); try { await onConfirm() } finally { setBusy(false); ref.current?.close() } })}>
            {pending || busy ? 'Working…' : confirmLabel}
          </button>
        </div>
      </dialog>
    </>
  )
}
