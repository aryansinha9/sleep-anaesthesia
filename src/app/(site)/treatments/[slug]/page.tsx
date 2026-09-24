import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Breadcrumbs } from '@/components/site/Breadcrumbs'
import { CloseBand } from '@/components/site/CloseBand'
import { ContentImage } from '@/components/site/ContentImage'
import { Enquiry } from '@/components/site/Enquiry'
import { JsonLd } from '@/components/site/JsonLd'
import { RichText } from '@/components/site/RichText'
import { TreatmentList } from '@/components/site/TreatmentList'
import { getPublishedCollection, getSettings, getTreatment, getTreatments } from '@/lib/data'
import { SITE_URL } from '@/lib/env'
import { breadcrumbSchema, buildMetadata } from '@/lib/seo'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return (await getPublishedCollection('treatments')).map((e) => ({ slug: e.data.slug }))
}

export async function generateMetadata({ params }: Props) {
  const t = await getTreatment((await params).slug)
  if (!t) return {}
  return buildMetadata({ path: `/treatments/${t.slug}`, title: t.seoTitle || t.title, description: t.seoDescription || t.summary, image: t.image })
}

export default async function TreatmentPage({ params }: Props) {
  const { slug } = await params
  const [t, settings, all] = await Promise.all([getTreatment(slug), getSettings(), getTreatments()])
  if (!t) notFound()
  const others = all.filter((x) => x.slug !== t.slug)
  const crumbs = [{ name: 'Sleep treatments', path: '/treatments' }, { name: t.menuLabel, path: `/treatments/${t.slug}` }]
  return (
    <>
      <div className="wrap">
        <Breadcrumbs items={crumbs} />
        <section className="page-hero" style={{ paddingTop: 'var(--leading)' }}>
          <span className="kicker">Sleep treatments</span>
          <h1 className="display">{t.title}</h1>
          <p className="sub">{t.summary}</p>
          <div className="cta-row">
            <a className="btn btn-primary" href="#enquire">Ask about this procedure</a>
            <Link className="btn btn-secondary" href="/patients">Patient information</Link>
          </div>
        </section>
        <hr className="rule2" />
        <section className={`split${t.image ? '' : ' no-media'}`} style={{ alignItems: 'start' }}>
          <RichText html={t.body} />
          {t.image && <figure className="split-figure"><ContentImage image={t.image} sizes="(max-width: 760px) 100vw, 560px" /></figure>}
        </section>
        {others.length > 0 && (
          <section className="section" style={{ paddingTop: 0 }} aria-labelledby="other-h">
            <span className="kicker">Other sleep treatments</span>
            <h2 className="section-title" id="other-h">More procedures we provide sedation for</h2>
            <div style={{ marginTop: 'var(--leading)' }}><TreatmentList treatments={others} /></div>
          </section>
        )}
        <section className="section" style={{ paddingTop: 0 }}>
          <Enquiry settings={settings} audience="patient" page={`treatments/${t.slug}`} title="Ask us about sedation" />
        </section>
      </div>
      <CloseBand lines={['Your dentistry.', 'Our anaesthesia.']} settings={settings} />
      <JsonLd data={[
        breadcrumbSchema(crumbs),
        { '@context': 'https://schema.org', '@type': 'MedicalWebPage', name: t.title, description: t.summary, url: `${SITE_URL}/treatments/${t.slug}`, about: { '@type': 'MedicalProcedure', name: t.menuLabel }, publisher: { '@id': `${SITE_URL}/#organization` } },
      ]} />
    </>
  )
}
