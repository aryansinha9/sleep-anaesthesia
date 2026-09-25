import Link from 'next/link'
import { CloseBand } from '@/components/site/CloseBand'
import { ContentImage } from '@/components/site/ContentImage'
import { Enquiry } from '@/components/site/Enquiry'
import { MinimumBooking, PhotoGrid } from '@/components/site/Extras'
import { FaqSection } from '@/components/site/FaqSection'
import { JsonLd } from '@/components/site/JsonLd'
import { TreatmentList } from '@/components/site/TreatmentList'
import { VideoSection } from '@/components/site/VideoSection'
import { getFaqs, getSettings, getSlotImage, getTreatments } from '@/lib/data'
import { breadcrumbSchema, buildMetadata, faqSchema } from '@/lib/seo'

export const generateMetadata = () =>
  buildMetadata({ path: '/clinics', pageKey: 'clinics', title: 'Mobile IV Sedation for Dental Clinics in QLD & VIC', description: 'FANZCA specialist anaesthetists bring the full sedation setup to your dental clinic, at no cost to your practice.' })

export default async function ClinicsPage() {
  const [settings, faqs, setup, treatments] = await Promise.all([getSettings(), getFaqs('clinics'), getSlotImage('clinics_setup'), getTreatments()])
  return (
    <>
      <div className="wrap">
        <section className="page-hero">
          <span className="kicker">Dental clinics</span>
          <h1 className="display"><span className="line">Mobile IV sedation</span> <span className="line">for dental clinics.</span></h1>
          <p className="sub">Enhance your practice with sedation, without the overheads. Sleep Anaesthesia provides fully mobile IV sedation for dental clinics across Queensland and Victoria, delivered by FANZCA specialist anaesthetists and experienced anaesthetic nurses. We bring all equipment, medications and monitoring, allowing your team to offer safe, hospital-grade sedation without the need for additional staff or investment.</p>
          <div className="cta-row">
            <a className="btn btn-primary" href="#enquire">Enquire about a list</a>
            <Link className="btn btn-secondary" href="/general-anaesthesia">Mobile general anaesthesia service</Link>
          </div>
        </section>

        <hr className="rule2" />

        <section className={`split reveal${setup ? '' : ' no-media'}`}>
          <div className="split-copy">
            <span className="kicker">Why Sleep Anaesthesia?</span>
            <h2 className="section-title">Your dentistry. Our anaesthesia.</h2>
            <p className="note">Every list is run by a specialist anaesthetist, never a sedationist, so your patients get hospital-standard care and a Medicare rebate on the anaesthesia fee.</p>
            <ul className="checklist" style={{ marginTop: 'var(--leading)' }}>
              <li>FANZCA specialist anaesthetists</li>
              <li>Complete mobile setup supplied</li>
              <li>Dedicated recovery nurse</li>
              <li>Hospital-grade monitoring</li>
              <li>Minimal disruption to your practice</li>
            </ul>
          </div>
          {setup && <figure className="split-figure"><ContentImage image={setup} sizes="(max-width: 760px) 100vw, 640px" /></figure>}
        </section>

        <VideoSection placement="clinics_overview" kicker="Clinic overview" title="How a mobile sedation list works" />

        <section className="section" style={{ paddingTop: 0 }} aria-labelledby="ideal-h">
          <span className="kicker">Ideal for</span>
          <h2 className="section-title" id="ideal-h">Procedures and patients we support</h2>
          <div style={{ marginTop: 'var(--leading)' }}>
            <TreatmentList treatments={treatments} extra={['Long restorative appointments', 'Anxious or phobic patients']} />
          </div>
        </section>

        <MinimumBooking settings={settings} />

        <hr className="rule2" />

        <FaqSection faqs={faqs} kicker="FAQ: dentists & practices" title="Everything your practice needs to know" searchLabel="Search clinic FAQs" placeholder="Search, e.g. booking, equipment, billing, consent" />

        <PhotoGrid slot="clinics_gallery" kicker="Gallery" title="A safe, sophisticated sedation environment" />

        <section className="section" style={{ paddingTop: 0 }}>
          <Enquiry settings={settings} audience="clinic" page="clinics" title="Enquire about sedation for your clinic" lockAudience />
        </section>
      </div>

      <CloseBand lines={['Ready to offer sedation', 'in your practice?']} sub="No commitment, no cost to your clinic, fully managed by us. Book an ad-hoc list or a regular operating day." settings={settings}
        secondary={{ href: '/general-anaesthesia', label: 'General anaesthesia & site requirements' }} />
      <JsonLd data={[breadcrumbSchema([{ name: 'Dental clinics', path: '/clinics' }]), faqSchema(faqs)]} />
    </>
  )
}
