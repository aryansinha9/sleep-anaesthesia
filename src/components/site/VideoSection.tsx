import type { Video, VideoPlacement } from '@/content/types'
import { getVideo } from '@/lib/data'
import { VideoPlayer } from './VideoPlayer'

export function VideoFrame({ video }: { video: Video }) {
  return <VideoPlayer title={video.title} source={video.source} url={video.url} fileUrl={video.fileUrl} posterSrc={video.poster?.src || null} captionsUrl={video.captionsUrl} />
}

/** A page's fixed video space. Renders nothing until a video has been added. */
export async function VideoSection({ placement, kicker, title, intro }: { placement: Exclude<VideoPlacement, 'gallery'>; kicker: string; title?: string; intro?: string }) {
  const video = await getVideo(placement)
  if (!video) return null
  return (
    <section className="video-section" aria-labelledby={`video-${placement}`}>
      <div>
        <span className="kicker">{kicker}</span>
        <h2 className="section-title" id={`video-${placement}`}>{title || video.title}</h2>
        {(video.description || intro) && <p className="section-intro" style={{ marginBottom: 0 }}>{video.description || intro}</p>}
      </div>
      <VideoFrame video={video} />
    </section>
  )
}
