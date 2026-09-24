import Link from 'next/link'
import { CloseBand } from '@/components/site/CloseBand'
import { Enquiry } from '@/components/site/Enquiry'
import { Testimonials } from '@/components/site/Extras'
import { Hours } from '@/components/site/Hours'
import { JsonLd } from '@/components/site/JsonLd'
import { getSettings } from '@/lib/data'
import { fullAddress, telHref } from '@/lib/format'
import { breadcrumbSchema, buildMetadata } from '@/lib/seo'

export const generateMetadata = () =>
  buildMetadata({ path: '/contact', pageKey: 'contact', title: 'Contact Sleep Anaesthesia', description: 'Book IV sedation or general anaesthesia for your clinic or procedure. Servicing Queensland and Victoria.' })

export default async function ContactPage() {
  const settings = await getSettings()
  const address = fullAddress(settings)
  return (
    <>
      <div className="wrap">
        <section className="page-hero">
          <span className="kicker">Contact us</span>
          <h1 className="display"><span className="line">Talk to our team.</span></h1>
          <p className="sub">Clinic partnerships, pricing access, patient questions: call, email, or send the form below and a member of our team will respond promptly. A confidential, no-obligation enquiry.</p>
        </section>

        <hr className="rule2" />

        <section className="split split-form reveal">
          <div className="split-copy">
            <span className="kicker">Direct lines</span>
            <ul className="checklist">
              {settings.phone && <li>Phone: <a href={telHref(settings.phone)}>{settings.phone}</a></li>}
              <li>Email: <a href={`mailto:${settings.email}`}>{settings.email}</a></li>
              {settings.socialLinks.map((s) => <li key={s.url}>{s.label}: <a href={s.url} target="_blank" rel="noopener noreferrer">{s.url.replace(/^https?:\/\/(www\.)?/, '')}</a></li>)}
              {settings.chatProvider !== 'none' && settings.chatId && <li>Chat: use the chat button at the bottom of the page, any time</li>}
            </ul>

            <h2 className="section-title" style={{ fontSize: 20, marginTop: 'calc(1.4 * var(--leading))' }}>Office</h2>
            <address className="note" style={{ fontStyle: 'normal' }}>{address}</address>
            <p className="note">This is our office, not a treatment location: we are a mobile service and treatment takes place at your dental clinic.</p>

            <h2 className="section-title" style={{ fontSize: 20, marginTop: 'calc(1.4 * var(--leading))' }}>Office hours</h2>
            <div className="note"><Hours hours={settings.hours} caption="Office hours" /></div>

            <p className="note" style={{ marginTop: 'var(--leading)' }}>Our detailed pricing information is available exclusively for verified dental clinics. Choose &ldquo;Dental clinic&rdquo; on the form and we&apos;ll email you a personalised access code for the <Link href="/portal">dental portal</Link>.</p>
            <p className="note">Servicing dental clinics across Queensland and Victoria. See <Link href="/areas">areas we service</Link>.</p>
          </div>
          <Enquiry settings={settings} audience="clinic" page="contact" title="Send an enquiry" />
        </section>

        {settings.showMap && (
          <section className="section" style={{ paddingTop: 0 }} aria-label="Map">
            <iframe className="map-embed" title={`Map of ${address}`} loading="lazy" referrerPolicy="no-referrer-when-downgrade"
              src={`https://maps.google.com/maps?q=${encodeURIComponent(address)}&z=15&output=embed`} />
          </section>
        )}

        <Testimonials settings={settings} />
      </div>

      <CloseBand lines={['Prefer to just call?']} settings={settings}
        primary={settings.phone ? { href: telHref(settings.phone), label: `Call ${settings.phone}` } : { href: `mailto:${settings.email}`, label: 'Email us' }}
        secondary={{ href: `mailto:${settings.email}`, label: settings.email }} />
      <JsonLd data={breadcrumbSchema([{ name: 'Contact', path: '/contact' }])} />
    </>
  )
}
