import type { Metadata } from 'next'
import './admin.css'

export const metadata: Metadata = {
  title: { absolute: 'Dashboard | Sleep Anaesthesia' },
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
}

export const dynamic = 'force-dynamic'

// Admin root. Deliberately outside the public (site) layout: no public nav,
// no chat widget, no structured data.
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="adm">{children}</div>
}
