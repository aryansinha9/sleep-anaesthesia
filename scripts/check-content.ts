// Validates every seed record against the same rules the dashboard uses,
// so the seeded site can never contain content the dashboard would reject.
import './env'
import { SEED } from '../src/content/seed'
import type { CollectionKey } from '../src/content/types'
import { validateEntry } from '../src/content/validation'

let failures = 0
for (const [collection, items] of Object.entries(SEED) as [CollectionKey, unknown[]][]) {
  items.forEach((item, i) => {
    const r = validateEntry(collection, item)
    if (!r.ok) {
      failures++
      console.error(`✗ ${collection}[${i}]`, r.errors)
    }
  })
  console.log(`✓ ${collection}: ${items.length} checked`)
}
if (failures) {
  console.error(`\n${failures} seed record(s) failed validation.`)
  process.exit(1)
}
console.log('\nAll seed content passes dashboard validation.')
