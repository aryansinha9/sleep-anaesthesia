import Image from 'next/image'
import Link from 'next/link'
import type { Location, SiteSettings, Treatment } from '@/content/types'
import { fullAddress, telHref } from '@/lib/format'
import { Hours } from './Hours'

export function Footer({ settings, locations, treatments }: { settings: SiteSettings; locations: Location[]; treatments: Treatment[] }) {
  const primaries = locations.filter((l) => l.kind === 'primary')
  return (
    <footer className="footer">
      <div className="wrap">
        <div>
          <Link className="nav-brand" href="/">
            <Image className="brand-mark" src="/uploads/sleep-anaesthesia-logo-light.png" width={822} height={684} alt="" sizes="48px" style={{ width: 48 }} />
            <span>{settings.businessName}</span>
          </Link>
          <p className="about">Mobile dental sedation and general anaesthesia by FANZCA specialist anaesthetists, delivered at dental clinics across Queensland and Victoria.</p>
          <p className="about">Medicare rebates processed for patients. Payment plans available through TLC.</p>
        </div>
        <div>
          <h2 className="footer-heading">Services</h2>
          <ul>
            <li><Link href="/iv-sedation">IV sedation</Link></li>
            <li><Link href="/general-anaesthesia">General anaesthesia</Link></li>
            <li><Link href="/clinics">For dental clinics</Link></li>
            <li><Link href="/patients">Patient info</Link></li>
            {treatments.length > 0 && <li><Link href="/treatments">Sleep treatments</Link></li>}
            <li><Link href="/pricing">Fees &amp; payment plans</Link></li>
            <li><Link href="/portal">Dental portal</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="footer-heading">Areas we service</h2>
          <ul>
            {primaries.map((l) => <li key={l.slug}><Link href={`/areas/${l.slug}`}>{l.name}</Link></li>)}
            <li><Link href="/areas">All areas</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="footer-heading">Contact</h2>
          <ul>
            {settings.phone && <li>Phone: <a href={telHref(settings.phone)}>{settings.phone}</a></li>}
            <li><a href={`mailto:${settings.email}`}>{settings.email}</a></li>
            {settings.socialLinks.map((s) => <li key={s.url}><a href={s.url} target="_blank" rel="noopener noreferrer">{s.label}</a></li>)}
            {settings.googleReviewUrl && <li><a href={settings.googleReviewUrl} target="_blank" rel="noopener noreferrer">Leave us a Google review</a></li>}
          </ul>
          <h2 className="footer-heading" style={{ marginTop: 18 }}>Office</h2>
          <address>{fullAddress(settings)}</address>
          <h2 className="footer-heading" style={{ marginTop: 18 }}>Office hours</h2>
          <Hours hours={settings.hours} caption="Office hours" />
        </div>
        <div className="legal">
          <span>© {settings.businessName}. ANZCA-accredited specialist anaesthetists. Mobile service, Queensland &amp; Victoria. <Link href="/privacy">Privacy policy</Link></span>
          <span className="disclaimer">Any surgical or invasive procedure carries risks. Before proceeding, you should seek a second opinion from an appropriately qualified health practitioner.</span>
        </div>
      </div>
    </footer>
  )
}
