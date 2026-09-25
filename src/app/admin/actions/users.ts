'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { guard, UserError, type ActionResult } from '@/lib/admin/result'
import { requireStaff } from '@/lib/auth'
import { SITE_URL } from '@/lib/env'
import { createSupabaseServiceClient } from '@/lib/supabase/admin'
import { createSupabaseServerClient } from '@/lib/supabase/server'

// User management: admins only. Accounts exist only by invitation.

const role = z.enum(['admin', 'editor'])
const UUID = /^[0-9a-f-]{36}$/i

export async function inviteUser(_prev: ActionResult | null, form: FormData): Promise<ActionResult> {
  return guard(async () => {
    await requireStaff('admin')
    const email = String(form.get('email') || '').trim().toLowerCase()
    if (!z.email().safeParse(email).success) throw new UserError('Enter a valid email address.')
    const r = role.safeParse(form.get('role'))
    if (!r.success) throw new UserError('Choose a role.')

    const service = createSupabaseServiceClient()
    const { data, error } = await service.auth.admin.inviteUserByEmail(email, { redirectTo: `${SITE_URL}/admin/auth/confirm?next=/admin/set-password` })
    if (error || !data.user) throw new UserError(error?.message?.includes('already') ? 'That email already has an account.' : 'Could not send the invitation. Check the email address and try again.')
    // Insert with the admin's own session so the audit log records who invited whom.
    const db = await createSupabaseServerClient()
    const me = (await db.auth.getUser()).data.user
    const { error: insErr } = await db.from('admin_users').insert({ user_id: data.user.id, email, role: r.data, invited_by: me?.id })
    if (insErr) {
      await service.auth.admin.deleteUser(data.user.id)
      throw new UserError('Could not add the user. Please try again.')
    }
    revalidatePath('/admin/users')
    return { ok: true, message: `Invitation sent to ${email}.` }
  })
}

export async function changeRole(userId: string, newRole: string): Promise<ActionResult> {
  return guard(async () => {
    const me = await requireStaff('admin')
    if (!UUID.test(userId)) throw new UserError('Unknown user.')
    const r = role.safeParse(newRole)
    if (!r.success) throw new UserError('Choose a role.')
    if (userId === me.userId && r.data !== 'admin') throw new UserError('You cannot remove your own admin access. Ask another admin.')
    const db = await createSupabaseServerClient()
    const { error } = await db.from('admin_users').update({ role: r.data }).eq('user_id', userId)
    if (error) throw error
    revalidatePath('/admin/users')
    return { ok: true, message: 'Role updated.' }
  })
}

export async function setUserDisabled(userId: string, disabled: boolean): Promise<ActionResult> {
  return guard(async () => {
    const me = await requireStaff('admin')
    if (!UUID.test(userId)) throw new UserError('Unknown user.')
    if (userId === me.userId) throw new UserError('You cannot disable your own account.')
    const db = await createSupabaseServerClient()
    const { error } = await db.from('admin_users').update({ disabled_at: disabled ? new Date().toISOString() : null }).eq('user_id', userId)
    if (error) throw error
    // Disabled users lose access on their very next request: every page, action
    // and RLS policy checks admin_users.disabled_at.
    revalidatePath('/admin/users')
    return { ok: true, message: disabled ? 'Access removed.' : 'Access restored.' }
  })
}

/** Removes a second factor so a user who lost their phone can set up a new one. */
export async function resetUserMfa(userId: string): Promise<ActionResult> {
  return guard(async () => {
    const me = await requireStaff('admin')
    if (!UUID.test(userId)) throw new UserError('Unknown user.')
    if (userId === me.userId) throw new UserError('Ask another admin to reset your own two-factor authentication.')
    const service = createSupabaseServiceClient()
    const { data } = await service.auth.admin.mfa.listFactors({ userId })
    for (const f of data?.factors || []) await service.auth.admin.mfa.deleteFactor({ userId, id: f.id })
    return { ok: true, message: 'Two-factor reset. They will set it up again at next sign-in.' }
  })
}
