'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

type MenuItem = { href: string; label: string }

const CLINIC_MENU: MenuItem[] = [
  { href: '/clinics', label: 'General information' },
  { href: '/general-anaesthesia', label: 'General anaesthesia' },
  { href: '/general-anaesthesia#logistics', label: 'Logistics & site requirements' },
  { href: '/areas', label: 'Areas we service' },
]

const Chevron = () => (
  <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M2.5 4.5 6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
)

/** Dropdown that opens on hover (mouse) and on tap/click/keyboard (everything else). */
function Dropdown({ label, items, current, allHref, allLabel }: { label: string; items: MenuItem[]; current: boolean; allHref?: string; allLabel?: string }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const hoverOpened = useRef(false)
  const pathname = usePathname()
  useEffect(() => setOpen(false), [pathname])
  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent | TouchEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false) }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('touchstart', onDoc)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('touchstart', onDoc); document.removeEventListener('keydown', onKey) }
  }, [open])
  const id = `menu-${label.replace(/\W+/g, '-').toLowerCase()}`
  return (
    <div className="nav-drop" ref={ref} data-open={open}
      onMouseEnter={() => { if (window.matchMedia('(hover: hover)').matches && !open) { hoverOpened.current = true; setOpen(true) } }}
      onMouseLeave={() => { if (window.matchMedia('(hover: hover)').matches) { hoverOpened.current = false; setOpen(false) } }}>
      <button type="button" className="nav-drop-trigger" aria-expanded={open} aria-controls={id} data-current={current}
        onClick={() => {
          // A click right after hover-opening keeps the menu open instead of closing it.
          if (hoverOpened.current) { hoverOpened.current = false; setOpen(true) } else setOpen((o) => !o)
        }}>
        {label}<Chevron />
      </button>
      <div className="nav-menu" id={id}>
        {items.map((it) => <Link key={it.href} href={it.href} aria-current={pathname === it.href ? 'page' : undefined}>{it.label}</Link>)}
        {allHref && <Link className="nav-menu-all" href={allHref}>{allLabel}</Link>}
      </div>
    </div>
  )
}

export function Nav({ treatments, brand }: { treatments: MenuItem[]; brand: string }) {
  const pathname = usePathname()
  const [menu, setMenu] = useState(false)
  useEffect(() => setMenu(false), [pathname])
  const is = (p: string) => pathname === p || pathname.startsWith(p + '/')
  const current = (p: string) => (is(p) ? 'page' : undefined)

  return (
    <nav className="nav" aria-label="Main" data-menu={menu ? 'open' : 'closed'}>
      <Link className="nav-brand" href="/">
        <Image className="brand-mark" src="/uploads/sleep-anaesthesia-logo.png" width={822} height={684} alt="" sizes="44px" priority />
        <span>{brand}</span>
      </Link>
      <Link className="nav-link" href="/iv-sedation" aria-current={current('/iv-sedation')}>IV Sedation</Link>
      {treatments.length > 0 && <Dropdown label="Sleep Treatments" items={treatments} current={is('/treatments')} allHref="/treatments" allLabel="All sleep treatments →" />}
      <Link className="nav-link" href="/patients" aria-current={current('/patients')}>Patient Info</Link>
      <Dropdown label="Dental Clinics" items={CLINIC_MENU} current={is('/clinics') || is('/general-anaesthesia') || is('/areas')} />
      <Link className="nav-link" href="/contact" aria-current={current('/contact')}>Contact</Link>
      <Link className="btn btn-primary" href="/contact#enquire">Enquire now</Link>
      <button type="button" className="nav-burger" aria-label={menu ? 'Close menu' : 'Open menu'} aria-expanded={menu} aria-controls="mobile-menu" onClick={() => setMenu((m) => !m)}>
        <span /><span /><span />
      </button>
      <div className="mobile-menu" id="mobile-menu" onClick={(e) => { if ((e.target as HTMLElement).closest('a')) setMenu(false) }}>
        <Link href="/" aria-current={pathname === '/' ? 'page' : undefined}>Home</Link>
        <Link href="/iv-sedation" aria-current={current('/iv-sedation')}>IV Sedation</Link>
        {treatments.length > 0 && (
          <details>
            <summary>Sleep Treatments</summary>
            {treatments.map((t) => <Link key={t.href} href={t.href} aria-current={current(t.href)}>{t.label}</Link>)}
            <Link href="/treatments">All sleep treatments</Link>
          </details>
        )}
        <Link href="/patients" aria-current={current('/patients')}>Patient Info</Link>
        <details>
          <summary>Dental Clinics</summary>
          {CLINIC_MENU.map((t) => <Link key={t.href} href={t.href}>{t.label}</Link>)}
        </details>
        <Link href="/pricing" aria-current={current('/pricing')}>Fees &amp; payment plans</Link>
        <Link href="/contact" aria-current={current('/contact')}>Contact</Link>
        <Link href="/portal">Dental portal</Link>
        <Link className="btn btn-primary" href="/contact#enquire">Enquire now</Link>
      </div>
    </nav>
  )
}
