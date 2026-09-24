'use client'

import { createContext, useCallback, useContext, useState } from 'react'

type Toast = { id: number; kind: 'success' | 'error' | 'info'; text: string }
const Ctx = createContext<(kind: Toast['kind'], text: string) => void>(() => {})

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const push = useCallback((kind: Toast['kind'], text: string) => {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t, { id, kind, text }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), kind === 'error' ? 9000 : 5000)
  }, [])
  return (
    <Ctx.Provider value={push}>
      {children}
      <div className="toasts" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div className="toast" data-kind={t.kind} key={t.id}>
            <span>{t.text}</span>
            <button aria-label="Dismiss" onClick={() => setToasts((x) => x.filter((y) => y.id !== t.id))}>×</button>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  )
}

export const useToast = () => useContext(Ctx)

/** Shows the result of any admin action as a toast. Returns whether it succeeded. */
export function useResultToast() {
  const toast = useToast()
  return useCallback((r: { ok: boolean; message?: string; error?: string }, fallback = 'Done.') => {
    if (r.ok) toast('success', r.message || fallback)
    else toast('error', r.error || 'Something went wrong.')
    return r.ok
  }, [toast])
}
