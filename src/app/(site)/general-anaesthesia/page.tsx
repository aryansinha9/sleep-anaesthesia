import Link from 'next/link'
import { CloseBand } from '@/components/site/CloseBand'
import { ContentImage } from '@/components/site/ContentImage'
import { Enquiry } from '@/components/site/Enquiry'
import { JsonLd } from '@/components/site/JsonLd'
import { VideoSection } from '@/components/site/VideoSection'
import { getSettings, getSlotImage } from '@/lib/data'
import { breadcrumbSchema, buildMetadata } from '@/lib/seo'

export const generateMetadata = () =>
  buildMetadata({ path: '/general-anaesthesia', pageKey: 'general_anaesthesia', title: 'Mobile General Anaesthesia for Dental Clinics', description: 'Mobile general anaesthesia for accredited dental clinics by FANZCA specialist anaesthetists. Clinic suitability, safety standards and site requirements.' })

const REQUIREMENTS: { title: string; intro?: string; items: string[]; note?: string }[] = [
  { title: 'Access to the clinic', items: ['Ground floor access, or easy lift access suitable for clinical equipment', 'No steps or stairs anywhere along the patient pathway', 'Clear, unobstructed access from street or car park to the treatment room'], note: 'This ensures patients can be safely moved and, if required, quickly transferred by ambulance.' },
  { title: 'Entry and exit', items: ['Easy entry and exit for large anaesthetic machines', 'Unrestricted access for an ambulance stretcher', 'Wide hallways and doorways suitable for patient transfer'], note: 'Emergency access must never be compromised.' },
  { title: 'Treatment room', items: ['Large enough for 5–6 clinical staff to work safely around the patient', 'Ample access at the head of the patient at all times', 'Ideally large or sliding doors, to allow rapid equipment and patient movement'], note: 'Adequate space is essential for airway management, monitoring, and emergency response.' },
  { title: 'Stairs and level changes', items: ['Steps are not permitted', 'All patient movement must occur on a flat, level surface or via a suitable lift'], note: 'This reduces risk during patient transfer and emergency evacuation.' },
  { title: 'Equipment and emergency readiness', items: ['Full anaesthetic machines and monitoring equipment', 'Oxygen, suction, and emergency power access', 'Emergency resuscitation equipment', 'Clear pathways for rapid ambulance access and patient extraction'] },
  { title: 'Strict patient suitability screening', intro: 'Not all patients are suitable for general anaesthesia in a clinic setting. We conduct thorough pre-anaesthetic screening to assess:', items: ['Medical history and existing health conditions', 'Medications and allergies', 'Previous anaesthetic history', 'Individual risk factors'], note: 'Patients who do not meet safety criteria are referred to a hospital environment where additional resources are available.' },
]

export default async function GeneralAnaesthesiaPage() {
  const [settings, equipment] = await Promise.all([getSettings(), getSlotImage('ga_equipment')])
  return (
    <>
      <div className="wrap">
        <section className="page-hero">
          <span className="kicker">Dental clinics: general anaesthesia</span>
          <h1 className="display"><span className="line">Hospital-grade general anaesthesia.</span> <span className="line">Delivered in your practice.</span></h1>
          <p className="sub">Sleep Anaesthesia provides fully mobile general anaesthesia services for accredited dental clinics across Queensland and Victoria. Our FANZCA specialist anaesthetists and experienced anaesthetic nurses deliver safe, hospital-grade anaesthesia using our complete mobile equipment setup.</p>
          <div className="cta-row">
            <Link className="btn btn-primary" href="/contact#enquire">Contact us now</Link>
            <a className="btn btn-secondary" href="#requirements">Clinic suitability requirements</a>
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

        <section className="features" id="requirements">
          <span className="kicker">Clinic suitability requirements</span>
          <h2 className="section-title">Where general anaesthesia can be delivered</h2>
          <p className="section-intro">General anaesthesia can only be safely delivered in clinics that meet strict physical access and space requirements.</p>
          {REQUIREMENTS.map((r, i) => (
            <div className="feature reveal" key={r.title}>
              <p className="f-num">{String(i + 1).padStart(2, '0')}</p>
              <h3 className="f-title">{r.title}</h3>
              <div className="f-copy">
                {r.intro && <p>{r.intro}</p>}
                <ul>{r.items.map((it) => <li key={it}>{it}</li>)}</ul>
                {r.note && <p>{r.note}</p>}
              </div>
            </div>
          ))}
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

        <section id="logistics" className="section">
          <span className="kicker">Logistics &amp; site requirements</span>
          <h2 className="section-title">Setting up on the day</h2>
          <p className="section-intro">To ensure a smooth setup and efficient workflow, please ensure the following requirements can be met:</p>
          <div className="cells reveal">
            <div className="cell"><h3>Clinic access</h3><ul className="checklist"><li>Ground floor access or lift access available</li><li>No stairs or access restrictions</li><li>Parking close to the clinic for our medical vehicle</li><li>Clear access from parking to the treatment room</li></ul></div>
            <div className="cell"><h3>Doorways &amp; access</h3><ul className="checklist"><li>Wide doorways suitable for transporting medical equipment (ideally 900&nbsp;mm or wider)</li><li>Clear hallways and unobstructed access throughout the clinic</li></ul></div>
            <div className="cell"><h3>Treatment room</h3><ul className="checklist"><li>Large enough to comfortably accommodate a minimum of 4–5 people</li><li>Adequate space for monitoring equipment, ventilator and medical trolley</li><li>Standard power outlets available</li><li>Clinical suction available</li><li>Good lighting and ventilation</li></ul></div>
            <div className="cell"><h3>Recovery area</h3><ul className="checklist"><li>Dedicated recovery area for post-procedure monitoring</li><li>Comfortable seating or recovery chair</li><li>Privacy for patients during recovery</li></ul></div>
          </div>
          <p className="fine-print" style={{ maxWidth: 'var(--measure)', fontSize: 16 }}>Our team will liaise with your clinic before the first operating list to confirm access, room layout and equipment positioning, ensuring an efficient setup with minimal disruption to your practice.</p>
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
