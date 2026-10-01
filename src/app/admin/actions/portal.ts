'use server'

import { revalidatePath } from 'next/cache'
import { guard, UserError, type ActionResult } from '@/lib/admin/result'
import { requireStaff } from '@/lib/auth'
import { toPlainText } from '@/lib/sanitize'
import { generateCode, hashCode } from '@/lib/portal'
import { createSupabaseServerClient } from '@/lib/supabase/server'

// Clinic portal access codes: admins only (also enforced by RLS).

const UUID = /^[0-9a-f-]{36}$/i

export async function createPortalCode(_prev: ActionResult<{ code: string; clinic: string }> | null, form: FormData): Promise<ActionResult<{ code: string; clinic: string }>> {
  return guard(async () => {
    await requireStaff('admin')
    const clinic = toPlainText(String(form.get('clinic') || '')).replace(/\s+/g, ' ').trim()
    if (!clinic) throw new UserError('Enter the clinic name.')
    if (clinic.length > 120) throw new UserError('Clinic name must be 120 characters or fewer.')
    const code = generateCode()
    const db = await createSupabaseServerClient()
    const { error } = await db.from('portal_access_codes').insert({ clinic_name: clinic, code_hash: hashCode(code) })
    if (error) throw new UserError('Could not create the code. Please try again.')
    revalidatePath('/admin/portal')
    return { ok: true, data: { code, clinic }, message: 'Access code created.' }
  })
}

export async function setPortalCodeActive(id: string, active: boolean): Promise<ActionResult> {
  return guard(async () => {
    await requireStaff('admin')
    if (!UUID.test(id)) throw new UserError('Unknown code.')
    const db = await createSupabaseServerClient()
    const { error } = await db.from('portal_access_codes').update({ active }).eq('id', id)
    if (error) throw error
    revalidatePath('/admin/portal')
    return { ok: true, message: active ? 'Code switched on.' : 'Code switched off. That clinic is locked out straight away.' }
  })
}

export async function deletePortalCode(id: string): Promise<ActionResult> {
  return guard(async () => {
    await requireStaff('admin')
    if (!UUID.test(id)) throw new UserError('Unknown code.')
    const db = await createSupabaseServerClient()
    const { error } = await db.from('portal_access_codes').delete().eq('id', id)
    if (error) throw error
    revalidatePath('/admin/portal')
    return { ok: true, message: 'Code deleted.' }
  })
}
