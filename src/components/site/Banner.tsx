import Link from 'next/link'
import type { Banner as BannerT } from '@/content/types'

export function Banner({ banner }: { banner: BannerT | null }) {
  if (!banner) return null
  return (
    <div className="announce" role="region" aria-label="Announcement">
      {banner.message}
      {banner.linkText && banner.linkHref && <Link href={banner.linkHref}>{banner.linkText} →</Link>}
    </div>
  )
}
