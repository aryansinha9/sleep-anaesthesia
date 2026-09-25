import Link from 'next/link'
import { ContentImage } from '@/components/site/ContentImage'
import { CloseBand } from '@/components/site/CloseBand'
import { Enquiry } from '@/components/site/Enquiry'
import { PhotoGrid, Testimonials } from '@/components/site/Extras'
import { TreatmentList } from '@/components/site/TreatmentList'
import { VideoSection } from '@/components/site/VideoSection'
import { getHome, getLocations, getSettings, getSlotImage, getTreatments } from '@/lib/data'
import { telHref } from '@/lib/format'
import { buildMetadata } from '@/lib/seo'

export const generateMetadata = () =>
  buildMetadata({ path: '/', pageKey: 'home', title: 'Mobile IV Sedation & General Anaesthesia for Dental Clinics', description: 'Specialist sleep dentistry and IV sedation delivered at your dental clinic across Queensland and Victoria.' })

export default async function HomePage() {
  const [home, settings, hero, setup, treatments, locations] = await Promise.all([getHome(), getSettings(), getSlotImage('home_hero'), getSlotImage('home_setup'), getTreatments(), getLocations()])
  const primaries = locations.filter((l) => l.kind === 'primary')

  return (
    <>
    <div className="wrap">
      <section className="hero-photo">
        {hero && (
          <figure className="hero-media">
            <ContentImage image={hero} sizes="(max-width: 1180px) 100vw, 1180px" priority />
            {settings.phone && (
              <div className="hero-chip">
                <div><span className="chip-label">Queensland &amp; Victoria</span><strong style={{ fontSize: 15 }}>Call us</strong></div>
                <a className="btn btn-gold" href={telHref(settings.phone)}>{settings.phone}</a>
              </div>
            )}
          </figure>
        )}
        <div className={`hero-card${hero ? '' : ' no-media'}`}>
          {home.heroKicker && <span className="kicker">{home.heroKicker}</span>}
          <h1 className="display">{home.heroHeadline}</h1>
          <p className="sub">{home.heroSubheading}</p>
          <div className="cta-row">
            <Link className="btn btn-primary" href={home.primaryCtaHref}>{home.primaryCtaText}</Link>
            {home.secondaryCtaText && home.secondaryCtaHref && <Link className="btn btn-secondary" href={home.secondaryCtaHref}>{home.secondaryCtaText}</Link>}
          </div>
          <p className="fine-print">Medicare rebates processed for you. Payment plans available. <Link href="/pricing">Dental sedation fees and payment plans</Link></p>
        </div>
      </section>

      {home.stats.length > 0 && (
        <>
          <hr className="rule2" />
          <section className="stats" aria-label={`${settings.businessName}, by the numbers`}>
            <div className="grid">
              {home.stats.map((s) => (
                <div key={s.label}><p className="stat-num">{s.value}</p><p className="stat-label">{s.label}</p></div>
              ))}
            </div>
          </section>
        </>
      )}

      <hr className="rule2" />

      <section className="features" id="clinics">
        <span className="kicker">For dental clinics</span>
        <h2 className="section-title">Mobile IV sedation for dental clinics, at no cost to your practice</h2>
        <p className="section-intro">We come to you with a complete anaesthetic setup, run the list, recover the patients and handle every form and Medicare claim. Your practice keeps its chair time and its patients.</p>
        {[
          ['No commitment', 'Ad-hoc lists welcomed. Regular lists also facilitated: book the days that suit your practice.'],
          ['No cost to your clinic', 'Patients are charged directly, and attract a Medicare rebate too.'],
          ['Sedation fully managed by us', 'We liaise with patients directly. All payments, questionnaires and rebates are handled by us, and any pre- or post-procedure questions are managed by our team, meaning no extra work for your clinic.'],
          ['Hospital-quality anaesthesia', 'We only use medically trained anaesthesiologists, no sedationists or upskilled GP sedationists. Hospital-grade equipment and medications.'],
        ].map(([t, c], i) => (
          <div className="feature reveal" key={t}>
            <p className="f-num">{String(i + 1).padStart(2, '0')}</p>
            <h3 className="f-title">{t}</h3>
            <p className="f-copy">{c}</p>
          </div>
        ))}
        <div className="cta-row">
          <Link className="btn btn-primary" href="/contact#enquire">Contact us now</Link>
          <Link className="btn btn-ghost" href="/clinics">How mobile dental sedation works for clinics →</Link>
        </div>
      </section>

      <VideoSection placement="clinics_overview" kicker="For dental clinics" title="See how a mobile sedation list works" />

      <section className={`split tinted reveal${setup ? '' : ' no-media'}`} id="specialists">
        <div className="split-copy">
          <span className="kicker">The medical difference</span>
          <h2 className="section-title">Specialist anaesthetists, not sedationists</h2>
          <p className="note">In Australia, dental sedation can be provided by a dentist or GP with a sedation qualification, or by a specialist anaesthetist. Sleep Anaesthesia only uses the latter: medical doctors who hold Fellowship of the Australian and New Zealand College of Anaesthetists (FANZCA).</p>
          <p className="note">That matters for two reasons. The anaesthetist&apos;s only job in the room is your airway, your breathing and your vital signs, while the dentist&apos;s only job is your teeth. And because a specialist anaesthetist is providing the service, eligible patients receive a Medicare rebate on the anaesthesia fee.</p>
          <ul className="checklist navy" style={{ marginTop: 'var(--leading)' }}>
            <li>FANZCA specialist anaesthetists, ANZCA-accredited</li>
            <li>A dedicated anaesthetic nurse or technician on every list</li>
            <li>Continuous monitoring: oxygen saturation, ECG, blood pressure and respiration</li>
            <li>Full emergency equipment and medications brought to every case</li>
          </ul>
        </div>
        {setup && <figure className="split-figure"><ContentImage image={setup} sizes="(max-width: 760px) 100vw, 640px" /></figure>}
      </section>

      <PhotoGrid slot="team" kicker="Our team" title="The team in action" intro="Specialist anaesthetists and anaesthetic nurses, working alongside your dental team." />

      {treatments.length > 0 && (
        <section className="section" aria-labelledby="treatments-h">
          <span className="kicker">Sleep treatments</span>
          <h2 className="section-title" id="treatments-h">Dental procedures we provide sedation for</h2>
          <p className="section-intro">From a single anxious appointment to full-arch surgery.</p>
          <TreatmentList treatments={treatments} />
        </section>
      )}

      <hr className="rule2" />

      <section className="section">
        <span className="kicker">Who we help</span>
        <h2 className="section-title">Dental sedation for clinics and for patients</h2>
        <div className="cells reveal" style={{ marginTop: 'var(--leading)' }}>
          <div className="cell">
            <span className="kicker">For dental clinics</span>
            <h3>Offer sedation without the overheads</h3>
            <p>Fully mobile IV sedation and general anaesthesia, delivered by FANZCA specialist anaesthetists. We bring all equipment, medications and monitoring, with minimal disruption to your practice.</p>
            <p style={{ marginTop: 14 }}><Link className="btn btn-secondary" href="/clinics">Mobile IV sedation for dental clinics</Link></p>
          </div>
          <div className="cell">
            <span className="kicker">For patients</span>
            <h3>Anxious about the dentist? Sleep through it</h3>
            <p>Qualified specialist anaesthetists and anaesthetic nurses, safe and comfortable. Fasting instructions, what to expect on the day, and answers to every payment and Medicare question.</p>
            <p style={{ marginTop: 14 }}><Link className="btn btn-secondary" href="/patients">Sleep dentistry for patients</Link></p>
          </div>
          <div className="cell cell-dark">
            <span className="kicker">Fees</span>
            <h3>One all-inclusive fee. No surprises</h3>
            <p>Patients are charged directly, Medicare rebates are processed on your behalf, and payment plans are available through TLC.</p>
            <p style={{ marginTop: 14 }}><Link className="btn btn-gold" href="/pricing">Dental sedation fees &amp; Medicare rebates</Link></p>
          </div>
        </div>
      </section>

      <hr className="rule2" />

      <section id="areas" className="section">
        <span className="kicker">Where we work</span>
        <h2 className="section-title">Mobile dental sedation across Queensland and Victoria</h2>
        <p className="section-intro">We are a mobile service: there is no clinic to travel to. Your anaesthetist comes to the dental practice where your treatment is already booked.</p>
        <div className="cells reveal">
          {primaries.map((l) => (
            <Link className="cell" href={`/areas/${l.slug}`} key={l.slug}>
              <h3>{l.name}</h3>
              <p>{l.summary}</p>
            </Link>
          ))}
        </div>
        <p className="fine-print">Not sure whether your clinic is covered? See <Link href="/areas">all areas we service</Link> or <Link href="/contact">ask us</Link>.</p>
      </section>

      <Testimonials settings={settings} />

      <section className="section" style={{ paddingTop: 0 }}>
        <Enquiry settings={settings} audience="clinic" page="home" title="Quick enquiry" />
      </section>

    </div>
    <CloseBand lines={['Your dentistry.', 'Our anaesthesia.']} sub={`${settings.phone ? `Call today on ${settings.phone}, email` : 'Email'} ${settings.email}, or follow @sleepanaesthesia on Instagram.`} settings={settings} />
    </>
  )
}
