// Security acceptance tests (brief §15), run directly against the Supabase
// API, not through the UI:
//   • anonymous users cannot read private tables, write anything, or upload
//   • the public view exposes published data only
//   • an editor (fully signed in with TOTP) cannot touch admin-only data
//   • a password-only session (no TOTP, aal1) cannot write at all
// Optionally checks the running site (SITE_CHECK_URL, default http://localhost:3000).
//
//   npm run verify:security
//
// Creates a temporary editor account and removes it afterwards.
import './env'
import { createHmac, randomBytes } from 'node:crypto'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { need } from './env'

const URL_ = need('NEXT_PUBLIC_SUPABASE_URL')
const ANON = need('NEXT_PUBLIC_SUPABASE_ANON_KEY')
const service = createClient(URL_, need('SUPABASE_SERVICE_ROLE_KEY'), { auth: { persistSession: false } })
const SITE = process.env.SITE_CHECK_URL || 'http://localhost:3000'

let passed = 0
let failed = 0
function check(name: string, ok: boolean, detail = '') {
  if (ok) { passed++; console.log(`  ✓ ${name}`) } else { failed++; console.log(`  ✗ ${name}${detail ? `: ${detail}` : ''}`) }
}

/** RFC 6238 TOTP (SHA-1, 30 s, 6 digits) so the test can complete real MFA. */
function totp(secretB32: string): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  let bits = ''
  for (const c of secretB32.replace(/=+$/, '').toUpperCase()) bits += alphabet.indexOf(c).toString(2).padStart(5, '0')
  const key = Buffer.from(bits.match(/.{8}/g)!.map((b) => parseInt(b, 2)))
  const counter = Buffer.alloc(8)
  counter.writeBigUInt64BE(BigInt(Math.floor(Date.now() / 30000)))
  const h = createHmac('sha1', key).update(counter).digest()
  const o = h[h.length - 1] & 0xf
  return String(((h.readUInt32BE(o) & 0x7fffffff) % 1_000_000)).padStart(6, '0')
}

const blocked = (r: { error: unknown; data: unknown }) => Boolean(r.error) || (Array.isArray(r.data) && r.data.length === 0) || r.data === null

async function anonymousTests() {
  console.log('\nAnonymous visitor (anon key, no session)')
  const anon = createClient(URL_, ANON, { auth: { persistSession: false } })
  for (const table of ['entries', 'entry_versions', 'admin_users', 'audit_log', 'enquiries', 'login_attempts']) {
    const r = await anon.from(table).select('*').limit(1)
    check(`cannot read ${table}`, blocked(r), r.error ? '' : `returned ${JSON.stringify(r.data).slice(0, 80)}`)
  }
  const ins = await anon.from('entries').insert({ collection: 'faqs', draft_data: { question: 'x' } }).select()
  check('cannot insert content', blocked(ins))
  const upd = await anon.from('entries').update({ published_data: { hacked: true } }).eq('collection', 'settings').select()
  check('cannot update content', blocked(upd))
  const del = await anon.from('entries').delete().eq('collection', 'faqs').select()
  check('cannot delete content', blocked(del))
  const enq = await anon.from('enquiries').insert({ audience: 'patient', name: 'x' }).select()
  check('cannot insert enquiries directly', blocked(enq))
  const red = await anon.from('redirects').insert({ from_path: '/x', to_path: '/y' }).select()
  check('cannot create redirects', blocked(red))
  const adm = await anon.from('admin_users').insert({ user_id: '00000000-0000-0000-0000-000000000000', email: 'x@x.x', role: 'admin' }).select()
  check('cannot make itself an admin', blocked(adm))
  const up1 = await anon.storage.from('public-media').upload(`test/${Date.now()}.webp`, new Blob(['x'], { type: 'image/webp' }))
  check('cannot upload to public-media', Boolean(up1.error))
  const up2 = await anon.storage.from('private-uploads').upload(`images/${Date.now()}.bin`, new Blob(['x'], { type: 'image/jpeg' }))
  check('cannot upload to private-uploads', Boolean(up2.error))
  const signUp = await anon.auth.signUp({ email: `probe-${Date.now()}@example.com`, password: 'Sup3rLongPassword!' })
  check('public sign-up is disabled', Boolean(signUp.error) || !signUp.data.user)

  const pub = await anon.from('published_entries').select('*').limit(200)
  check('can read published content', !pub.error && (pub.data?.length || 0) > 0, pub.error?.message)
  const leaked = (pub.data || []).some((r) => 'draft_data' in r || 'deleted_at' in r || 'created_by' in r)
  check('published view exposes no draft or internal columns', !leaked)
  const serialised = JSON.stringify(pub.data || [])
  check('no public per-session sedation prices', !/less than 60 minutes|\$750\b|rate-price/i.test(serialised))
}

async function signedIn(email: string, password: string) {
  const c = createClient(URL_, ANON, { auth: { persistSession: false } })
  const { error } = await c.auth.signInWithPassword({ email, password })
  if (error) throw new Error(`sign-in failed: ${error.message}`)
  return c
}

async function editorTests() {
  const email = `security-test-${Date.now()}@example.com`
  const password = randomBytes(16).toString('base64url') + '7a'
  const { data: created, error } = await service.auth.admin.createUser({ email, password, email_confirm: true })
  if (error || !created.user) throw new Error(`could not create test user: ${error?.message}`)
  const userId = created.user.id
  try {
    await service.from('admin_users').insert({ user_id: userId, email, role: 'editor' })

    console.log('\nEditor with password only (no two-factor yet, aal1)')
    const aal1 = await signedIn(email, password)
    const w1 = await aal1.from('entries').insert({ collection: 'faqs', draft_data: { question: 'x' } }).select()
    check('cannot write content before completing MFA', blocked(w1))
    const r1 = await aal1.from('entries').select('id').limit(1)
    check('cannot read drafts before completing MFA', blocked(r1))

    const { data: enrol, error: eErr } = await aal1.auth.mfa.enroll({ factorType: 'totp' })
    if (eErr || !enrol) throw new Error(`enrol failed: ${eErr?.message}`)
    const v = await aal1.auth.mfa.challengeAndVerify({ factorId: enrol.id, code: totp(enrol.totp.secret) })
    if (v.error) throw new Error(`MFA verify failed: ${v.error.message}`)
    const editor = aal1 as SupabaseClient

    console.log('\nEditor, fully signed in (aal2)')
    const ok = await editor.from('entries').insert({ collection: 'faqs', draft_data: { page: 'patients', category: 'iv', question: 'Security test', answer: '<p>x</p>' } }).select('id').single()
    check('can create a content draft', !ok.error, ok.error?.message)
    const settings = await editor.from('entries').update({ draft_data: { businessName: 'hacked' } }).eq('collection', 'settings').select()
    check('cannot edit site settings', blocked(settings))
    const newSettings = await editor.from('entries').insert({ collection: 'settings', draft_data: { businessName: 'hacked' } }).select()
    check('cannot create site settings', blocked(newSettings))
    if (ok.data) {
      const hard = await editor.from('entries').delete().eq('id', ok.data.id).select()
      check('cannot permanently delete', blocked(hard))
      const soft = await editor.from('entries').update({ deleted_at: new Date().toISOString() }).eq('id', ok.data.id).select()
      check('can move items to the bin', !soft.error && (soft.data?.length || 0) === 1, soft.error?.message)
    }
    const users = await editor.from('admin_users').select('*')
    check('cannot list other users', (users.data || []).every((u) => u.user_id === userId))
    const promote = await editor.from('admin_users').update({ role: 'admin' }).eq('user_id', userId).select()
    check('cannot promote itself to admin', blocked(promote))
    const audit = await editor.from('audit_log').select('*').limit(1)
    check('cannot read the audit log', blocked(audit))
    const tamper = await editor.from('audit_log').delete().gte('id', 0).select()
    check('cannot erase the audit log', blocked(tamper))
    const enq = await editor.from('enquiries').select('*').limit(1)
    check('cannot read enquiries', blocked(enq))
    const up = await editor.storage.from('public-media').upload(`test/${Date.now()}.webp`, new Blob(['x'], { type: 'image/webp' }))
    check('can upload media', !up.error, up.error?.message)
    if (up.data) {
      const rm = await editor.storage.from('public-media').remove([up.data.path])
      check('cannot delete media files (admin only)', Boolean(rm.error) || (rm.data?.length || 0) === 0)
      await service.storage.from('public-media').remove([up.data.path])
    }
    const log = await service.from('audit_log').select('action, actor_email').eq('actor_email', email)
    check('audit log recorded the editor’s changes', (log.data || []).some((r) => r.action === 'create') && (log.data || []).some((r) => r.action === 'delete'))
  } finally {
    await service.from('entries').delete().eq('collection', 'faqs').eq('draft_data->>question', 'Security test')
    await service.auth.admin.deleteUser(userId)
  }
}

async function siteTests() {
  console.log(`\nWebsite (${SITE})`)
  try {
    const admin = await fetch(`${SITE}/admin`, { redirect: 'manual' })
    check('/admin redirects anonymous visitors to sign-in', admin.status >= 300 && admin.status < 400 && (admin.headers.get('location') || '').includes('/admin/login'), `status ${admin.status}`)
    check('/admin sends noindex', (admin.headers.get('x-robots-tag') || '').includes('noindex'))
    const settings = await fetch(`${SITE}/admin/content/settings`, { redirect: 'manual' })
    check('admin pages are not served to anonymous visitors', settings.status >= 300 && settings.status < 400)
    const preview = await fetch(`${SITE}/api/preview?path=/`, { redirect: 'manual' })
    check('preview (draft mode) refuses anonymous visitors', preview.status === 401)
    const robots = await (await fetch(`${SITE}/robots.txt`)).text()
    check('robots.txt blocks /admin', /Disallow: \/admin/.test(robots))
    const sitemap = await (await fetch(`${SITE}/sitemap.xml`)).text()
    check('sitemap excludes /admin and /portal', !/\/admin|\/portal/.test(sitemap))
    const old = await fetch(`${SITE}/ivsedation/`, { redirect: 'manual' })
    check('old WordPress URL returns 301', old.status === 301 && old.headers.get('location')?.endsWith('/iv-sedation') === true, `status ${old.status}`)
  } catch (e) {
    check('site reachable', false, (e as Error).message)
  }
}

async function main() {
  await anonymousTests()
  await editorTests()
  await siteTests()
  console.log(`\n${passed} passed, ${failed} failed`)
  process.exit(failed ? 1 : 0)
}

main().catch((e) => { console.error('\nTest run failed:', e.message || e); process.exit(1) })
