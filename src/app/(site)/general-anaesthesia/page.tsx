import Link from 'next/link'
import { CloseBand } from '@/components/site/CloseBand'
import { ContentImage } from '@/components/site/ContentImage'
import { Enquiry } from '@/components/site/Enquiry'
import { JsonLd } from '@/components/site/JsonLd'
import { VideoSection } from '@/components/site/VideoSection'
import { getSettings, getSlotImage } from '@/lib/data'
import { breadcrumbSchema, buildMetadata } from '@/lib/seo'

export const generateMetadata = () =>
  buildMetadata({ path: '/general-anaesthesia', pageKey: 'general_anaesthesia', title: 'General Anaesthesia: Accredited Clinics & Day Hospitals', description: 'General anaesthesia for accredited dental clinics and day hospitals across Queensland and Victoria, delivered by FANZCA specialist anaesthetists.' })

export default async function GeneralAnaesthesiaPage() {
  const [settings, equipment] = await Promise.all([getSettings(), getSlotImage('ga_equipment')])
  return (
    <>
      <div className="wrap">
        <section className="page-hero">
          <span className="kicker">General anaesthesia</span>
          {/* Statement supplied by the client (website edits.docx). */}
          <h1 className="display"><span className="line">Accredited Clinics &amp; Day Hospitals</span> <span className="line ga-serviced">Serviced by Sleep Anaesthesia</span></h1>
          <p className="sub">Sleep Anaesthesia provides general anaesthesia for accredited dental clinics and day hospitals across Queensland and Victoria, delivered by FANZCA specialist anaesthetists and experienced anaesthetic nurses.</p>
          {/* Notice supplied by the client (website edits.docx), verbatim. */}
          <aside className="ga-notice" aria-label="Please note">
            <strong>Please note</strong>
            <ul>
              <li>State Laws apply</li>
              <li>Health regulations &amp; accreditation by Private Health apply</li>
              <li>Some services may not be available in your state</li>
            </ul>
          </aside>
          <div className="cta-row">
            <Link className="btn btn-primary" href="/contact#enquire">Contact us now</Link>
            <Link className="btn btn-secondary" href="/portal">Clinic suitability requirements</Link>
          </div>
        </section>

        <hr className="rule2" />

        <section className="section">
          <h2 className="visually-hidden">Overview</h2>
          <div className="cells reveal">
            <div className="cell">
              <span className="kicker">Ideal for</span>
              <ul className="checklist">
                <li>All-on-X procedures</li><li>Dental implants</li><li>Wisdom teeth</li><li>Full mouth rehabilitation</li><li>Multiple extractions</li><li>Complex oral surgery</li>
              </ul>
            </div>
            <div className="cell">
              <span className="kicker">Why Sleep Anaesthesia?</span>
              <ul className="checklist">
                <li>FANZCA specialist anaesthetists</li><li>Dedicated anaesthetic and recovery nurse</li><li>Hospital-grade equipment supplied</li><li>Flexible oral or nasal airway techniques</li><li>Minimal disruption to your practice</li><li>Queensland &amp; Victoria coverage</li>
              </ul>
            </div>
            <div className="cell">
              <span className="kicker">We bring everything</span>
              <ul className="checklist navy">
                <li>Anaesthetic machine</li><li>Ventilator</li><li>Patient monitoring</li><li>Airway equipment</li><li>Oxygen &amp; suction</li><li>Emergency equipment</li><li>Recovery equipment</li>
              </ul>
            </div>
          </div>
          <p className="fine-print" style={{ maxWidth: 'var(--measure)', fontSize: 16 }}><strong>Safety first.</strong> Every patient receives a comprehensive pre-operative assessment, continuous monitoring throughout the procedure, and structured recovery with dedicated post-anaesthetic care.</p>
        </section>

        <VideoSection placement="general_anaesthesia" kicker="General anaesthesia" title="General anaesthesia in the dental chair" />

        <hr className="rule2" />

        <section className="split tinted reveal" id="requirements">
          <div className="split-copy">
            <span className="kicker">For partner clinics</span>
            <h2 className="section-title">Clinic suitability &amp; site requirements</h2>
            <p className="note">Clinic suitability requirements and site logistics for general anaesthesia are available to partner clinics in our dental portal.</p>
            <div className="cta-row">
              <Link className="btn btn-primary" href="/portal">Enter the dental portal</Link>
              <Link className="btn btn-secondary" href="/contact#enquire">Request access</Link>
            </div>
          </div>
        </section>

        <section className={`split reveal${equipment ? '' : ' no-media'}`} style={{ paddingTop: 0 }}>
          <div className="split-copy">
            <span className="kicker">Clinical standards</span>
            <h2 className="section-title">Why these standards matter</h2>
            <p className="note">General anaesthesia is very safe when delivered in the right environment by specialist anaesthetists. The standards in place exist to protect every patient at every stage of their care.</p>
            <p className="note"><strong>Our guiding principle:</strong> patient safety always comes before convenience. Every decision we make is measured against this standard.</p>
            <ul className="checklist" style={{ marginTop: 'var(--leading)' }}>
              <li>Reduce risk throughout the procedure</li><li>Improve emergency readiness on-site</li><li>Ensure safe airway management at all times</li><li>Allow rapid patient transfer if needed</li>
            </ul>
          </div>
          {equipment && <figure className="split-figure"><ContentImage image={equipment} sizes="(max-width: 760px) 100vw, 640px" /></figure>}
        </section>

        <hr className="rule2" />

        <section className="section">
          <span className="kicker">Our commitment</span>
          <h2 className="section-title">A commitment to safety at every step</h2>
          <p className="section-intro">Every procedure is assessed with care, every clinic is reviewed carefully, and every patient is treated with a conservative, safety-first approach.</p>
          <div className="cells reveal">
            {[
              'All general anaesthetics are provided exclusively by specialist anaesthetists with dedicated training and experience.',
              'Clinics are individually assessed for suitability before any procedure is booked or confirmed.',
              'Patients are screened carefully and conservatively, and your health profile guides every clinical decision.',
              'If a clinic or patient is not suitable, general anaesthesia will not proceed in that setting. No exceptions.',
            ].map((t, i) => <div className="cell" key={i}><span className="kicker">{String(i + 1).padStart(2, '0')}</span><p>{t}</p></div>)}
          </div>
        </section>

        <hr className="rule2" />

        <section className="split reveal" style={{ alignItems: 'start' }}>
          <div className="split-copy">
            <span className="kicker">Get in touch</span>
            <h2 className="section-title">Questions about clinic suitability?</h2>
            <p className="note">Whether you are a clinic considering general anaesthesia services, or a patient with questions about where your procedure will be performed, our team is here to help.</p>
            <p className="note">We assess clinic suitability and discuss the safest option for your care. Reach out and a member of our team will respond promptly.</p>
          </div>
          <Enquiry settings={settings} audience="clinic" page="general-anaesthesia" title="Ask about clinic suitability" />
        </section>
      </div>

      <CloseBand lines={['Safety-first anaesthesia,', 'in your practice.']} sub="A confidential, no-obligation enquiry. We'll assess your clinic's suitability and discuss the safest option for your patients' care." settings={settings} primary={{ href: '/contact#enquire', label: 'Contact our team' }} />
      <JsonLd data={breadcrumbSchema([{ name: 'General anaesthesia', path: '/general-anaesthesia' }])} />
    </>
  )
}
