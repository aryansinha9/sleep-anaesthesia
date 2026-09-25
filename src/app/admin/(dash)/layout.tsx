import { AdminShell } from '@/components/admin/AdminShell'
import { NotConfigured } from '@/components/admin/NotConfigured'
import { COLLECTIONS } from '@/content/collections'
import { requireStaffPage } from '@/lib/auth'
import { supabaseConfigured } from '@/lib/env'
import { signOut } from '../actions/auth'

// Every dashboard page passes through here: the session, MFA level and role
// are verified on the server before anything renders.
export default async function DashLayout({ children }: { children: React.ReactNode }) {
  if (!supabaseConfigured) return <NotConfigured />
  const staff = await requireStaffPage()
  const isAdmin = staff.role === 'admin'
  const content = COLLECTIONS.filter((c) => !c.adminOnly || isAdmin)
  const groups = [
    { label: 'Overview', items: [{ href: '/admin', label: 'Dashboard' }] },
    { label: 'Pages & media', items: content.filter((c) => ['home', 'media', 'videos', 'banner', 'page_seo'].includes(c.key)).map((c) => ({ href: `/admin/content/${c.key}`, label: c.label })) },
    { label: 'Content', items: content.filter((c) => ['treatments', 'locations', 'faqs', 'testimonials', 'before_after'].includes(c.key)).map((c) => ({ href: `/admin/content/${c.key}`, label: c.label })) },
    {
      label: 'Manage',
      items: [
        ...(isAdmin ? [{ href: '/admin/content/settings', label: 'Site settings' }, { href: '/admin/enquiries', label: 'Enquiries' }, { href: '/admin/users', label: 'Users' }, { href: '/admin/audit', label: 'Activity log' }] : []),
        { href: '/admin/bin', label: 'Bin' },
      ],
    },
  ]
  return <AdminShell groups={groups} email={staff.email} role={staff.role} signOut={signOut}>{children}</AdminShell>
}
