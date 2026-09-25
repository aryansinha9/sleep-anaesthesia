// Creates the FIRST admin account (later accounts are invited from the
// dashboard). Prints a one-time temporary password; the admin signs in at
// /admin/login, sets up two-factor authentication, then changes the password.
//
//   npm run create-admin -- someone@example.com
//   npm run create-admin -- someone@example.com --invite   # email an invitation instead
import './env'
import { randomBytes } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'
import { need } from './env'

const email = (process.argv[2] || '').trim().toLowerCase()
if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
  console.error('Usage: npm run create-admin -- you@example.com [--invite]')
  process.exit(1)
}
const invite = process.argv.includes('--invite')
const db = createClient(need('NEXT_PUBLIC_SUPABASE_URL'), need('SUPABASE_SERVICE_ROLE_KEY'), { auth: { persistSession: false } })

async function main() {
  let userId: string
  let password: string | null = null
  if (invite) {
    const site = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const { data, error } = await db.auth.admin.inviteUserByEmail(email, { redirectTo: `${site}/admin/auth/confirm?next=/admin/set-password` })
    if (error || !data.user) throw new Error(error?.message || 'Invite failed')
    userId = data.user.id
  } else {
    password = randomBytes(12).toString('base64url') + '9a'
    const { data, error } = await db.auth.admin.createUser({ email, password, email_confirm: true })
    if (error || !data.user) throw new Error(error?.message || 'Create failed')
    userId = data.user.id
  }
  const { error } = await db.from('admin_users').upsert({ user_id: userId, email, role: 'admin' })
  if (error) throw new Error(error.message)
  console.log(`\n✓ Admin account ready for ${email}`)
  if (password) console.log(`  Temporary password (shown once): ${password}\n  Sign in at /admin/login, set up two-factor authentication, then choose a new password under "Change password".`)
  else console.log('  An invitation email has been sent.')
}

main().catch((e) => { console.error(e.message || e); process.exit(1) })
