import { COLLECTION_BY_KEY, type FieldDef } from '@/content/collections'
import type { CollectionKey } from '@/content/types'

const FIELD_DEFAULTS: Record<string, unknown> = {
  visibleInMenu: true,
  visible: true,
  active: false,
  hasPage: false,
  kind: 'town',
  state: 'QLD',
  source: 'youtube',
  chatProvider: 'none',
}

function defaultFor(field: FieldDef, collection: CollectionKey): unknown {
  if (collection === 'testimonials' && field.name === 'visible') return false
  if (field.name in FIELD_DEFAULTS && field.type !== 'text') return FIELD_DEFAULTS[field.name]
  switch (field.type) {
    case 'boolean': return false
    case 'number': return 0
    case 'select': return field.options[0]?.value ?? ''
    case 'image': return null
    case 'list': return []
    case 'hours': return Object.fromEntries(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map((d) => [d, { closed: d === 'sat' || d === 'sun', open: '09:00', close: '15:00' }]))
    default: return ''
  }
}

/** Blank values for a new entry, shaped by the field registry. */
export function emptyEntry(collection: CollectionKey): Record<string, unknown> {
  return Object.fromEntries(COLLECTION_BY_KEY[collection].fields.map((f) => [f.name, defaultFor(f, collection)]))
}

export function pathFor(collection: CollectionKey, data: Record<string, unknown>): string | null {
  const slug = String(data.slug || '')
  switch (collection) {
    case 'treatments': return slug ? `/treatments/${slug}` : null
    case 'locations': return slug && (data.kind === 'primary' || (data.active && data.hasPage)) ? `/areas/${slug}` : null
    case 'videos': return ({ clinics_overview: '/clinics', general_anaesthesia: '/general-anaesthesia', iv_sedation: '/iv-sedation', patient_info: '/patients', gallery: '/gallery' } as Record<string, string>)[String(data.placement)] || '/'
    case 'media': return ({ home_hero: '/', home_setup: '/', team: '/', clinics_setup: '/clinics', clinics_gallery: '/clinics', ga_equipment: '/general-anaesthesia', iv_sedation: '/iv-sedation', gallery: '/gallery' } as Record<string, string>)[String(data.slot)] || '/'
    case 'faqs': return data.page === 'clinics' ? '/clinics#faq' : '/patients#faq'
    case 'testimonials': return '/contact'
    case 'before_after': return '/gallery'
    case 'page_seo': return null
    default: return '/'
  }
}
