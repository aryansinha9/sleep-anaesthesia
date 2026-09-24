import type { Metadata, Viewport } from 'next'
import { Hanken_Grotesk } from 'next/font/google'
import { SITE_URL } from '@/lib/env'
import './globals.css'

const hanken = Hanken_Grotesk({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'], variable: '--font-hanken', display: 'swap' })

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  icons: { icon: '/favicon.png' },
}

export const viewport: Viewport = { themeColor: '#1d2140', width: 'device-width', initialScale: 1 }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-AU" className={hanken.variable}>
      <body>{children}</body>
    </html>
  )
}
