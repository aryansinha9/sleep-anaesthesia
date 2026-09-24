import Image from 'next/image'
import type { ImageRef } from '@/content/types'
import { isAllowedMediaSrc } from '@/lib/env'

// Renders a content image. Seed images go through next/image (WebP/AVIF,
// responsive sizes); dashboard uploads already have WebP variants generated
// on upload, so they render as a plain responsive <img>. Missing or
// disallowed images render nothing, so the surrounding section can collapse.
export function ContentImage({ image, sizes, priority = false, className, style }: { image: ImageRef | null | undefined; sizes: string; priority?: boolean; className?: string; style?: React.CSSProperties }) {
  if (!image || !isAllowedMediaSrc(image.src)) return null
  if (image.src.startsWith('/')) {
    return <Image src={image.src} width={image.width} height={image.height} alt={image.alt} sizes={sizes} priority={priority} className={className} style={style} />
  }
  const srcSet = image.variants?.length ? image.variants.map((v) => `${v.src} ${v.width}w`).join(', ') : undefined
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={image.src} srcSet={srcSet} sizes={srcSet ? sizes : undefined} width={image.width} height={image.height} alt={image.alt}
      loading={priority ? 'eager' : 'lazy'} fetchPriority={priority ? 'high' : undefined} decoding="async" className={className} style={style} />
  )
}
