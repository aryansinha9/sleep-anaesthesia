// Fixed media slots. Each slot is a designed space on a page; the crop tool
// locks uploads to the slot's aspect ratio so images always fit.
// A slot with no image collapses on the live site.

export type MediaSlot = {
  key: string
  label: string
  page: string
  aspect: [number, number]
  multiple: boolean
  max?: number
  help: string
}

export const MEDIA_SLOTS: MediaSlot[] = [
  { key: 'home_hero', label: 'Home page: hero photo', page: 'Home', aspect: [16, 9], multiple: false, help: 'The large photo at the top of the home page. Warm, human photos of a patient being cared for work best.' },
  { key: 'home_setup', label: 'Home page: mobile setup', page: 'Home', aspect: [4, 3], multiple: false, help: 'Shown beside "Specialist anaesthetists, not sedationists". Shows the mobile equipment set up in a clinic.' },
  { key: 'team', label: 'Home page: our team', page: 'Home', aspect: [4, 3], multiple: true, max: 3, help: 'Up to 3 photos of the team in action. The "Our team" section is hidden until at least one photo is added.' },
  { key: 'clinics_setup', label: 'Dental clinics: setup photo', page: 'Dental clinics', aspect: [4, 3], multiple: false, help: 'Shown beside "Your dentistry. Our anaesthesia." on the dental clinics page.' },
  { key: 'clinics_gallery', label: 'Dental clinics: clinic environment', page: 'Dental clinics', aspect: [4, 3], multiple: true, max: 8, help: 'Photos of the clinic environment: monitoring, treatment room, recovery. Hidden until a photo is added.' },
  { key: 'ga_equipment', label: 'General anaesthesia: equipment photo', page: 'General anaesthesia', aspect: [4, 3], multiple: false, help: 'Shown beside "Why these standards matter".' },
  { key: 'iv_sedation', label: 'IV sedation: feature photo', page: 'IV sedation', aspect: [4, 3], multiple: false, help: 'Shown beside "What IV sedation feels like".' },
  { key: 'gallery', label: 'Gallery page', page: 'Gallery', aspect: [4, 3], multiple: true, max: 40, help: 'Photos for the public gallery page. The page is hidden until it has content.' },
]

export const SLOT_BY_KEY = Object.fromEntries(MEDIA_SLOTS.map((s) => [s.key, s])) as Record<string, MediaSlot>

/** Aspect ratios used by image fields that are not media slots. */
export const FIELD_ASPECTS = {
  treatment: [4, 3] as [number, number],
  poster: [16, 9] as [number, number],
  og: [1200, 630] as [number, number],
  beforeAfter: [1, 1] as [number, number],
}
