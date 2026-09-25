import { InviteForm, UserRowActions } from '@/components/admin/UserAdmin'
import { requireStaffPage } from '@/lib/auth'
import { createSupabaseServiceClient } from '@/lib/supabase/admin'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export default async function UsersPage() {
  const me = await requireStaffPage('admin')
  const db = await createSupabaseServerClient()
  const { data: users } = await db.from('admin_users').select('user_id, email, role, created_at, disabled_at').order('created_at')
  // Last sign-in and MFA status come from Supabase Auth (service role, admin-only page).
  const auth = createSupabaseServiceClient().auth.admin
  const details = await Promise.all((users || []).map(async (u) => {
    const { data } = await auth.getUserById(u.user_id)
    const factors = (data.user?.factors || []).filter((f) => f.status === 'verified')
    return { ...u, lastSignIn: data.user?.last_sign_in_at || null, confirmed: Boolean(data.user?.email_confirmed_at || data.user?.last_sign_in_at), mfa: factors.length > 0 }
  }))
  return (
    <>
      <h1>Users</h1>
      <p className="lead">Only invited people can use the dashboard. <strong>Admins</strong> can do everything, including settings and users. <strong>Editors</strong> can edit content and media, but not settings or users, and cannot permanently delete anything.</p>
      <div className="adm-card" style={{ marginBottom: 16 }}>
        <h2>Invite someone</h2>
        <InviteForm />
      </div>
      <div className="adm-scroll">
        <table className="adm-table">
          <thead><tr><th>Email</th><th>Role</th><th>Two-factor</th><th>Last sign-in</th><th>Status</th><th><span className="visually-hidden">Actions</span></th></tr></thead>
          <tbody>
            {details.map((u) => (
              <tr key={u.user_id}>
                <td className="title">{u.email}{u.user_id === me.userId && ' (you)'}</td>
                <td style={{ textTransform: 'capitalize' }}>{u.role}</td>
                <td>{u.mfa ? <span className="badge badge-live">On</span> : <span className="badge badge-draft">Not set up</span>}</td>
                <td>{u.lastSignIn ? new Date(u.lastSignIn).toLocaleString('en-AU', { dateStyle: 'medium', timeStyle: 'short' }) : 'Invitation pending'}</td>
                <td>{u.disabled_at ? <span className="badge badge-empty">Disabled</span> : <span className="badge badge-live">Active</span>}</td>
                <td>{u.user_id !== me.userId && <UserRowActions userId={u.user_id} role={u.role} disabled={Boolean(u.disabled_at)} />}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
