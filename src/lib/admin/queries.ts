import 'server-only'
import { COLLECTION_BY_KEY } from '@/content/collections'
import type { CollectionKey } from '@/content/types'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export type EntryStatus = 'live' | 'changes' | 'draft'

export type AdminEntry = {
  id: string
  collection: CollectionKey
  order: number
  status: EntryStatus
  data: Record<string, unknown>
  publishedData: Record<string, unknown> | null
  updatedAt: string
  publishedAt: string | null
  deletedAt: string | null
}

type Row = { id: string; collection: CollectionKey; sort_order: number; draft_data: Record<string, unknown> | null; published_data: Record<string, unknown> | null; updated_at: string; published_at: string | null; deleted_at: string | null }

function toEntry(r: Row): AdminEntry {
  return {
    id: r.id,
    collection: r.collection,
    order: r.sort_order,
    status: r.published_data ? (r.draft_data ? 'changes' : 'live') : 'draft',
    data: (r.draft_data ?? r.published_data)!,
    publishedData: r.published_data,
    updatedAt: r.updated_at,
    publishedAt: r.published_at,
    deletedAt: r.deleted_at,
  }
}

const COLS = 'id, collection, sort_order, draft_data, published_data, updated_at, published_at, deleted_at'

export async function listEntries(collection: CollectionKey): Promise<AdminEntry[]> {
  const db = await createSupabaseServerClient()
  const { data, error } = await db.from('entries').select(COLS).eq('collection', collection).is('deleted_at', null).order('sort_order').order('created_at')
  if (error) throw error
  return (data as Row[]).map(toEntry)
}

export async function listAllEntries(): Promise<AdminEntry[]> {
  const db = await createSupabaseServerClient()
  const { data, error } = await db.from('entries').select(COLS).is('deleted_at', null).order('sort_order')
  if (error) throw error
  return (data as Row[]).map(toEntry)
}

export async function getEntry(collection: CollectionKey, id: string): Promise<AdminEntry | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null
  const db = await createSupabaseServerClient()
  const { data } = await db.from('entries').select(COLS).eq('collection', collection).eq('id', id).is('deleted_at', null).maybeSingle()
  return data ? toEntry(data as Row) : null
}

export async function getSingleton(collection: CollectionKey): Promise<AdminEntry | null> {
  const db = await createSupabaseServerClient()
  const { data } = await db.from('entries').select(COLS).eq('collection', collection).is('deleted_at', null).maybeSingle()
  return data ? toEntry(data as Row) : null
}

export type Version = { id: number; kind: 'draft' | 'published'; createdAt: string; by: string | null; data: Record<string, unknown> }

export async function getVersions(entryId: string): Promise<Version[]> {
  const db = await createSupabaseServerClient()
  const { data } = await db.from('entry_versions').select('id, kind, created_at, created_by, data').eq('entry_id', entryId).order('created_at', { ascending: false }).limit(30)
  const ids = [...new Set((data || []).map((v) => v.created_by).filter(Boolean))]
  const { data: users } = ids.length ? await db.from('admin_users').select('user_id, email').in('user_id', ids) : { data: [] }
  const emails = Object.fromEntries((users || []).map((u) => [u.user_id, u.email]))
  return (data || []).map((v) => ({ id: v.id, kind: v.kind, createdAt: v.created_at, by: v.created_by ? emails[v.created_by] || 'another user' : 'system', data: v.data }))
}

export async function listDeleted(): Promise<AdminEntry[]> {
  const db = await createSupabaseServerClient()
  const since = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString()
  const { data } = await db.from('entries').select(COLS).not('deleted_at', 'is', null).gte('deleted_at', since).order('deleted_at', { ascending: false })
  return ((data || []) as Row[]).map(toEntry)
}

export function entryTitle(e: { collection: CollectionKey; data: Record<string, unknown> }): string {
  const def = COLLECTION_BY_KEY[e.collection]
  const v = e.data?.[def.titleField]
  return String(v || '').trim() || '(untitled)'
}
