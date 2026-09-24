'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ToastProvider } from './Toast'

type NavItem = { href: string; label: string }
type NavGroup = { label: string; items: NavItem[] }

export function AdminShell({ groups, email, role, signOut, children }: { groups: NavGroup[]; email: string; role: string; signOut: () => Promise<void>; children: React.ReactNode }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  useEffect(() => setOpen(false), [pathname])
  const current = (href: string) => (href === '/admin' ? pathname === '/admin' : pathname === href || pathname.startsWith(href + '/'))
  return (
    <ToastProvider>
      <div className="adm-shell" data-nav={open ? 'open' : 'closed'}>
        <div className="adm-top">
          <button onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="adm-side">☰ Menu</button>
          <strong>Dashboard</strong>
          <Link href="/" target="_blank" style={{ color: '#fff', fontSize: 14 }}>View site</Link>
        </div>
        <aside className="adm-side" id="adm-side">
          <Link className="adm-brand" href="/admin">
            <span>Sleep Anaesthesia<small>Website dashboard</small></span>
          </Link>
          <nav className="adm-nav" aria-label="Dashboard">
            {groups.map((g) => (
              <div key={g.label} style={{ display: 'contents' }}>
                <span className="grp">{g.label}</span>
                {g.items.map((it) => <Link key={it.href} href={it.href} aria-current={current(it.href) ? 'page' : undefined}>{it.label}</Link>)}
              </div>
            ))}
          </nav>
          <div className="me">
            <div>{email}</div>
            <div style={{ color: 'var(--color-gold-300)', textTransform: 'capitalize' }}>{role}</div>
            <p style={{ margin: '8px 0 0' }}><Link href="/admin/set-password" style={{ color: '#fff' }}>Change password</Link></p>
            <form action={signOut}><button type="submit">Sign out</button></form>
            <p style={{ marginTop: 10 }}><Link href="/" target="_blank" style={{ color: '#fff' }}>View live site ↗</Link></p>
          </div>
        </aside>
        <main className="adm-main" id="main">{children}</main>
      </div>
    </ToastProvider>
  )
}
