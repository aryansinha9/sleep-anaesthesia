// Loads the approved seed content into Supabase so the site looks identical
// immediately after connecting. Safe to re-run: collections that already have
// content are skipped unless --force is given (which replaces them).
//
//   npm run seed            # fill empty collections
//   npm run seed -- --force # replace ALL content with the seed (destructive)
import './env'
import { createClient } from '@supabase/supabase-js'
import { COLLECTION_BY_KEY } from '../src/content/collections'
import { SEED } from '../src/content/seed'
import type { CollectionKey } from '../src/content/types'
import { validateEntry } from '../src/content/validation'
import { need } from './env'

const force = process.argv.includes('--force')
const db = createClient(need('NEXT_PUBLIC_SUPABASE_URL'), need('SUPABASE_SERVICE_ROLE_KEY'), { auth: { persistSession: false } })

async function main() {
  for (const [collection, items] of Object.entries(SEED) as [CollectionKey, unknown[]][]) {
    const def = COLLECTION_BY_KEY[collection]
    const { count } = await db.from('entries').select('id', { count: 'exact', head: true }).eq('collection', collection)
    if (count && !force) {
      console.log(`- ${collection}: already has ${count} item(s), skipped`)
      continue
    }
    if (count && force) await db.from('entries').delete().eq('collection', collection)
    const rows = items.map((item, i) => {
      const r = validateEntry(collection, item)
      if (!r.ok) throw new Error(`${collection}[${i}] failed validation: ${JSON.stringify(r.errors)}`)
      const data = r.data as unknown as Record<string, unknown>
      const slug = def.slugField ? String(data[def.slugField]) : null
      return { collection, slug, published_slug: slug, sort_order: i, published_data: data, draft_data: null, published_at: new Date().toISOString() }
    })
    if (rows.length) {
      const { error } = await db.from('entries').insert(rows)
      if (error) throw new Error(`${collection}: ${error.message}`)
    }
    console.log(`✓ ${collection}: ${rows.length} item(s) published`)
  }
  console.log('\nSeed complete.')
}

main().catch((e) => { console.error(e.message || e); process.exit(1) })
