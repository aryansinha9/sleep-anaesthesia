import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Runs before every page request:
//  1. 301 redirects: old static-site URLs, old WordPress URLs, and slugs that
//     were changed in the dashboard (the `redirects` table).
//  2. /admin: refreshes the Supabase session cookie and signs staff out after
//     a period of inactivity. Authorisation itself is checked on the server in
//     every admin page and action (src/lib/auth.ts), not here.

const STATIC_REDIRECTS: Record<string, string> = {
  '/index.html': '/',
  '/patients.html': '/patients',
  '/clinics.html': '/clinics',
  '/general-anaesthesia.html': '/general-anaesthesia',
  '/pricing.html': '/pricing',
  '/contact.html': '/contact',
  '/portal.html': '/portal',
  // Previous WordPress site
  '/ivsedation': '/iv-sedation',
  '/sleepanaesthesia': '/',
  '/hello-world': '/',
  '/feed': '/',
  '/comments/feed': '/',
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const IDLE_MS = Math.max(5, Number(process.env.ADMIN_IDLE_TIMEOUT_MINUTES || 30)) * 60_000
const IDLE_COOKIE = 'sa_last_active'

let dbRedirects: { map: Map<string, string>; at: number } | null = null

async function lookupDbRedirect(path: string): Promise<string | undefined> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return undefined
  if (!dbRedirects || Date.now() - dbRedirects.at > 60_000) {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/redirects?select=from_path,to_path`, {
        // New-style publishable keys (sb_publishable_…) go in `apikey` only;
        // legacy anon JWTs also need the Authorization header.
        headers: { apikey: SUPABASE_ANON_KEY, ...(SUPABASE_ANON_KEY.startsWith('eyJ') ? { Authorization: `Bearer ${SUPABASE_ANON_KEY}` } : {}) },
        cache: 'no-store',
      })
      const rows: { from_path: string; to_path: string }[] = res.ok ? await res.json() : []
      dbRedirects = { map: new Map(rows.map((r) => [r.from_path, r.to_path])), at: Date.now() }
    } catch {
      dbRedirects = { map: dbRedirects?.map || new Map(), at: Date.now() }
    }
  }
  return dbRedirects.map.get(path)
}

function redirect301(req: NextRequest, to: string) {
  // Build a plain URL: cloning nextUrl would re-append the trailing slash.
  const url = new URL(to + req.nextUrl.search, req.url)
  return NextResponse.redirect(url, 301)
}

async function handleAdmin(req: NextRequest) {
  let res = NextResponse.next({ request: req })
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return res

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll: (list) => {
        for (const { name, value } of list) req.cookies.set(name, value)
        res = NextResponse.next({ request: req })
        for (const { name, value, options } of list) res.cookies.set(name, value, { ...options, httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' })
      },
    },
  })
  // Refreshes the access token if needed (writes cookies via setAll).
  const { data } = await supabase.auth.getUser()

  const path = req.nextUrl.pathname
  const isPublicAdminPath = path === '/admin/login' || path.startsWith('/admin/auth/')
  if (data.user) {
    const last = Number(req.cookies.get(IDLE_COOKIE)?.value || 0)
    if (last && Date.now() - last > IDLE_MS && !isPublicAdminPath) {
      await supabase.auth.signOut()
      const url = req.nextUrl.clone()
      url.pathname = '/admin/login'
      url.search = '?reason=idle'
      const out = NextResponse.redirect(url)
      for (const c of res.cookies.getAll()) out.cookies.set(c)
      out.cookies.delete(IDLE_COOKIE)
      return out
    }
    res.cookies.set(IDLE_COOKIE, String(Date.now()), { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: IDLE_MS / 1000 })
  }
  return res
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (pathname === '/admin' || pathname.startsWith('/admin/') || pathname.startsWith('/api/preview')) {
    return handleAdmin(req)
  }

  // Normalise a trailing slash and resolve any redirect in a single 301 hop.
  const trimmed = pathname.length > 1 && pathname.endsWith('/') ? pathname.replace(/\/+$/, '') : pathname
  const target = STATIC_REDIRECTS[trimmed.toLowerCase()] || (await lookupDbRedirect(trimmed))
  if (target && target !== trimmed) return redirect301(req, target)
  if (trimmed !== pathname) return redirect301(req, trimmed)
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|uploads/|favicon.png|robots.txt|sitemap.xml).*)'],
}
