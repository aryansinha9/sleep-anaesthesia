import Link from 'next/link'
import { Banner } from '@/components/site/Banner'
import { ChatWidget } from '@/components/site/ChatWidget'
import { Footer } from '@/components/site/Footer'
import { JsonLd } from '@/components/site/JsonLd'
import { Nav } from '@/components/site/Nav'
import { getActiveBanner, getLocations, getSettings, getTreatments, isPreview } from '@/lib/data'
import { organizationSchema } from '@/lib/seo'

// Pages are static and refreshed instantly on publish (cache tags). The hourly
// revalidate also applies the announcement banner's start/end dates.
export const revalidate = 3600

// Public site shell. The chat widget lives here only, so it never loads on /admin.
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, treatments, locations, banner, preview] = await Promise.all([getSettings(), getTreatments(), getLocations(), getActiveBanner(), isPreview()])
  const menu = treatments.filter((t) => t.visibleInMenu).map((t) => ({ href: `/treatments/${t.slug}`, label: t.menuLabel }))
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      {preview && (
        <div className="preview-bar" role="status">
          Preview: you are viewing unpublished drafts. <Link href="/api/preview/exit" prefetch={false}>Exit preview</Link>
        </div>
      )}
      <Banner banner={banner} />
      <Nav treatments={menu} brand={settings.businessName} />
      <main id="main">{children}</main>
      <Footer settings={settings} locations={locations} treatments={treatments} />
      <JsonLd data={organizationSchema(settings, locations)} />
      {!preview && <ChatWidget provider={settings.chatProvider} id={settings.chatId} />}
    </>
  )
}
