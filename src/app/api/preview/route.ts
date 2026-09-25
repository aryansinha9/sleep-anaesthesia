import { draftMode } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'
import { getSessionState } from '@/lib/auth'

// Enables Next.js draft mode for signed-in staff, then shows the requested
// page with unpublished drafts. Only same-site paths are accepted.
export async function GET(req: NextRequest) {
  const s = await getSessionState()
  if (s.status !== 'staff') return new NextResponse('Not authorised', { status: 401 })
  const path = req.nextUrl.searchParams.get('path') || '/'
  const safe = /^\/(?!\/)[\w\-./]*$/.test(path) && !path.startsWith('/admin') ? path : '/'
  ;(await draftMode()).enable()
  return NextResponse.redirect(new URL(safe, req.url))
}
