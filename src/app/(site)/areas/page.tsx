import Link from 'next/link'
import { CloseBand } from '@/components/site/CloseBand'
import { JsonLd } from '@/components/site/JsonLd'
import type { Location } from '@/content/types'
import { getLocations, getSettings, locationHasPage } from '@/lib/data'
import { breadcrumbSchema, buildMetadata } from '@/lib/seo'

export const generateMetadata = () =>
  buildMetadata({ path: '/areas', pageKey: 'areas', title: 'Areas We Service: Queensland & Victoria', description: 'Mobile dental sedation for clinics in Brisbane, the Gold Coast, Sunshine Coast, Toowoomba, regional Queensland, Melbourne and regional Victoria.' })

function TownList({ towns }: { towns: Location[] }) {
  if (!towns.length) return null
  return (
    <>
      <h3 style={{ fontSize: 16, margin: '18px 0 8px' }}>Towns we service</h3>
      <ul className="town-list">
        {towns.map((t) => <li key={t.slug}>{locationHasPage(t) ? <Link href={`/areas/${t.slug}`}>{t.name}</Link> : t.name}</li>)}
      </ul>
    </>
  )
}

// Service-area hub (brief §1.3). Primary areas link to their own pages; towns
// are listed as plain text unless an admin has written a page for them.
export default async function AreasPage() {
  const [settings, locations] = await Promise.all([getSettings(), getLocations()])
  const states = [
    { code: 'QLD', name: 'Queensland' },
    { code: 'VIC', name: 'Victoria' },
  ] as const
  return (
    <>
      <div className="wrap">
        <section className="page-hero">
          <span className="kicker">Areas we service</span>
          <h1 className="display">Mobile dental sedation across Queensland and Victoria</h1>
          <p className="sub">We are a mobile service: your anaesthetist comes to the dental practice where your treatment is booked. We cover metropolitan and regional clinics in both states, with outreach lists for regional centres.</p>
        </section>
        <hr className="rule2" />
        {states.map((s) => {
          const primaries = locations.filter((l) => l.state === s.code && l.kind === 'primary')
          const towns = locations.filter((l) => l.state === s.code && l.kind === 'town')
          const regionName = s.code === 'QLD' ? 'Regional Queensland' : 'Regional Victoria'
          return (
            <section className="section" key={s.code} aria-labelledby={`state-${s.code}`}>
              <span className="kicker">{s.code}</span>
              <h2 className="section-title" id={`state-${s.code}`}>{s.name}</h2>
              <div className="cells" style={{ marginTop: 'var(--leading)' }}>
                {primaries.map((l) => (
                  <div className="cell" key={l.slug}>
                    <h3><Link href={`/areas/${l.slug}`}>{l.name}</Link></h3>
                    <p>{l.summary}</p>
                    {l.name === regionName && <TownList towns={towns} />}
                  </div>
                ))}
              </div>
              {!primaries.some((l) => l.name === regionName) && <TownList towns={towns} />}
            </section>
          )
        })}
        <p className="fine-print" style={{ marginBottom: 'var(--leading)' }}>Not sure whether your clinic is covered? <Link href="/contact">Ask us</Link>.</p>
      </div>
      <CloseBand lines={['Bring specialist sedation', 'to your clinic.']} settings={settings} />
      <JsonLd data={breadcrumbSchema([{ name: 'Areas we service', path: '/areas' }])} />
    </>
  )
}
