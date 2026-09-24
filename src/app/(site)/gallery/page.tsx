import { notFound } from 'next/navigation'
import { CloseBand } from '@/components/site/CloseBand'
import { BeforeAfterGallery, PhotoGrid } from '@/components/site/Extras'
import { JsonLd } from '@/components/site/JsonLd'
import { VideoFrame } from '@/components/site/VideoSection'
import { getBeforeAfter, getGalleryVideos, getMedia, getSettings } from '@/lib/data'
import { breadcrumbSchema, buildMetadata } from '@/lib/seo'

export const generateMetadata = () =>
  buildMetadata({ path: '/gallery', pageKey: 'gallery', title: 'Gallery: Our Mobile Anaesthesia Setup', description: 'Photos and videos of the Sleep Anaesthesia team and mobile setup in dental clinics.' })

// The gallery page only exists once it has content: otherwise it is a 404
// and it is left out of the sitemap and the menus.
export default async function GalleryPage() {
  const [settings, photos, videos, ba] = await Promise.all([getSettings(), getMedia('gallery'), getGalleryVideos(), getBeforeAfter()])
  if (!photos.length && !videos.length && !ba.length) notFound()
  return (
    <>
      <div className="wrap">
        <section className="page-hero">
          <span className="kicker">Gallery</span>
          <h1 className="display">Our team and mobile setup</h1>
          <p className="sub">Specialist anaesthetists, anaesthetic nurses and hospital-grade equipment, in dental clinics across Queensland and Victoria.</p>
        </section>
        <hr className="rule2" />
        {videos.length > 0 && (
          <section className="section" aria-labelledby="videos-h">
            <span className="kicker">Videos</span>
            <h2 className="section-title" id="videos-h">Watch</h2>
            <div className="gallery-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 420px), 1fr))' }}>
              {videos.map((v, i) => <div key={i}><VideoFrame video={v} />{v.description && <p className="muted" style={{ marginTop: 10, fontSize: 15 }}>{v.description}</p>}</div>)}
            </div>
          </section>
        )}
        <PhotoGrid slot="gallery" kicker="Photos" title="In the clinic" />
        <BeforeAfterGallery />
      </div>
      <CloseBand lines={['Your dentistry.', 'Our anaesthesia.']} settings={settings} />
      <JsonLd data={breadcrumbSchema([{ name: 'Gallery', path: '/gallery' }])} />
    </>
  )
}
