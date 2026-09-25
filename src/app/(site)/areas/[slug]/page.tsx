import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Breadcrumbs } from '@/components/site/Breadcrumbs'
import { CloseBand } from '@/components/site/CloseBand'
import { Enquiry } from '@/components/site/Enquiry'
import { JsonLd } from '@/components/site/JsonLd'
import { RichText } from '@/components/site/RichText'
import { TreatmentList } from '@/components/site/TreatmentList'
import { getLocation, getLocations, getPublishedCollection, getSettings, getTreatments, locationHasPage } from '@/lib/data'
import { breadcrumbSchema, buildMetadata } from '@/lib/seo'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return (await getPublishedCollection('locations')).map((e) => e.data).filter(locationHasPage).map((l) => ({ slug: l.slug }))
}

export async function generateMetadata({ params }: Props) {
  const l = await getLocation((await params).slug)
  if (!l) return {}
  return buildMetadata({ path: `/areas/${l.slug}`, title: l.seoTitle || `Mobile Dental Sedation in ${l.name}`, description: l.seoDescription || l.summary })
}

export default async function LocationPage({ params }: Props) {
  const { slug } = await params
  const [l, settings, all, treatments] = await Promise.all([getLocation(slug), getSettings(), getLocations(), getTreatments()])
  if (!l) notFound()
  const towns = l.kind === 'primary' && l.name.startsWith('Regional ') ? all.filter((t) => t.kind === 'town' && t.state === l.state) : []
  const crumbs = [{ name: 'Areas we service', path: '/areas' }, { name: l.name, path: `/areas/${l.slug}` }]
  return (
    <>
      <div className="wrap">
        <Breadcrumbs items={crumbs} />
        <section className="page-hero" style={{ paddingTop: 'var(--leading)' }}>
          <span className="kicker">{l.state === 'QLD' ? 'Queensland' : 'Victoria'}</span>
          <h1 className="display">Mobile dental sedation in {l.name}</h1>
          {l.summary && <p className="sub">{l.summary}</p>}
          <div className="cta-row">
            <a className="btn btn-primary" href="#enquire">Enquire about a list</a>
            <Link className="btn btn-secondary" href="/clinics">How it works for clinics</Link>
          </div>
        </section>
        <hr className="rule2" />
        <section className="section">
          <RichText html={l.body} />
          {towns.length > 0 && (
            <>
              <h2 className="section-title" style={{ fontSize: 22, marginTop: 'var(--leading)' }}>Towns we service</h2>
              <ul className="town-list">{towns.map((t) => <li key={t.slug}>{locationHasPage(t) ? <Link href={`/areas/${t.slug}`}>{t.name}</Link> : t.name}</li>)}</ul>
            </>
          )}
        </section>
        {treatments.length > 0 && (
          <section className="section" style={{ paddingTop: 0 }} aria-labelledby="loc-treat">
            <span className="kicker">Sleep treatments</span>
            <h2 className="section-title" id="loc-treat">Procedures we support</h2>
            <div style={{ marginTop: 'var(--leading)' }}><TreatmentList treatments={treatments} /></div>
          </section>
        )}
        <section className="section" style={{ paddingTop: 0 }}>
          <Enquiry settings={settings} audience="clinic" page={`areas/${l.slug}`} title={`Enquire about ${l.name}`} />
        </section>
      </div>
      <CloseBand lines={['Your dentistry.', 'Our anaesthesia.']} settings={settings} />
      <JsonLd data={breadcrumbSchema(crumbs)} />
    </>
  )
}
