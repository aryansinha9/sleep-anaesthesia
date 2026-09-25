// Field registry for every editable collection. This one definition drives:
//  - the admin forms (labels, help text, character limits, required flags)
//  - server-side validation (src/content/validation.ts)
// Keep this file free of server-only imports: admin client components use it.

import type { CollectionKey } from './types'
import { MEDIA_SLOTS } from './slots'
import { VIDEO_PLACEMENTS } from './types'

type Base = { name: string; label: string; help?: string; required?: boolean; showIf?: { field: string; in: string[] } }

export type FieldDef =
  | (Base & { type: 'text'; max: number; placeholder?: string; pattern?: 'phone' | 'postcode' | 'time' })
  | (Base & { type: 'textarea'; max: number; rows?: number })
  | (Base & { type: 'richtext'; max: number; variant: 'full' | 'basic' })
  | (Base & { type: 'number'; min: number; max: number; step?: number; prefix?: string })
  | (Base & { type: 'boolean' })
  | (Base & { type: 'select'; options: { value: string; label: string }[] })
  | (Base & { type: 'slug'; from: string })
  | (Base & { type: 'url'; allowRelative?: boolean; hosts?: string[] })
  | (Base & { type: 'email' })
  | (Base & { type: 'date' })
  | (Base & { type: 'image'; aspect: [number, number] | 'slot' })
  | (Base & { type: 'hours' })
  | (Base & { type: 'list'; maxItems: number; fields: FieldDef[] })
  | (Base & { type: 'videofile' })
  | (Base & { type: 'captions' })

export type CollectionDef = {
  key: CollectionKey
  label: string
  singular: string
  description: string
  singleton: boolean
  adminOnly?: boolean
  sortable?: boolean
  /** Field used as the display title in lists. */
  titleField: string
  /** Field that determines the public URL, if the collection has pages. */
  slugField?: string
  fields: FieldDef[]
}

export const PLACEMENT_LABELS: Record<string, string> = {
  clinics_overview: 'Dental clinics overview (clinics page + home page)',
  general_anaesthesia: 'General anaesthesia page',
  iv_sedation: 'IV sedation page',
  patient_info: 'Patient info page',
  gallery: 'Video gallery',
}

const seo: FieldDef[] = [
  { type: 'text', name: 'seoTitle', label: 'SEO title', max: 60, help: 'Shown in Google results and the browser tab. Leave blank to use the page title.' },
  { type: 'textarea', name: 'seoDescription', label: 'SEO description', max: 160, rows: 3, help: 'The short summary Google shows under the title. Aim for 120–160 characters.' },
]

const days = [
  ['mon', 'Monday'], ['tue', 'Tuesday'], ['wed', 'Wednesday'], ['thu', 'Thursday'], ['fri', 'Friday'], ['sat', 'Saturday'], ['sun', 'Sunday'],
] as const
export const DAYS = days

export const COLLECTIONS: CollectionDef[] = [
  {
    key: 'settings',
    label: 'Site settings',
    singular: 'Site settings',
    description: 'Business details, office hours, links and switches used across the whole site.',
    singleton: true,
    adminOnly: true,
    titleField: 'businessName',
    fields: [
      { type: 'text', name: 'businessName', label: 'Business name', max: 60, required: true, help: 'Used in the footer, page titles and Google structured data.' },
      { type: 'text', name: 'phone', label: 'Phone number', max: 20, pattern: 'phone', help: 'Shown in the footer and on the contact page as a tap-to-call link. Leave blank to hide the phone line entirely.' },
      { type: 'email', name: 'email', label: 'Email address', required: true, help: 'Shown in the footer and on the contact page.' },
      { type: 'text', name: 'street', label: 'Street address', max: 80, required: true, help: 'Shown in the footer, on the contact page and in Google structured data.' },
      { type: 'text', name: 'suburb', label: 'Suburb', max: 40, required: true },
      { type: 'text', name: 'city', label: 'City', max: 40, required: true },
      { type: 'select', name: 'state', label: 'State', required: true, options: ['QLD', 'VIC', 'NSW', 'ACT', 'SA', 'WA', 'TAS', 'NT'].map((s) => ({ value: s, label: s })) },
      { type: 'text', name: 'postcode', label: 'Postcode', max: 4, pattern: 'postcode', required: true },
      { type: 'boolean', name: 'showMap', label: 'Show map on contact page', help: 'Embeds a Google map of the address on the contact page.' },
      { type: 'hours', name: 'hours', label: 'Office hours', help: 'Shown in the footer, on the contact page and in Google structured data.' },
      {
        type: 'list', name: 'socialLinks', label: 'Social links', maxItems: 5, help: 'Shown in the footer and on the contact page.',
        fields: [
          { type: 'text', name: 'label', label: 'Label', max: 40, required: true },
          { type: 'url', name: 'url', label: 'Link', required: true },
        ],
      },
      { type: 'url', name: 'googleReviewUrl', label: 'Google review link', help: 'The "Leave us a Google review" link. Leave blank to hide it.' },
      { type: 'url', name: 'googleBusinessProfileUrl', label: 'Google Business Profile link', help: 'Your Google Maps / Business Profile page. Added to Google structured data.' },
      {
        type: 'select', name: 'chatProvider', label: 'Chat widget', help: 'The chat bubble shown on public pages. Choose "None" to turn it off.',
        options: [{ value: 'none', label: 'None' }, { value: 'tawk', label: 'Tawk.to' }, { value: 'crisp', label: 'Crisp' }],
      },
      { type: 'text', name: 'chatId', label: 'Chat widget ID', max: 60, showIf: { field: 'chatProvider', in: ['tawk', 'crisp'] }, help: 'Tawk.to: "property ID/widget ID" from the widget code. Crisp: the Website ID (looks like 1a2b3c4d-…).' },
      { type: 'number', name: 'minBookingStandard', label: 'Standard minimum booking', min: 0, max: 100000, step: 100, prefix: '$', help: 'Minimum booking value for a standard list.' },
      { type: 'number', name: 'minBookingStandardConsidered', label: 'Standard bookings considered from', min: 0, max: 100000, step: 100, prefix: '$', help: 'Smaller bookings from this value will be considered.' },
      { type: 'number', name: 'minBookingRegional', label: 'Regional / outreach minimum booking', min: 0, max: 200000, step: 100, prefix: '$', help: 'Minimum booking for regional and outreach centres.' },
      { type: 'boolean', name: 'showMinBooking', label: 'Show minimum booking values publicly', help: 'When off, values are only shared with clinics on enquiry.' },
      { type: 'boolean', name: 'testimonialsEnabled', label: 'Show testimonials section', help: 'Keep off until you have confirmed testimonials comply with Ahpra advertising guidelines.' },
      { type: 'boolean', name: 'beforeAfterEnabled', label: 'Show before-and-after gallery', help: 'Keep off until you have confirmed the images comply with Ahpra advertising guidelines.' },
    ],
  },
  {
    key: 'home',
    label: 'Home page',
    singular: 'Home page',
    description: 'Hero text, buttons and the credibility stats strip.',
    singleton: true,
    titleField: 'heroHeadline',
    fields: [
      { type: 'text', name: 'heroKicker', label: 'Small label above headline', max: 40 },
      { type: 'text', name: 'heroHeadline', label: 'Hero headline', max: 70, required: true, help: 'The main heading of the home page.' },
      { type: 'textarea', name: 'heroSubheading', label: 'Hero subheading', max: 320, rows: 4, required: true },
      { type: 'text', name: 'primaryCtaText', label: 'Main button text', max: 48, required: true },
      { type: 'url', name: 'primaryCtaHref', label: 'Main button link', allowRelative: true, required: true, help: 'A page on this site (e.g. /clinics) or a full web address.' },
      { type: 'text', name: 'secondaryCtaText', label: 'Second button text', max: 48 },
      { type: 'url', name: 'secondaryCtaHref', label: 'Second button link', allowRelative: true },
      {
        type: 'list', name: 'stats', label: 'Credibility stats', maxItems: 4, help: 'Up to 4 figures, e.g. procedures completed or clinics partnered with. The strip is hidden when empty.',
        fields: [
          { type: 'text', name: 'value', label: 'Figure', max: 10, required: true },
          { type: 'text', name: 'label', label: 'Label', max: 60, required: true },
        ],
      },
    ],
  },
  {
    key: 'banner',
    label: 'Announcement banner',
    singular: 'Announcement banner',
    description: 'A one-line message across the top of every page.',
    singleton: true,
    titleField: 'message',
    fields: [
      { type: 'boolean', name: 'enabled', label: 'Show banner' },
      { type: 'text', name: 'message', label: 'Message', max: 120, help: 'Required when the banner is switched on.' },
      { type: 'text', name: 'linkText', label: 'Link text', max: 30 },
      { type: 'url', name: 'linkHref', label: 'Link', allowRelative: true },
      { type: 'date', name: 'startsAt', label: 'Start date', help: 'Optional. The banner appears from this date.' },
      { type: 'date', name: 'endsAt', label: 'End date', help: 'Optional. The banner disappears after this date.' },
    ],
  },
  {
    key: 'treatments',
    label: 'Sleep treatments',
    singular: 'Treatment',
    description: 'Procedures in the "Sleep Treatments" menu, treatment lists and treatment pages.',
    singleton: false,
    sortable: true,
    titleField: 'title',
    slugField: 'slug',
    fields: [
      { type: 'text', name: 'title', label: 'Page title', max: 60, required: true, help: 'The main heading on the treatment page, e.g. "Sedation for Dental Implants".' },
      { type: 'text', name: 'menuLabel', label: 'Menu label', max: 32, required: true, help: 'Short name used in the menu and treatment lists, e.g. "Dental implants".' },
      { type: 'slug', name: 'slug', label: 'Web address', from: 'title', required: true, help: 'The end of the page address: /treatments/your-slug. Changing it on a published page creates a redirect automatically.' },
      { type: 'textarea', name: 'summary', label: 'Short summary', max: 180, rows: 3, required: true, help: 'One or two sentences shown in treatment lists.' },
      { type: 'richtext', name: 'body', label: 'Page content', max: 6000, variant: 'full', required: true },
      { type: 'image', name: 'image', label: 'Image', aspect: [4, 3] },
      { type: 'boolean', name: 'visibleInMenu', label: 'Show in "Sleep Treatments" menu' },
      ...seo,
    ],
  },
  {
    key: 'locations',
    label: 'Locations',
    singular: 'Location',
    description: 'Service areas and towns. Only active towns appear on the site; only towns with their own content get a page.',
    singleton: false,
    sortable: true,
    titleField: 'name',
    slugField: 'slug',
    fields: [
      { type: 'text', name: 'name', label: 'Area or town name', max: 40, required: true },
      { type: 'slug', name: 'slug', label: 'Web address', from: 'name', required: true, help: 'The end of the page address: /areas/your-slug.' },
      { type: 'select', name: 'kind', label: 'Type', required: true, options: [{ value: 'primary', label: 'Main service area (always has a page)' }, { value: 'town', label: 'Town' }] },
      { type: 'select', name: 'state', label: 'State', required: true, options: [{ value: 'QLD', label: 'Queensland' }, { value: 'VIC', label: 'Victoria' }] },
      { type: 'text', name: 'region', label: 'Region', max: 40, required: true, help: 'Used to group towns on the "Areas we service" page, e.g. "Regional Queensland".' },
      { type: 'boolean', name: 'active', label: 'Actively serviced', help: 'Only active towns appear on the live site.' },
      { type: 'boolean', name: 'hasPage', label: 'Has its own page', showIf: { field: 'kind', in: ['town'] }, help: 'Only turn this on once you have written unique content for this town. Otherwise it is listed as plain text.' },
      { type: 'textarea', name: 'summary', label: 'Short summary', max: 200, rows: 3, help: 'Shown on cards and the areas page.' },
      { type: 'richtext', name: 'body', label: 'Page content', max: 5000, variant: 'full', help: 'Write content that is genuinely specific to this area.' },
      ...seo,
    ],
  },
  {
    key: 'videos',
    label: 'Videos',
    singular: 'Video',
    description: 'Page videos and the video gallery. A video section stays hidden until a video is added.',
    singleton: false,
    sortable: true,
    titleField: 'title',
    fields: [
      { type: 'text', name: 'title', label: 'Title', max: 80, required: true },
      { type: 'textarea', name: 'description', label: 'Short description', max: 200, rows: 2 },
      {
        type: 'select', name: 'placement', label: 'Where it appears', required: true,
        options: VIDEO_PLACEMENTS.map((p) => ({ value: p, label: PLACEMENT_LABELS[p] })),
      },
      { type: 'select', name: 'source', label: 'Video source', required: true, options: [{ value: 'youtube', label: 'YouTube link' }, { value: 'vimeo', label: 'Vimeo link' }, { value: 'upload', label: 'Upload an MP4 file' }] },
      { type: 'url', name: 'url', label: 'Video link', hosts: ['youtube.com', 'youtu.be', 'vimeo.com'], showIf: { field: 'source', in: ['youtube', 'vimeo'] }, help: 'Paste the normal YouTube or Vimeo page link. Embed code is not accepted.' },
      { type: 'videofile', name: 'fileUrl', label: 'Video file (MP4)', showIf: { field: 'source', in: ['upload'] }, help: 'MP4 only, up to 200 MB. For longer videos we recommend YouTube or Vimeo to save bandwidth and storage costs.' },
      { type: 'image', name: 'poster', label: 'Poster image', aspect: [16, 9], help: 'The still shown before the video plays. Required for uploads; YouTube and Vimeo thumbnails are fetched automatically and can be replaced.' },
      { type: 'captions', name: 'captionsUrl', label: 'Captions file (optional)', showIf: { field: 'source', in: ['upload'] }, help: 'A .vtt subtitle file.' },
      { type: 'boolean', name: 'visible', label: 'Visible on the site' },
    ],
  },
  {
    key: 'media',
    label: 'Photos',
    singular: 'Photo',
    description: 'Photos for the fixed spaces on each page and the gallery.',
    singleton: false,
    sortable: true,
    titleField: 'caption',
    fields: [
      { type: 'select', name: 'slot', label: 'Where it appears', required: true, options: MEDIA_SLOTS.map((s) => ({ value: s.key, label: s.label })) },
      { type: 'image', name: 'image', label: 'Photo', aspect: 'slot', required: true },
      { type: 'text', name: 'caption', label: 'Caption', max: 140, help: 'Optional. Shown under gallery photos.' },
    ],
  },
  {
    key: 'faqs',
    label: 'FAQs',
    singular: 'FAQ',
    description: 'Questions and answers on the patient and dental clinic pages.',
    singleton: false,
    sortable: true,
    titleField: 'question',
    fields: [
      { type: 'select', name: 'page', label: 'Page', required: true, options: [{ value: 'patients', label: 'Patient info' }, { value: 'clinics', label: 'Dental clinics' }] },
      {
        type: 'select', name: 'category', label: 'Category', required: true,
        options: [
          { value: 'pay', label: 'Patients: Payment & Medicare' }, { value: 'iv', label: 'Patients: IV sedation' }, { value: 'ga', label: 'Patients: General anaesthesia' },
          { value: 'book', label: 'Clinics: Booking & scheduling' }, { value: 'clin', label: 'Clinics: Clinical & safety' }, { value: 'admin', label: 'Clinics: Billing & admin' },
        ],
      },
      { type: 'text', name: 'question', label: 'Question', max: 140, required: true },
      { type: 'richtext', name: 'answer', label: 'Answer', max: 1200, variant: 'basic', required: true },
    ],
  },
  {
    key: 'testimonials',
    label: 'Testimonials',
    singular: 'Testimonial',
    description: 'Added manually. Hidden on the site until testimonials are switched on in Site settings.',
    singleton: false,
    sortable: true,
    titleField: 'name',
    fields: [
      { type: 'text', name: 'name', label: 'Name or initials', max: 40, required: true },
      { type: 'textarea', name: 'text', label: 'Testimonial', max: 400, rows: 5, required: true, help: 'Ahpra guidelines restrict testimonials about clinical aspects of care. Check before publishing.' },
      { type: 'date', name: 'date', label: 'Date' },
      { type: 'boolean', name: 'visible', label: 'Visible' },
    ],
  },
  {
    key: 'before_after',
    label: 'Before & after',
    singular: 'Before & after pair',
    description: 'Hidden on the site until switched on in Site settings.',
    singleton: false,
    sortable: true,
    titleField: 'title',
    fields: [
      { type: 'text', name: 'title', label: 'Title', max: 60, required: true },
      { type: 'image', name: 'before', label: 'Before', aspect: [1, 1], required: true },
      { type: 'image', name: 'after', label: 'After', aspect: [1, 1], required: true },
      { type: 'text', name: 'caption', label: 'Caption', max: 140 },
    ],
  },
  {
    key: 'page_seo',
    label: 'Page SEO',
    singular: 'Page SEO',
    description: 'Google title, description and social share image for each fixed page.',
    singleton: false,
    titleField: 'page',
    fields: [
      { type: 'select', name: 'page', label: 'Page', required: true, options: [] /* filled from PAGE_KEYS below */ },
      { type: 'text', name: 'title', label: 'SEO title', max: 60, required: true },
      { type: 'textarea', name: 'description', label: 'SEO description', max: 160, rows: 3, required: true },
      { type: 'image', name: 'ogImage', label: 'Social share image', aspect: [1200, 630], help: 'Shown when the page is shared on social media or messaging apps. 1200 × 630.' },
    ],
  },
]

export const PAGE_KEYS: { value: string; label: string; path: string }[] = [
  { value: 'home', label: 'Home', path: '/' },
  { value: 'patients', label: 'Patient info', path: '/patients' },
  { value: 'clinics', label: 'Dental clinics', path: '/clinics' },
  { value: 'general_anaesthesia', label: 'General anaesthesia', path: '/general-anaesthesia' },
  { value: 'iv_sedation', label: 'IV sedation', path: '/iv-sedation' },
  { value: 'treatments', label: 'Sleep treatments', path: '/treatments' },
  { value: 'areas', label: 'Areas we service', path: '/areas' },
  { value: 'pricing', label: 'Fees & payment plans', path: '/pricing' },
  { value: 'contact', label: 'Contact', path: '/contact' },
  { value: 'gallery', label: 'Gallery', path: '/gallery' },
  { value: 'privacy', label: 'Privacy policy', path: '/privacy' },
]


const pageSeo = COLLECTIONS.find((c) => c.key === 'page_seo')!
const pageField = pageSeo.fields[0] as Extract<FieldDef, { type: 'select' }>
pageField.options = PAGE_KEYS.map((p) => ({ value: p.value, label: p.label }))

export const COLLECTION_BY_KEY = Object.fromEntries(COLLECTIONS.map((c) => [c.key, c])) as Record<CollectionKey, CollectionDef>

export function isCollectionKey(value: string): value is CollectionKey {
  return value in COLLECTION_BY_KEY
}
