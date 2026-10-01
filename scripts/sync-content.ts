// Publishes seed content for the named collections to the live database,
// matching existing items by web address (slug) or page key. Every change goes
// through the normal publishing path, so it appears in version history and the
// activity log and can be restored from the dashboard. Items not in the seed
// are left untouched. Afterwards it refreshes the site's cache.
//
//   npm run sync-content -- treatments locations page_seo
//   SITE_URL=https://sleepanaesthesia.com.au npm run sync-content -- treatments
import './env'
import { createClient } from '@supabase/supabase-js'
import { COLLECTION_BY_KEY } from '../src/content/collections'
import { SEED } from '../src/content/seed'
import type { CollectionKey } from '../src/content/types'
import { validateEntry } from '../src/content/validation'
import { need } from './env'

const KEYED: Partial<Record<CollectionKey, string>> = { treatments: 'slug', locations: 'slug', page_seo: 'page' }
const db = createClient(need('NEXT_PUBLIC_SUPABASE_URL'), need('SUPABASE_SERVICE_ROLE_KEY'), { auth: { persistSession: false } })
const site = (process.env.SITE_URL || 'http://localhost:3000').replace(/\/$/, '')

async function sync(collection: CollectionKey) {
  const keyField = KEYED[collection]
  if (!keyField) throw new Error(`${collection} can't be synced by key (use the dashboard).`)
  const def = COLLECTION_BY_KEY[collection]
  const { data: rows, error } = await db.from('entries').select('id, published_data, draft_data').eq('collection', collection).is('deleted_at', null)
  if (error) throw error
  const byKey = new Map((rows || []).map((r) => [String((r.draft_data ?? r.published_data)?.[keyField]), r]))
  let updated = 0, created = 0, unchanged = 0
  for (const [i, item] of (SEED[collection] as unknown[]).entries()) {
    const r = validateEntry(collection, item)
    if (!r.ok) throw new Error(`${collection}[${i}] failed validation: ${JSON.stringify(r.errors)}`)
    const data = r.data as unknown as Record<string, unknown>
    const key = String(data[keyField])
    const slug = def.slugField ? String(data[def.slugField]) : null
    const existing = byKey.get(key)
    if (existing) {
      if (JSON.stringify(existing.published_data) === JSON.stringify(data) && !existing.draft_data) { unchanged++; await db.from('entries').update({ sort_order: i }).eq('id', existing.id); continue }
      const { error: e } = await db.from('entries').update({ published_data: data, draft_data: null, slug, published_slug: slug, sort_order: i, published_at: new Date().toISOString() }).eq('id', existing.id)
      if (e) throw new Error(`${collection} ${key}: ${e.message}`)
      updated++
    } else {
      const { error: e } = await db.from('entries').insert({ collection, slug, published_slug: slug, sort_order: i, published_data: data, published_at: new Date().toISOString() })
      if (e) throw new Error(`${collection} ${key}: ${e.message}`)
      created++
    }
  }
  console.log(`✓ ${collection}: ${updated} updated, ${created} added, ${unchanged} unchanged`)
}

async function main() {
  const collections = process.argv.slice(2) as CollectionKey[]
  if (!collections.length) throw new Error('Name the collections to sync, e.g. npm run sync-content -- treatments locations')
  for (const c of collections) await sync(c)
  const res = await fetch(`${site}/api/revalidate`, { method: 'POST', headers: { authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`, 'content-type': 'application/json' }, body: JSON.stringify({ collections }) }).catch(() => null)
  console.log(res?.ok ? `✓ cache refreshed on ${site}` : `! could not refresh the cache on ${site}; the site will pick up changes within an hour, or redeploy`)
}

main().catch((e) => { console.error(e.message || e); process.exit(1) })
