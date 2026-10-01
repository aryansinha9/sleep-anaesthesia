import { timingSafeEqual } from 'node:crypto'
import { revalidateTag } from 'next/cache'
import { NextResponse, type NextRequest } from 'next/server'
import { isCollectionKey } from '@/content/collections'
import { tagFor } from '@/lib/data'

// Lets the content scripts (scripts/sync-content.ts) refresh the live site's
// cache after writing to the database directly. Requires the service role key,
// which only the server and the site owner have. Dashboard publishes don't use
// this: they refresh the cache themselves.
export async function POST(req: NextRequest) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  const given = (req.headers.get('authorization') || '').replace(/^Bearer /, '')
  const ok = key.length > 0 && given.length === key.length && timingSafeEqual(Buffer.from(given), Buffer.from(key))
  if (!ok) return NextResponse.json({ error: 'Not authorised' }, { status: 401 })
  const body = (await req.json().catch(() => ({}))) as { collections?: string[] }
  const collections = (body.collections || []).filter(isCollectionKey)
  for (const c of collections) revalidateTag(tagFor(c), { expire: 0 })
  return NextResponse.json({ revalidated: collections })
}
