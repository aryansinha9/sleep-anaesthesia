// Seed content: the currently approved site content. The site renders from
// this when Supabase is not connected, and scripts/seed.ts loads it into
// Supabase so the site looks identical after connecting.
import type { CollectionData, CollectionKey, MediaItem, PageSeo } from '../types'
import { FAQS } from './faqs'
import { LOCATIONS } from './locations'
import { BANNER, HOME, SETTINGS } from './settings'
import { TREATMENTS } from './treatments'

export const MEDIA: MediaItem[] = [
  {
    slot: 'home_hero',
    caption: '',
    image: { src: '/uploads/dental-treatment-under-iv-sedation.webp', width: 930, height: 500, alt: 'Dentist treating a reclined patient who is sedated in a dental chair' },
  },
  {
    slot: 'home_setup',
    caption: '',
    image: {
      src: '/uploads/mobile-anaesthesia-setup-dental-clinic.webp',
      width: 1448,
      height: 1086,
      alt: "Sleep Anaesthesia's mobile anaesthetic machine and patient monitors set up beside the dental chair, with the team in surgical gowns",
    },
  },
]

export const PAGE_SEO: PageSeo[] = [
  { page: 'home', title: 'Mobile IV Sedation & General Anaesthesia for Dental Clinics', description: 'Specialist sleep dentistry and IV sedation delivered at your dental clinic across Queensland and Victoria. FANZCA anaesthetists, hospital-grade monitoring.', ogImage: null },
  { page: 'patients', title: 'Sleep Dentistry & IV Sedation: Patient Information', description: 'What IV sedation feels like, fasting instructions, Medicare rebates and 40+ patient FAQs answered by FANZCA specialist anaesthetists.', ogImage: null },
  { page: 'clinics', title: 'Mobile IV Sedation for Dental Clinics in QLD & VIC', description: 'FANZCA specialist anaesthetists bring the full sedation setup to your dental clinic, at no cost to your practice. Booking, clinical and billing FAQs.', ogImage: null },
  { page: 'general_anaesthesia', title: 'Mobile General Anaesthesia for Dental Clinics', description: 'Mobile general anaesthesia for accredited dental clinics by FANZCA specialist anaesthetists. Clinic suitability, safety standards and site requirements.', ogImage: null },
  { page: 'iv_sedation', title: 'IV Sedation for Dental Treatment', description: 'What dental IV sedation is, how it feels and who provides it. Delivered in your dental clinic by FANZCA specialist anaesthetists across QLD and VIC.', ogImage: null },
  { page: 'treatments', title: 'Sleep Treatments: Dental Procedures Under Sedation', description: 'Wisdom teeth, dental implants, extractions, All-on-4® and All-on-X surgery, and strong gag reflex: dental procedures we provide sedation for.', ogImage: null },
  { page: 'areas', title: 'Areas We Service: Queensland & Victoria', description: 'Mobile dental sedation for clinics in Brisbane, the Gold Coast, Sunshine Coast, Toowoomba, regional Queensland, Melbourne and regional Victoria.', ogImage: null },
  { page: 'pricing', title: 'Dental Sedation Fees, Medicare Rebates & Payment Plans', description: 'One all-inclusive dental sedation fee with no surprise charges. Medicare rebates processed for you, and TLC payment plans. Contact us for a quote.', ogImage: null },
  { page: 'contact', title: 'Contact Sleep Anaesthesia', description: 'Book IV sedation or general anaesthesia for your clinic or procedure. Office at 580 Rode Rd, Chermside. Servicing Queensland and Victoria.', ogImage: null },
  { page: 'gallery', title: 'Gallery: Our Mobile Anaesthesia Setup', description: 'Photos and videos of the Sleep Anaesthesia team and mobile anaesthetic setup in dental clinics across Queensland and Victoria.', ogImage: null },
  { page: 'privacy', title: 'Privacy Policy', description: 'How Sleep Anaesthesia collects, uses and protects personal information, including enquiries and website chat.', ogImage: null },
]

type SeedMap = { [K in CollectionKey]: CollectionData[K][] }

export const SEED: SeedMap = {
  settings: [SETTINGS],
  home: [HOME],
  banner: [BANNER],
  treatments: TREATMENTS,
  locations: LOCATIONS,
  videos: [],
  media: MEDIA,
  faqs: FAQS,
  testimonials: [],
  before_after: [],
  page_seo: PAGE_SEO,
}
