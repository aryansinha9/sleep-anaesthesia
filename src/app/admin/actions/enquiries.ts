'use server'

import { revalidatePath } from 'next/cache'
import { guard, UserError, type ActionResult } from '@/lib/admin/result'
import { requireStaff } from '@/lib/auth'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function setEnquiryHandled(id: string, handled: boolean): Promise<ActionResult> {
  return guard(async () => {
    await requireStaff('admin')
    if (!/^[0-9a-f-]{36}$/i.test(id)) throw new UserError('Unknown enquiry.')
    const db = await createSupabaseServerClient()
    const { error } = await db.from('enquiries').update({ handled_at: handled ? new Date().toISOString() : null }).eq('id', id)
    if (error) throw error
    revalidatePath('/admin/enquiries')
    return { ok: true, message: handled ? 'Marked as handled.' : 'Marked as new.' }
  })
}

export async function deleteEnquiry(id: string): Promise<ActionResult> {
  return guard(async () => {
    await requireStaff('admin')
    if (!/^[0-9a-f-]{36}$/i.test(id)) throw new UserError('Unknown enquiry.')
    const db = await createSupabaseServerClient()
    const { error } = await db.from('enquiries').delete().eq('id', id)
    if (error) throw error
    revalidatePath('/admin/enquiries')
    return { ok: true, message: 'Enquiry deleted.' }
  })
}
