'use client'

import { useState } from 'react'
import { embedUrl, parseVideoUrl } from '@/lib/video'

type Props = {
  title: string
  source: 'youtube' | 'vimeo' | 'upload'
  url: string
  fileUrl: string
  posterSrc: string | null
  captionsUrl: string
}

// Click-to-play facade: only a poster image and a button load with the page.
// The provider iframe (or the <video>) is created when the visitor clicks
// play, so it never slows the page and never autoplays on its own.
// The 16:9 box is reserved up front, so nothing shifts when it loads.
export function VideoPlayer({ title, source, url, fileUrl, posterSrc, captionsUrl }: Props) {
  const [playing, setPlaying] = useState(false)
  const parsed = source === 'upload' ? null : parseVideoUrl(url)
  if (source !== 'upload' && !parsed) return null
  if (source === 'upload' && !fileUrl) return null

  return (
    <div className="video">
      {playing ? (
        parsed ? (
          <iframe src={embedUrl(parsed)} title={title} allow="autoplay; fullscreen; picture-in-picture; encrypted-media" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
        ) : (
          <video controls autoPlay playsInline preload="none" poster={posterSrc || undefined}>
            <source src={fileUrl} type="video/mp4" />
            {captionsUrl && <track kind="captions" src={captionsUrl} srcLang="en" label="English" default />}
          </video>
        )
      ) : (
        <button type="button" className="video-facade" onClick={() => setPlaying(true)} aria-label={`Play video: ${title}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {posterSrc && <img src={posterSrc} alt="" loading="lazy" decoding="async" />}
          <span className="video-play" aria-hidden="true">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.14v13.72a1 1 0 0 0 1.52.85l10.6-6.86a1 1 0 0 0 0-1.7L9.52 4.29A1 1 0 0 0 8 5.14Z" /></svg>
          </span>
          <span className="video-title">{title}</span>
        </button>
      )}
    </div>
  )
}
