import Link from 'next/link'
import { CloseBand } from '@/components/site/CloseBand'
import { Enquiry } from '@/components/site/Enquiry'
import { FaqSection } from '@/components/site/FaqSection'
import { JsonLd } from '@/components/site/JsonLd'
import { TreatmentList } from '@/components/site/TreatmentList'
import { VideoSection } from '@/components/site/VideoSection'
import { getFaqs, getSettings, getTreatments } from '@/lib/data'
import { breadcrumbSchema, buildMetadata, faqSchema } from '@/lib/seo'

export const generateMetadata = () =>
  buildMetadata({ path: '/patients', pageKey: 'patients', title: 'Sleep Dentistry & IV Sedation: Patient Information', description: 'What IV sedation feels like, fasting instructions, Medicare rebates and patient FAQs answered by FANZCA specialist anaesthetists.' })

export default async function PatientsPage() {
  const [settings, faqs, treatments] = await Promise.all([getSettings(), getFaqs('patients'), getTreatments()])
  return (
    <>
      <div className="wrap">
        <section className="page-hero">
          <span className="kicker">Patient info</span>
          <h1 className="display"><span className="line">Sleep dentistry and IV sedation.</span> <span className="line">Safe, comfortable, in specialist hands.</span></h1>
          <p className="sub">If dental anxiety, a strong gag reflex or a long procedure is standing between you and treatment, IV sedation lets you sleep through it at your own dentist. A FANZCA specialist anaesthetist and an anaesthetic nurse look after you the whole time, at dental clinics across Queensland and Victoria. Below: what to expect, how to prepare, and answers to every question about payment, sedation and general anaesthesia.</p>
          <div className="cta-row">
            <a className="btn btn-primary" href="#faq">Find an answer</a>
            <a className="btn btn-secondary" href="#steps">Steps for the day</a>
          </div>
        </section>

        <hr className="rule2" />

        <section className="section">
          <span className="kicker">Sleep dentistry, explained</span>
          <h2 className="section-title">What dental sedation actually feels like</h2>
          <div className="cells reveal" style={{ marginTop: 'var(--leading)' }}>
            <div className="cell">
              <h3>IV (twilight) sedation</h3>
              <p>Medication through a small drip in your arm makes you calm, relaxed and sleepy. You are not fully unconscious, but most patients remember little or nothing afterwards. Local anaesthetic still numbs the teeth, so there is no pain. <Link href="/iv-sedation">More about IV sedation</Link>.</p>
            </div>
            <div className="cell">
              <h3>General anaesthesia</h3>
              <p>A combination of medicines keeps you fully unconscious and pain-free. Used for longer or more complex surgery in clinics that meet our <Link href="/general-anaesthesia">safety and access requirements</Link>.</p>
            </div>
            <div className="cell">
              <h3>Who it helps</h3>
              <p>Severe dental anxiety or phobia, a strong gag reflex, wisdom teeth and implant surgery, All-on-X, and long restorative appointments that would otherwise take several visits.</p>
            </div>
          </div>
        </section>

        <VideoSection placement="patient_info" kicker="Patient info" title="What to expect on the day" />

        {treatments.length > 0 && (
          <section className="section" style={{ paddingTop: 0 }} aria-labelledby="treat-h">
            <span className="kicker">Sleep treatments</span>
            <h2 className="section-title" id="treat-h">Procedures we provide sedation for</h2>
            <div style={{ marginTop: 'var(--leading)' }}><TreatmentList treatments={treatments} /></div>
          </section>
        )}

        <hr className="rule2" />

        <section className="section">
          <span className="kicker">Instructions for the day</span>
          <h2 className="visually-hidden">Instructions for the day</h2>
          <div className="cells reveal">
            <div className="cell">
              <h3>Fasting</h3>
              <ul className="checklist">
                <li>Fast from midnight if your procedure is in the morning</li>
                <li>Fast from 6am if your procedure is in the afternoon</li>
              </ul>
            </div>
            <div className="cell">
              <h3>Your escort home</h3>
              <p>You MUST have a responsible adult to take you home and stay with you for the remainder of the day and night. You will not be allowed to leave alone, drive yourself home, or go home in a limo or taxi unescorted.</p>
            </div>
            <div className="cell">
              <h3>How to prepare</h3>
              <ul className="checklist">
                <li>Plan to arrive on time</li>
                <li>Wear loose, comfortable clothing, as we need access up to your elbows</li>
                <li>Leave as many valuables as possible at home</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="features" id="steps" style={{ paddingTop: 0 }}>
          <span className="kicker">Steps for the day</span>
          <h2 className="section-title">Your appointment, step by step</h2>
          {[
            ['Meet your anaesthetist', 'Your anaesthetist will meet you before your procedure, go through the anaesthetic and answer any questions you have. You will be escorted into the dental surgery, where an IV will be placed and full monitoring applied.'],
            ['Drift off', 'You will be instructed to focus on your breathing with an oxygen mask as you drift into your anaesthesia state by IV injection.'],
            ['Monitored the entire time', 'The anaesthetist and anaesthetic nurse will be monitoring your vital signs the entire time during anaesthesia and the immediate recovery period.'],
            ['Wake up quickly', 'When the procedure concludes, the anaesthetic will be stopped and you will wake up quickly. The medication has a quick onset and offset, enabling rapid induction and waking time.'],
          ].map(([t, c], i) => (
            <div className="feature reveal" key={t}>
              <p className="f-num">{String(i + 1).padStart(2, '0')}</p>
              <h3 className="f-title">{t}</h3>
              <p className="f-copy">{c}</p>
            </div>
          ))}
          <p className="fine-print">We practise an open disclosure policy. <Link href="/contact">Talk to our team</Link> with any medical or general concerns.</p>
        </section>

        <hr className="rule2" />

        <FaqSection faqs={faqs} kicker="Patient FAQs" title="Got a question? Search it." searchLabel="Search frequently asked questions" placeholder="Search all questions, e.g. fasting, Medicare, driving" />

        <section className="section" style={{ paddingTop: 0 }}>
          <Enquiry settings={settings} audience="patient" page="patients" title="Ask us a question" />
        </section>
      </div>

      <CloseBand lines={['Still have a question?']} sub="Contact us directly with any medical or general concerns. We're happy to support you." settings={settings} />
      <JsonLd data={[breadcrumbSchema([{ name: 'Patient info', path: '/patients' }]), faqSchema(faqs)]} />
    </>
  )
}
