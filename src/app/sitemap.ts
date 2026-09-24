import type { MetadataRoute } from 'next'
import { getPublishedCollection, locationHasPage } from '@/lib/data'
import { SITE_URL } from '@/lib/env'

export const revalidate = 3600

// Generated from published content. /admin, /api and the noindex portal are
// never listed; the gallery is listed only once it has content.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [treatments, locations, media, videos] = await Promise.all([
    getPublishedCollection('treatments'), getPublishedCollection('locations'), getPublishedCollection('media'), getPublishedCollection('videos'),
  ])
  const now = new Date()
  const url = (path: string, priority = 0.7): MetadataRoute.Sitemap[number] => ({ url: SITE_URL + path, lastModified: now, priority })
  const hasGallery = media.some((m) => m.data.slot === 'gallery' && m.data.image) || videos.some((v) => v.data.placement === 'gallery' && v.data.visible)
  return [
    url('/', 1),
    url('/iv-sedation', 0.9),
    url('/clinics', 0.9),
    url('/patients', 0.9),
    url('/general-anaesthesia', 0.8),
    ...(treatments.length ? [url('/treatments', 0.8)] : []),
    ...treatments.map((t) => url(`/treatments/${t.data.slug}`, 0.8)),
    url('/areas', 0.8),
    ...locations.map((l) => l.data).filter((l) => (l.kind === 'primary' || l.active) && locationHasPage(l)).map((l) => url(`/areas/${l.slug}`, 0.7)),
    url('/pricing', 0.6),
    url('/contact', 0.6),
    ...(hasGallery ? [url('/gallery', 0.5)] : []),
    url('/privacy', 0.2),
  ]
}
