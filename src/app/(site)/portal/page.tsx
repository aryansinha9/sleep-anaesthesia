import Link from 'next/link'
import { lockPortal } from '@/app/actions/portal'
import { GaClinicRequirements } from '@/components/site/GaClinicRequirements'
import { getPortalAccess, portalAvailable } from '@/lib/portal'
import { buildMetadata } from '@/lib/seo'
import { PortalForm } from './PortalForm'

export const dynamic = 'force-dynamic'

export const generateMetadata = () =>
  buildMetadata({ path: '/portal', title: 'Dental Portal', description: 'Access-code protected portal for verified Sleep Anaesthesia partner clinics.', noindex: true })

export default async function PortalPage() {
  const access = await getPortalAccess()
  if (!access) {
    return (
      <div className="wrap">
        <section className="page-hero" style={{ minHeight: '40vh' }}>
          <span className="kicker">Dental portal</span>
          <h1 className="display"><span className="line">For partner clinics.</span></h1>
          <p className="sub">This content is protected. Enter the clinic access code we sent you. Need access? <Link href="/contact#enquire">Request a personalised access code</Link>.</p>
          {portalAvailable() ? <PortalForm /> : <p className="form-error" style={{ marginTop: 'var(--leading)' }}>The portal is not available right now. Please contact our team.</p>}
        </section>
        <hr className="rule2" />
        <section className="section">
          <p className="muted" style={{ maxWidth: 'var(--measure)' }}>The portal holds general anaesthesia clinic suitability requirements and site logistics for verified partner clinics.</p>
        </section>
      </div>
    )
  }
  return (
    <div className="wrap">
      <section className="page-hero">
        <span className="kicker">Dental portal: {access.clinicName}</span>
        <h1 className="display"><span className="line">General anaesthesia</span> <span className="line">clinic requirements.</span></h1>
        <p className="sub">Confidential information for partner clinics. Please do not share it outside your practice.</p>
        <form action={lockPortal} style={{ marginTop: 'var(--leading)' }}><button className="btn btn-secondary" type="submit">Sign out of the portal</button></form>
      </section>
      <hr className="rule2" />
      <GaClinicRequirements />
      <section className="section" style={{ paddingTop: 0 }}>
        <p className="muted">Questions about your clinic&apos;s suitability? <Link href="/contact#enquire">Contact our team</Link>.</p>
      </section>
    </div>
  )
}
