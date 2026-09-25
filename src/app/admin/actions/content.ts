'use server'

import { revalidatePath, updateTag } from 'next/cache'
import { COLLECTION_BY_KEY, isCollectionKey } from '@/content/collections'
import type { CollectionKey } from '@/content/types'
import { validateEntry } from '@/content/validation'
import { guard, UserError, type ActionResult } from '@/lib/admin/result'
import { requireStaff } from '@/lib/auth'
import { tagFor } from '@/lib/data'
import { createSupabaseServerClient } from '@/lib/supabase/server'

// Content actions. Every action re-checks the session and role on the server,
// and the database enforces the same rules again through RLS.

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const PATH_PREFIX: Partial<Record<CollectionKey, string>> = { treatments: '/treatments/', locations: '/areas/' }

function collectionOf(value: string): CollectionKey {
  if (!isCollectionKey(value)) throw new UserError('Unknown content type.')
  return value
}

function assertId(id: string) {
  if (!UUID.test(id)) throw new UserError('Unknown item.')
}

async function authorFor(collection: CollectionKey) {
  return requireStaff(COLLECTION_BY_KEY[collection].adminOnly ? 'admin' : 'editor')
}

function refreshLive(collection: CollectionKey) {
  // Expire cached data immediately so the next visitor sees the change.
  updateTag(tagFor(collection))
  revalidatePath('/admin', 'layout')
}

/** Save a draft. Never touches the live site. Returns the entry id. */
export async function saveDraft(collectionKey: string, id: string | null, input: unknown): Promise<ActionResult<{ id: string }>> {
  return guard(async () => {
    const collection = collectionOf(collectionKey)
    await authorFor(collection)
    const def = COLLECTION_BY_KEY[collection]
    const result = validateEntry(collection, input)
    if (!result.ok) throw new UserError('Please fix the highlighted fields.', result.errors)
    const data = result.data as unknown as Record<string, unknown>
    const slug = def.slugField ? String(data[def.slugField]) : null

    const db = await createSupabaseServerClient()
    if (slug) {
      let q = db.from('entries').select('id').eq('collection', collection).eq('slug', slug).is('deleted_at', null)
      if (id) q = q.neq('id', id)
      const { data: clash } = await q.limit(1)
      if (clash?.length) throw new UserError('That web address is already used by another item.', { [def.slugField!]: 'This web address is already in use. Choose another.' })
    }

    if (id) {
      assertId(id)
      const { data: updated, error } = await db.from('entries').update({ draft_data: data, slug }).eq('id', id).eq('collection', collection).is('deleted_at', null).select('id')
      if (error) throw error
      if (!updated?.length) throw new UserError('This item could not be saved. It may have been deleted, or you may not have permission.')
      return { ok: true, data: { id }, message: 'Draft saved. The live site has not changed.' }
    }

    if (def.singleton) {
      const { data: existing } = await db.from('entries').select('id').eq('collection', collection).is('deleted_at', null).maybeSingle()
      if (existing) {
        const { error } = await db.from('entries').update({ draft_data: data }).eq('id', existing.id).eq('collection', collection)
        if (error) throw error
        return { ok: true, data: { id: existing.id as string }, message: 'Draft saved. The live site has not changed.' }
      }
    }
    const { data: max } = await db.from('entries').select('sort_order').eq('collection', collection).order('sort_order', { ascending: false }).limit(1)
    const { data: row, error } = await db
      .from('entries')
      .insert({ collection, slug, draft_data: data, sort_order: (max?.[0]?.sort_order ?? -1) + 1 })
      .select('id')
      .single()
    if (error) throw error
    return { ok: true, data: { id: row.id as string }, message: 'Draft saved. The live site has not changed.' }
  })
}

/** Publish the current draft. Creates a 301 if a published slug changed. */
export async function publishEntry(collectionKey: string, id: string): Promise<ActionResult> {
  return guard(async () => {
    const collection = collectionOf(collectionKey)
    await authorFor(collection)
    assertId(id)
    const db = await createSupabaseServerClient()
    const { data: row, error } = await db.from('entries').select('draft_data, published_data, slug, published_slug').eq('id', id).eq('collection', collection).is('deleted_at', null).single()
    if (error || !row) throw new UserError('This item no longer exists.')
    const next = row.draft_data ?? row.published_data
    // Re-validate at publish time: rules may have changed since the draft was saved.
    const result = validateEntry(collection, next)
    if (!result.ok) throw new UserError('This draft has problems that must be fixed before publishing.', result.errors)

    const prefix = PATH_PREFIX[collection]
    if (prefix && row.published_slug && row.slug && row.published_slug !== row.slug) {
      const from = prefix + row.published_slug
      const to = prefix + row.slug
      await db.from('redirects').delete().eq('from_path', to)
      await db.from('redirects').update({ to_path: to }).eq('to_path', from) // avoid redirect chains
      const { error: rErr } = await db.from('redirects').upsert({ from_path: from, to_path: to })
      if (rErr) throw rErr
    }
    const { data: published, error: uErr } = await db
      .from('entries')
      .update({ published_data: result.data, draft_data: null, published_slug: row.slug, published_at: new Date().toISOString() })
      .eq('id', id).eq('collection', collection)
      .select('id')
    if (uErr) throw uErr
    if (!published?.length) throw new UserError('This item could not be published. You may not have permission.')
    refreshLive(collection)
    return { ok: true, message: 'Published. The live site has been updated.' }
  })
}

export async function unpublishEntry(collectionKey: string, id: string): Promise<ActionResult> {
  return guard(async () => {
    const collection = collectionOf(collectionKey)
    await authorFor(collection)
    assertId(id)
    if (COLLECTION_BY_KEY[collection].singleton) throw new UserError('This content cannot be unpublished, only edited.')
    const db = await createSupabaseServerClient()
    const { data: row } = await db.from('entries').select('draft_data, published_data').eq('id', id).eq('collection', collection).single()
    if (!row) throw new UserError('This item no longer exists.')
    const { error } = await db.from('entries').update({ draft_data: row.draft_data ?? row.published_data, published_data: null }).eq('id', id).eq('collection', collection)
    if (error) throw error
    refreshLive(collection)
    return { ok: true, message: 'Unpublished. It is no longer on the live site.' }
  })
}

export async function discardDraft(collectionKey: string, id: string): Promise<ActionResult> {
  return guard(async () => {
    const collection = collectionOf(collectionKey)
    await authorFor(collection)
    assertId(id)
    const db = await createSupabaseServerClient()
    const { data: row } = await db.from('entries').select('published_data, slug, published_slug').eq('id', id).eq('collection', collection).single()
    if (!row?.published_data) throw new UserError('This item has never been published, so there is nothing to go back to. Delete it instead.')
    const { error } = await db.from('entries').update({ draft_data: null, slug: row.published_slug ?? row.slug }).eq('id', id).eq('collection', collection)
    if (error) throw error
    revalidatePath('/admin', 'layout')
    return { ok: true, message: 'Draft discarded.' }
  })
}

/** Soft delete: moves the item to the bin for 30 days. */
export async function deleteEntry(collectionKey: string, id: string): Promise<ActionResult> {
  return guard(async () => {
    const collection = collectionOf(collectionKey)
    await authorFor(collection)
    assertId(id)
    if (COLLECTION_BY_KEY[collection].singleton) throw new UserError('This content cannot be deleted, only edited.')
    const db = await createSupabaseServerClient()
    const { error } = await db.from('entries').update({ deleted_at: new Date().toISOString() }).eq('id', id).eq('collection', collection)
    if (error) throw error
    refreshLive(collection)
    return { ok: true, message: 'Moved to the bin. You can restore it for 30 days.' }
  })
}

export async function restoreEntry(collectionKey: string, id: string): Promise<ActionResult> {
  return guard(async () => {
    const collection = collectionOf(collectionKey)
    await authorFor(collection)
    assertId(id)
    const db = await createSupabaseServerClient()
    const { data: row } = await db.from('entries').select('slug').eq('id', id).eq('collection', collection).single()
    if (row?.slug) {
      const { data: clash } = await db.from('entries').select('id').eq('collection', collection).eq('slug', row.slug).is('deleted_at', null).limit(1)
      if (clash?.length) throw new UserError('Another item now uses this web address. Change that item first, then restore this one.')
    }
    const { error } = await db.from('entries').update({ deleted_at: null }).eq('id', id).eq('collection', collection)
    if (error) throw new UserError(error.message.includes('30 days') ? 'Items can only be restored within 30 days of deletion.' : 'Could not restore this item.')
    refreshLive(collection)
    return { ok: true, message: 'Restored.' }
  })
}

/** Permanent deletion from the bin. Admins only (also enforced by RLS). */
export async function purgeEntry(collectionKey: string, id: string): Promise<ActionResult> {
  return guard(async () => {
    const collection = collectionOf(collectionKey)
    await requireStaff('admin')
    assertId(id)
    const db = await createSupabaseServerClient()
    const { error } = await db.from('entries').delete().eq('id', id).eq('collection', collection).not('deleted_at', 'is', null)
    if (error) throw error
    revalidatePath('/admin', 'layout')
    return { ok: true, message: 'Permanently deleted.' }
  })
}

/** Drag-and-drop reordering. Order changes apply to the live site straight away. */
export async function reorderEntries(collectionKey: string, ids: string[]): Promise<ActionResult> {
  return guard(async () => {
    const collection = collectionOf(collectionKey)
    await authorFor(collection)
    if (!COLLECTION_BY_KEY[collection].sortable) throw new UserError('This content cannot be reordered.')
    if (!Array.isArray(ids) || ids.length > 500) throw new UserError('Invalid order.')
    ids.forEach(assertId)
    const db = await createSupabaseServerClient()
    for (const [i, id] of ids.entries()) {
      const { error } = await db.from('entries').update({ sort_order: i }).eq('id', id).eq('collection', collection)
      if (error) throw error
    }
    refreshLive(collection)
    return { ok: true, message: 'Order saved.' }
  })
}

/** Copy an earlier version into the draft, ready to review and publish. */
export async function restoreVersion(collectionKey: string, id: string, versionId: number): Promise<ActionResult> {
  return guard(async () => {
    const collection = collectionOf(collectionKey)
    await authorFor(collection)
    assertId(id)
    const db = await createSupabaseServerClient()
    const { data: v } = await db.from('entry_versions').select('data').eq('id', versionId).eq('entry_id', id).single()
    if (!v) throw new UserError('That version could not be found.')
    const result = validateEntry(collection, v.data)
    if (!result.ok) throw new UserError('That version no longer passes validation and cannot be restored.', result.errors)
    const def = COLLECTION_BY_KEY[collection]
    const slug = def.slugField ? String((result.data as unknown as Record<string, unknown>)[def.slugField]) : null
    const { error } = await db.from('entries').update({ draft_data: result.data, ...(slug ? { slug } : {}) }).eq('id', id).eq('collection', collection)
    if (error) throw new UserError(error.code === '23505' ? 'Another item now uses that version’s web address.' : 'Could not restore that version.')
    revalidatePath('/admin', 'layout')
    return { ok: true, message: 'Version restored as a draft. Review it, then publish.' }
  })
}

/** Restore a version and publish it immediately (one click). */
export async function restoreAndPublishVersion(collectionKey: string, id: string, versionId: number): Promise<ActionResult> {
  const restored = await restoreVersion(collectionKey, id, versionId)
  if (!restored.ok) return restored
  return publishEntry(collectionKey, id)
}
