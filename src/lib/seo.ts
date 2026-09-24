import 'server-only'
import type { Metadata } from 'next'
import type { DayKey, Faq, ImageRef, Location, SiteSettings } from '@/content/types'
import { getPageSeo, getSettings } from '@/lib/data'
import { SITE_URL } from '@/lib/env'
import { toPlainText } from '@/lib/sanitize'

const DEFAULT_OG = { url: '/uploads/og-sleep-anaesthesia.jpg', width: 1200, height: 630 }

function ogImage(img: ImageRef | null | undefined) {
  return img ? { url: img.src, width: img.width, height: img.height, alt: img.alt } : DEFAULT_OG
}

/** Metadata for a page: dashboard SEO fields first, then the page's defaults. */
export async function buildMetadata(opts: {
  path: string
  pageKey?: string
  title?: string
  description?: string
  image?: ImageRef | null
  noindex?: boolean
}): Promise<Metadata> {
  const [seo, settings] = await Promise.all([opts.pageKey ? getPageSeo(opts.pageKey) : null, getSettings()])
  const title = seo?.title || opts.title || settings.businessName
  const description = seo?.description || opts.description || ''
  const brand = settings.businessName
  const fullTitle = title.includes(brand) ? title : `${title} | ${brand}`
  const image = ogImage(seo?.ogImage || opts.image)
  return {
    title: { absolute: fullTitle },
    description,
    alternates: { canonical: opts.path },
    robots: opts.noindex ? { index: false, follow: false } : undefined,
    openGraph: { type: 'website', siteName: brand, locale: 'en_AU', title: fullTitle, description, url: opts.path, images: [image] },
    twitter: { card: 'summary_large_image', title: fullTitle, description, images: [image.url] },
  }
}

// ─── structured data ─────────────────────────────────────────────────────

const DAY_NAMES: Record<DayKey, string> = { mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday' }

export function toE164(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, '')
  if (digits.startsWith('+')) return digits
  if (digits.startsWith('0')) return '+61' + digits.slice(1)
  return digits
}

export function openingHoursSpec(hours: SiteSettings['hours']) {
  // Group days with identical hours into one specification each.
  const groups = new Map<string, string[]>()
  for (const [day, h] of Object.entries(hours) as [DayKey, SiteSettings['hours'][DayKey]][]) {
    if (h.closed) continue
    const key = `${h.open}-${h.close}`
    groups.set(key, [...(groups.get(key) || []), DAY_NAMES[day]])
  }
  return [...groups.entries()].map(([key, days]) => {
    const [opens, closes] = key.split('-')
    return { '@type': 'OpeningHoursSpecification', dayOfWeek: days, opens, closes }
  })
}

export function organizationSchema(settings: SiteSettings, locations: Location[]) {
  const sameAs = [...settings.socialLinks.map((s) => s.url), settings.googleBusinessProfileUrl].filter(Boolean)
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalBusiness',
    '@id': `${SITE_URL}/#organization`,
    name: settings.businessName,
    url: `${SITE_URL}/`,
    logo: `${SITE_URL}/uploads/sleep-anaesthesia-logo.png`,
    image: `${SITE_URL}/uploads/og-sleep-anaesthesia.jpg`,
    ...(settings.phone ? { telephone: toE164(settings.phone) } : {}),
    email: settings.email,
    description: 'Mobile IV sedation and general anaesthesia for dental clinics, delivered by FANZCA specialist anaesthetists with hospital-grade equipment across Queensland and Victoria.',
    medicalSpecialty: 'Anesthesia',
    address: {
      '@type': 'PostalAddress',
      streetAddress: settings.street,
      addressLocality: settings.suburb,
      addressRegion: settings.state,
      postalCode: settings.postcode,
      addressCountry: 'AU',
    },
    openingHoursSpecification: openingHoursSpec(settings.hours),
    areaServed: [
      { '@type': 'State', name: 'Queensland' },
      { '@type': 'State', name: 'Victoria' },
      ...locations.filter((l) => !/^Regional /.test(l.name)).map((l) => ({ '@type': 'City', name: l.name })),
    ],
    ...(settings.googleBusinessProfileUrl ? { hasMap: settings.googleBusinessProfileUrl } : {}),
    ...(sameAs.length ? { sameAs } : {}),
  }
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [{ name: 'Home', path: '/' }, ...items].map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: SITE_URL + it.path })),
  }
}

export function faqSchema(faqs: Faq[]) {
  if (!faqs.length) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: toPlainText(f.answer.replace(/<\/(p|li)>/g, ' ')).replace(/\s+/g, ' ').trim() },
    })),
  }
}

export async function siteSettingsForSchema() {
  return getSettings()
}
