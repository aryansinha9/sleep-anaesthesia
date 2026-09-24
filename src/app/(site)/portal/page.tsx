import Link from 'next/link'
import { buildMetadata } from '@/lib/seo'
import { PortalForm } from './PortalForm'

export const generateMetadata = () =>
  buildMetadata({ path: '/portal', title: 'Dental Portal', description: 'Password-protected portal for verified Sleep Anaesthesia partner clinics.', noindex: true })

export default function PortalPage() {
  return (
    <div className="wrap">
      <section className="page-hero" style={{ minHeight: '40vh' }}>
        <span className="kicker">Dental portal</span>
        <h1 className="display"><span className="line">For partner clinics.</span></h1>
        <p className="sub">This content is password-protected. To view it, please enter the password below. Need access? <Link href="/contact#enquire">Request a personalised access code</Link>.</p>
        <PortalForm />
      </section>
      <hr className="rule2" />
      <section className="section">
        <p className="muted" style={{ maxWidth: 'var(--measure)' }}>The portal holds detailed pricing, booking forms and sedation records for verified partner clinics. Patients can reach us through the portal, text, or email for any pre- or post-sedation queries.</p>
      </section>
    </div>
  )
}
