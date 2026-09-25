'use client'

import { useEffect } from 'react'
import type { ChatProvider } from '@/content/types'

const IDS = {
  tawk: /^[a-f0-9]{24}\/[a-z0-9]{6,16}$/i,
  crisp: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
}

declare global {
  interface Window { $crisp?: unknown[]; CRISP_WEBSITE_ID?: string; Tawk_API?: object; Tawk_LoadStart?: Date }
}

// Loads the chat provider's script after the page has loaded and the browser
// is idle, so it never competes with page content. No valid ID → nothing loads.
// Rendered only in the public layout, never under /admin.
export function ChatWidget({ provider, id }: { provider: ChatProvider; id: string }) {
  useEffect(() => {
    if (provider === 'none' || !IDS[provider]?.test(id)) return
    let cancelled = false
    const inject = () => {
      if (cancelled || document.getElementById('chat-widget-script')) return
      const s = document.createElement('script')
      s.id = 'chat-widget-script'
      s.async = true
      if (provider === 'crisp') {
        window.$crisp = []
        window.CRISP_WEBSITE_ID = id
        s.src = 'https://client.crisp.chat/l.js'
      } else {
        window.Tawk_API = window.Tawk_API || {}
        window.Tawk_LoadStart = new Date()
        s.src = `https://embed.tawk.to/${id}`
        s.charset = 'UTF-8'
        s.setAttribute('crossorigin', '*')
      }
      document.body.appendChild(s)
    }
    const schedule = () => ('requestIdleCallback' in window ? window.requestIdleCallback(inject, { timeout: 4000 }) : setTimeout(inject, 2500))
    if (document.readyState === 'complete') schedule()
    else window.addEventListener('load', schedule, { once: true })
    return () => { cancelled = true; window.removeEventListener('load', schedule) }
  }, [provider, id])
  return null
}
