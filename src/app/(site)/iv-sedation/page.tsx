import Link from 'next/link'
import { CloseBand } from '@/components/site/CloseBand'
import { ContentImage } from '@/components/site/ContentImage'
import { Enquiry } from '@/components/site/Enquiry'
import { FaqSection } from '@/components/site/FaqSection'
import { JsonLd } from '@/components/site/JsonLd'
import { TreatmentList } from '@/components/site/TreatmentList'
import { VideoSection } from '@/components/site/VideoSection'
import { getFaqs, getSettings, getSlotImage, getTreatments } from '@/lib/data'
import { breadcrumbSchema, buildMetadata } from '@/lib/seo'

// Location-neutral IV sedation page (brief §1.1, §9). Copy is drawn from the
// approved patient and clinic content; the old WordPress /ivsedation/ URL
// redirects here.
export const generateMetadata = () =>
  buildMetadata({ path: '/iv-sedation', pageKey: 'iv_sedation', title: 'IV Sedation for Dental Treatment', description: 'What dental IV sedation is, how it feels and who provides it. Delivered in your dental clinic by FANZCA specialist anaesthetists.' })

export default async function IvSedationPage() {
  const [settings, faqs, image, treatments] = await Promise.all([getSettings(), getFaqs('patients'), getSlotImage('iv_sedation'), getTreatments()])
  const ivFaqs = faqs.filter((f) => f.category === 'iv')
  return (
    <>
      <div className="wrap">
        <section className="page-hero">
          <span className="kicker">IV sedation</span>
          <h1 className="display"><span className="line">IV sedation for dental treatment,</span> <span className="line">by specialist anaesthetists.</span></h1>
          <p className="sub">Intravenous (IV) sedation lets you rest deeply through dental treatment at your own dentist. At Sleep Anaesthesia it is always provided by a FANZCA specialist anaesthetist, supported by an anaesthetic nurse, with hospital-grade monitoring, at dental clinics across Queensland and Victoria.</p>
          <div className="cta-row">
            <Link className="btn btn-primary" href="/patients">Patient information</Link>
            <Link className="btn btn-secondary" href="/clinics">For dental clinics</Link>
          </div>
        </section>

        <hr className="rule2" />

        <section className={`split reveal${image ? '' : ' no-media'}`}>
          <div className="split-copy">
            <span className="kicker">What it is</span>
            <h2 className="section-title">What IV sedation feels like</h2>
            <p className="note">Medication is delivered through a small drip in your arm and makes you feel calm, relaxed and sleepy during your dental procedure. You are in a deeply relaxed state, known as conscious sedation, but still able to respond to instructions so your dentist can work. Most patients remember little or nothing afterwards.</p>
            <p className="note">Your dentist still uses local anaesthetic to numb the area, and the medication has a quick onset and offset, so you wake up quickly once the procedure ends.</p>
            <ul className="checklist" style={{ marginTop: 'var(--leading)' }}>
              <li>Provided by a FANZCA specialist anaesthetist, never a sedationist</li>
              <li>Continuous monitoring of oxygen, ECG, blood pressure and breathing</li>
              <li>At your own dental clinic, with no hospital admission</li>
              <li>Medicare rebate on the anaesthesia fee for eligible patients</li>
            </ul>
          </div>
          {image && <figure className="split-figure"><ContentImage image={image} sizes="(max-width: 760px) 100vw, 640px" /></figure>}
        </section>

        <VideoSection placement="iv_sedation" kicker="IV sedation" title="IV sedation, explained" />

        {treatments.length > 0 && (
          <section className="section" style={{ paddingTop: 0 }} aria-labelledby="iv-treat">
            <span className="kicker">Sleep treatments</span>
            <h2 className="section-title" id="iv-treat">Procedures commonly done under IV sedation</h2>
            <div style={{ marginTop: 'var(--leading)' }}><TreatmentList treatments={treatments} /></div>
          </section>
        )}

        <hr className="rule2" />

        <section className="section">
          <span className="kicker">IV sedation or general anaesthesia?</span>
          <h2 className="section-title">Choosing the right anaesthetic</h2>
          <div className="cells reveal" style={{ marginTop: 'var(--leading)' }}>
            <div className="cell">
              <h3>IV sedation</h3>
              <p>You are deeply relaxed but not fully unconscious. Suitable for most dental procedures, including wisdom teeth, implants and extractions, and for anxious patients having routine work.</p>
            </div>
            <div className="cell">
              <h3>General anaesthesia</h3>
              <p>You are fully unconscious. Used for longer or more complex surgery, and only in clinics that meet our <Link href="/general-anaesthesia">access and safety requirements</Link>.</p>
            </div>
            <div className="cell">
              <h3>Who decides?</h3>
              <p>Your anaesthetist reviews your pre-assessment and medical history and talks you through the safest option before the day.</p>
            </div>
          </div>
        </section>

        <FaqSection id="iv-faq" faqs={ivFaqs} kicker="IV sedation FAQs" title="Common questions about IV sedation" searchLabel="Search IV sedation questions" placeholder="Search, e.g. fasting, driving, pain" />

        <section className="section" style={{ paddingTop: 0 }}>
          <Enquiry settings={settings} audience="patient" page="iv-sedation" title="Ask about IV sedation" />
        </section>
      </div>

      <CloseBand lines={['Sleep through your', 'dental treatment.']} sub="Ask your dentist whether they work with Sleep Anaesthesia, or contact us and we can help." settings={settings} />
      <JsonLd data={breadcrumbSchema([{ name: 'IV sedation', path: '/iv-sedation' }])} />
    </>
  )
}
