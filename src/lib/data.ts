import 'server-only'
import { unstable_cache } from 'next/cache'
import { draftMode } from 'next/headers'
import { cache } from 'react'
import { SEED } from '@/content/seed'
import type {
  Banner, BeforeAfter, CollectionData, CollectionKey, Entry, Faq, FaqPage, HomeContent, Location, MediaItem, PageSeo, SiteSettings, Testimonial, Treatment, Video, VideoPlacement,
} from '@/content/types'
import { getSessionState } from '@/lib/auth'
import { supabaseConfigured } from '@/lib/env'
import { createSupabasePublicClient } from '@/lib/supabase/public'
import { createSupabaseServerClient } from '@/lib/supabase/server'

// ─────────────────────────────────────────────────────────────────────────
// Typed data-access layer. Pages call the getters at the bottom of this file
// and never query the database directly.
//
//  • No Supabase env vars  → seed content (src/content/seed).
//  • Supabase connected    → published rows from the `published_entries`
//                            view, cached and tagged per collection so a
//                            publish refreshes the affected pages at once.
//  • Draft mode (preview)  → signed-in staff see draft versions, uncached.
// ─────────────────────────────────────────────────────────────────────────

export const tagFor = (collection: CollectionKey) => `content:${collection}`

function seedEntries<K extends CollectionKey>(collection: K): Entry<K>[] {
  return (SEED[collection] as CollectionData[K][]).map((data, i) => ({ id: `seed-${collection}-${i}`, order: i, data }))
}

function loadPublished<K extends CollectionKey>(collection: K): Promise<Entry<K>[]> {
  if (!supabaseConfigured) return Promise.resolve(seedEntries(collection))
  return unstable_cache(
    async () => {
      const { data, error } = await createSupabasePublicClient()
        .from('published_entries')
        .select('id, sort_order, data')
        .eq('collection', collection)
        .order('sort_order', { ascending: true })
      if (error) throw new Error(`Failed to load ${collection}: ${error.message}`)
      return (data || []).map((r) => ({ id: r.id as string, order: r.sort_order as number, data: r.data as CollectionData[K] }))
    },
    ['published', collection],
    { tags: [tagFor(collection), 'content'], revalidate: 3600 },
  )()
}

async function loadDraft<K extends CollectionKey>(collection: K): Promise<Entry<K>[]> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('entries')
    .select('id, sort_order, draft_data, published_data')
    .eq('collection', collection)
    .is('deleted_at', null)
    .order('sort_order', { ascending: true })
  if (error) throw new Error(`Failed to load draft ${collection}: ${error.message}`)
  return (data || [])
    .map((r) => ({ id: r.id as string, order: r.sort_order as number, data: (r.draft_data ?? r.published_data) as CollectionData[K] }))
    .filter((e) => e.data)
}

async function isPreview(): Promise<boolean> {
  if (!supabaseConfigured) return false
  try {
    if (!(await draftMode()).isEnabled) return false
  } catch {
    return false // outside a request (build, sitemap generation)
  }
  return (await getSessionState()).status === 'staff'
}

const getCollection = cache(async <K extends CollectionKey>(collection: K): Promise<Entry<K>[]> => {
  return (await isPreview()) ? loadDraft(collection) : loadPublished(collection)
})

/** Published-only read, safe outside a request (sitemap, static params). */
export const getPublishedCollection = loadPublished

async function singleton<K extends 'settings' | 'home' | 'banner'>(key: K): Promise<CollectionData[K]> {
  const rows = await getCollection(key)
  // Merge over seed defaults so a missing row or newly added field never breaks a page.
  return { ...(SEED[key][0] as CollectionData[K]), ...(rows[0]?.data || {}) }
}

// ─── Getters used by pages ───────────────────────────────────────────────

export const getSettings = (): Promise<SiteSettings> => singleton('settings')
export const getHome = (): Promise<HomeContent> => singleton('home')

export async function getActiveBanner(now = new Date()): Promise<Banner | null> {
  const b = await singleton('banner')
  if (!b.enabled || !b.message) return null
  const today = now.toISOString().slice(0, 10)
  if (b.startsAt && today < b.startsAt) return null
  if (b.endsAt && today > b.endsAt) return null
  return b
}

export async function getTreatments(): Promise<Treatment[]> {
  return (await getCollection('treatments')).map((e) => e.data)
}

export async function getTreatment(slug: string): Promise<Treatment | null> {
  return (await getTreatments()).find((t) => t.slug === slug) || null
}

/** Primary areas plus active towns. Inactive towns never leave this layer. */
export async function getLocations(): Promise<Location[]> {
  return (await getCollection('locations')).map((e) => e.data).filter((l) => l.kind === 'primary' || l.active)
}

export const locationHasPage = (l: Location) => l.kind === 'primary' || (l.active && l.hasPage)

export async function getLocation(slug: string): Promise<Location | null> {
  const l = (await getLocations()).find((x) => x.slug === slug)
  return l && locationHasPage(l) ? l : null
}

const playable = (v: Video) => v.visible && (v.source === 'upload' ? Boolean(v.fileUrl && v.poster) : Boolean(v.url))

export async function getVideo(placement: Exclude<VideoPlacement, 'gallery'>): Promise<Video | null> {
  return (await getCollection('videos')).map((e) => e.data).find((v) => v.placement === placement && playable(v)) || null
}

export async function getGalleryVideos(): Promise<Video[]> {
  return (await getCollection('videos')).map((e) => e.data).filter((v) => v.placement === 'gallery' && playable(v))
}

export async function getMedia(slot: string): Promise<MediaItem[]> {
  return (await getCollection('media')).map((e) => e.data).filter((m) => m.slot === slot && m.image)
}

export async function getSlotImage(slot: string) {
  return (await getMedia(slot))[0]?.image || null
}

export async function getFaqs(page: FaqPage): Promise<Faq[]> {
  return (await getCollection('faqs')).map((e) => e.data).filter((f) => f.page === page)
}

export async function getTestimonials(): Promise<Testimonial[]> {
  if (!(await getSettings()).testimonialsEnabled) return []
  return (await getCollection('testimonials')).map((e) => e.data).filter((t) => t.visible)
}

export async function getBeforeAfter(): Promise<BeforeAfter[]> {
  if (!(await getSettings()).beforeAfterEnabled) return []
  return (await getCollection('before_after')).map((e) => e.data).filter((b) => b.before && b.after)
}

export async function getPageSeo(page: string): Promise<PageSeo | null> {
  return (await getCollection('page_seo')).map((e) => e.data).find((p) => p.page === page) || null
}

export { isPreview }
