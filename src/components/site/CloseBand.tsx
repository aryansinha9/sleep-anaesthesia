import Link from 'next/link'
import type { SiteSettings } from '@/content/types'
import { telHref } from '@/lib/format'

export function CloseBand({ lines, sub, settings, primary = { href: '/contact#enquire', label: 'Contact us now' }, secondary }: {
  lines: string[]; sub?: string; settings: SiteSettings; primary?: { href: string; label: string }; secondary?: { href: string; label: string }
}) {
  const second = secondary || (settings.phone ? { href: telHref(settings.phone), label: `Call ${settings.phone}` } : { href: `mailto:${settings.email}`, label: settings.email })
  return (
    <section className="close">
      <div className="wrap">
        <h2>{lines.map((l) => <span className="line" key={l}>{l}</span>)}</h2>
        {sub && <p className="sub">{sub}</p>}
        <div className="row">
          <Link className="btn btn-gold" href={primary.href}>{primary.label}</Link>
          <a className="btn btn-ghost" href={second.href}>{second.label}</a>
        </div>
      </div>
    </section>
  )
}
