export function NotConfigured() {
  return (
    <main className="auth-page">
      <div className="auth-card">
        <h1>Dashboard not connected yet</h1>
        <p className="muted" style={{ margin: 0 }}>The website is running from its built-in content. To turn on the dashboard, connect Supabase by setting <code>NEXT_PUBLIC_SUPABASE_URL</code>, <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> and <code>SUPABASE_SERVICE_ROLE_KEY</code>, then run the migrations and seed script.</p>
        <p className="muted" style={{ margin: 0 }}>Step-by-step instructions are in <strong>ADMIN_SETUP.md</strong>.</p>
      </div>
    </main>
  )
}
