import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CloseBand } from '@/components/site/CloseBand'
import { ContentImage } from '@/components/site/ContentImage'
import { JsonLd } from '@/components/site/JsonLd'
import { getSettings, getTreatments } from '@/lib/data'
import { breadcrumbSchema, buildMetadata } from '@/lib/seo'

export const generateMetadata = () =>
  buildMetadata({ path: '/treatments', pageKey: 'treatments', title: 'Sleep Treatments: Dental Procedures Under Sedation', description: 'Dental procedures we provide IV sedation and general anaesthesia for, delivered in your dental clinic by specialist anaesthetists.' })

export default async function TreatmentsPage() {
  const [settings, treatments] = await Promise.all([getSettings(), getTreatments()])
  if (!treatments.length) notFound()
  return (
    <>
      <div className="wrap">
        <section className="page-hero">
          <span className="kicker">Sleep treatments</span>
          <h1 className="display">Dental procedures under sedation</h1>
          <p className="sub">IV sedation and general anaesthesia for these procedures, delivered at your own dental clinic by a FANZCA specialist anaesthetist.</p>
        </section>
        <hr className="rule2" />
        <section className="section">
          <h2 className="visually-hidden">All treatments</h2>
          <div className="cells">
            {treatments.map((t) => (
              <Link className="cell" href={`/treatments/${t.slug}`} key={t.slug}>
                {t.image && <ContentImage image={t.image} sizes="(max-width: 600px) 100vw, 360px" style={{ width: '100%', aspectRatio: '4 / 3', objectFit: 'cover', borderRadius: 'var(--radius-md)', marginBottom: 16 }} />}
                <h3>{t.title}</h3>
                <p>{t.summary}</p>
                <span className="card-link">Read more →</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
      <CloseBand lines={['Not sure which option', 'is right for you?']} sub="Talk to our team about your procedure. We'll explain your options before anything is booked." settings={settings} />
      <JsonLd data={breadcrumbSchema([{ name: 'Sleep treatments', path: '/treatments' }])} />
    </>
  )
}
