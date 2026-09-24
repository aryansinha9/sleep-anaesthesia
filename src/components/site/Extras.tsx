import Link from 'next/link'
import type { SiteSettings } from '@/content/types'
import { getBeforeAfter, getMedia, getTestimonials } from '@/lib/data'
import { formatMoney } from '@/lib/format'
import { ContentImage } from './ContentImage'

/** Minimum booking values: rendered only when switched on in Site settings. */
export function MinimumBooking({ settings }: { settings: SiteSettings }) {
  if (!settings.showMinBooking) return null
  return (
    <section className="section" style={{ paddingTop: 0 }} aria-labelledby="min-booking">
      <span className="kicker">Minimum bookings</span>
      <h2 className="section-title" id="min-booking">Booking a list</h2>
      <div className="cells" style={{ marginTop: 'var(--leading)' }}>
        <div className="cell">
          <h3>Standard lists</h3>
          <p>Minimum booking {formatMoney(settings.minBookingStandard)}. Bookings from {formatMoney(settings.minBookingStandardConsidered)} will be considered.</p>
        </div>
        <div className="cell">
          <h3>Regional &amp; outreach centres</h3>
          <p>Minimum booking {formatMoney(settings.minBookingRegional)}+ (will be considered).</p>
        </div>
      </div>
    </section>
  )
}

/** A multi-photo media slot as a grid. Collapses when the slot is empty. */
export async function PhotoGrid({ slot, kicker, title, intro }: { slot: string; kicker: string; title: string; intro?: string }) {
  const items = await getMedia(slot)
  if (!items.length) return null
  return (
    <section className="section" aria-label={title}>
      <span className="kicker">{kicker}</span>
      <h2 className="section-title">{title}</h2>
      {intro && <p className="section-intro">{intro}</p>}
      <div className="gallery-grid">
        {items.map((m, i) => (
          <figure key={i}>
            <ContentImage image={m.image} sizes="(max-width: 600px) 100vw, 380px" />
            {m.caption && <figcaption>{m.caption}</figcaption>}
          </figure>
        ))}
      </div>
    </section>
  )
}

/** Testimonials are hidden unless enabled in Site settings (Ahpra, brief §13 item 6).
 *  The Google review link shows whenever a review URL is set. */
export async function Testimonials({ settings }: { settings: SiteSettings }) {
  const items = await getTestimonials()
  if (!items.length) {
    if (!settings.googleReviewUrl) return null
    return (
      <p className="fine-print" style={{ margin: '0 0 var(--leading)' }}>
        Worked with us? <a href={settings.googleReviewUrl} target="_blank" rel="noopener noreferrer">Leave us a Google review</a>.
      </p>
    )
  }
  return (
    <section className="section" aria-labelledby="reviews">
      <span className="kicker">Reviews</span>
      <h2 className="section-title" id="reviews">What people say</h2>
      <div className="cells" style={{ marginTop: 'var(--leading)' }}>
        {items.map((t, i) => (
          <figure className="cell" key={i}>
            <blockquote className="quote">“{t.text}”</blockquote>
            <figcaption className="quote-by">{t.name}</figcaption>
          </figure>
        ))}
      </div>
      {settings.googleReviewUrl && (
        <p style={{ marginTop: 'var(--leading)' }}><a className="btn btn-secondary" href={settings.googleReviewUrl} target="_blank" rel="noopener noreferrer">Leave us a Google review</a></p>
      )}
    </section>
  )
}

/** Hidden unless enabled in Site settings (Ahpra compliance, brief §13 item 6). */
export async function BeforeAfterGallery() {
  const pairs = await getBeforeAfter()
  if (!pairs.length) return null
  return (
    <section className="section" aria-labelledby="before-after">
      <span className="kicker">Results</span>
      <h2 className="section-title" id="before-after">Before and after</h2>
      <div className="gallery-grid">
        {pairs.map((p, i) => (
          <figure key={i}>
            <div className="ba-pair">
              <div><ContentImage image={p.before} sizes="190px" /><p className="ba-label">Before</p></div>
              <div><ContentImage image={p.after} sizes="190px" /><p className="ba-label">After</p></div>
            </div>
            <figcaption>{p.title}{p.caption ? `: ${p.caption}` : ''}</figcaption>
          </figure>
        ))}
      </div>
      <p className="fine-print">Individual results vary. <Link href="/contact">Talk to us</Link> about your treatment.</p>
    </section>
  )
}
