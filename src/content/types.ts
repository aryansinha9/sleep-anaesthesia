// Typed content model. Every page renders from these shapes; the data layer
// (src/lib/data.ts) fills them from seed data or from Supabase.

export type ImageVariant = { width: number; src: string }

/** An image as stored in content. `src` is the largest rendition. */
export type ImageRef = {
  src: string
  width: number
  height: number
  alt: string
  variants?: ImageVariant[]
}

export type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'
export type DayHours = { closed: boolean; open: string; close: string }

export type ChatProvider = 'none' | 'tawk' | 'crisp'

export type SiteSettings = {
  businessName: string
  phone: string
  email: string
  street: string
  suburb: string
  city: string
  state: string
  postcode: string
  showMap: boolean
  hours: Record<DayKey, DayHours>
  socialLinks: { label: string; url: string }[]
  googleReviewUrl: string
  googleBusinessProfileUrl: string
  chatProvider: ChatProvider
  chatId: string
  minBookingStandard: number
  minBookingStandardConsidered: number
  minBookingRegional: number
  showMinBooking: boolean
  testimonialsEnabled: boolean
  beforeAfterEnabled: boolean
}

export type HomeContent = {
  heroKicker: string
  heroHeadline: string
  heroSubheading: string
  primaryCtaText: string
  primaryCtaHref: string
  secondaryCtaText: string
  secondaryCtaHref: string
  stats: { value: string; label: string }[]
}

export type Banner = {
  enabled: boolean
  message: string
  linkText: string
  linkHref: string
  startsAt: string
  endsAt: string
}

export type Treatment = {
  title: string
  menuLabel: string
  slug: string
  summary: string
  body: string
  image: ImageRef | null
  visibleInMenu: boolean
  seoTitle: string
  seoDescription: string
}

export type LocationKind = 'primary' | 'town'
export type AustralianState = 'QLD' | 'VIC'

export type Location = {
  name: string
  slug: string
  kind: LocationKind
  state: AustralianState
  region: string
  active: boolean
  hasPage: boolean
  summary: string
  body: string
  seoTitle: string
  seoDescription: string
}

export const VIDEO_PLACEMENTS = ['clinics_overview', 'general_anaesthesia', 'iv_sedation', 'patient_info', 'gallery'] as const
export type VideoPlacement = (typeof VIDEO_PLACEMENTS)[number]
export type VideoSource = 'youtube' | 'vimeo' | 'upload'

export type Video = {
  title: string
  description: string
  placement: VideoPlacement
  source: VideoSource
  url: string
  fileUrl: string
  poster: ImageRef | null
  captionsUrl: string
  visible: boolean
}

export type MediaItem = {
  slot: string
  image: ImageRef | null
  caption: string
}

export type FaqPage = 'patients' | 'clinics'
export type Faq = {
  page: FaqPage
  category: string
  question: string
  answer: string
}

export type Testimonial = {
  name: string
  text: string
  date: string
  visible: boolean
}

export type BeforeAfter = {
  title: string
  before: ImageRef | null
  after: ImageRef | null
  caption: string
}

export type PageSeo = {
  page: string
  title: string
  description: string
  ogImage: ImageRef | null
}

export type CollectionData = {
  settings: SiteSettings
  home: HomeContent
  banner: Banner
  treatments: Treatment
  locations: Location
  videos: Video
  media: MediaItem
  faqs: Faq
  testimonials: Testimonial
  before_after: BeforeAfter
  page_seo: PageSeo
}

export type CollectionKey = keyof CollectionData

/** A published (or, in preview, draft) record as the site sees it. */
export type Entry<K extends CollectionKey = CollectionKey> = {
  id: string
  order: number
  data: CollectionData[K]
}
