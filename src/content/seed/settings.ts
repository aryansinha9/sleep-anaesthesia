import type { Banner, HomeContent, SiteSettings } from '../types'

const weekday = { closed: false, open: '09:00', close: '15:00' }
const closed = { closed: true, open: '09:00', close: '15:00' }

export const SETTINGS: SiteSettings = {
  businessName: 'Sleep Anaesthesia',
  phone: '0485 692 397',
  email: 'admin@sleepanaesthesia.com.au',
  street: '580 Rode Rd',
  suburb: 'Chermside',
  city: 'Brisbane',
  state: 'QLD',
  postcode: '4032',
  showMap: true,
  // Brief §6: Mon–Fri 9:00am–3:00pm. Weekends "Closed" until the client
  // confirms the weekend arrangement (brief §13 item 2).
  hours: { mon: weekday, tue: weekday, wed: weekday, thu: weekday, fri: weekday, sat: closed, sun: closed },
  socialLinks: [{ label: 'Instagram', url: 'https://instagram.com/sleepanaesthesia' }],
  googleReviewUrl: '',
  googleBusinessProfileUrl: '',
  chatProvider: 'none',
  chatId: '',
  minBookingStandard: 5000,
  minBookingStandardConsidered: 4000,
  minBookingRegional: 12000,
  // Hidden until the client confirms public display (brief §13 item 5).
  showMinBooking: false,
  // Hidden until Ahpra compliance is confirmed (brief §13 item 6).
  testimonialsEnabled: false,
  beforeAfterEnabled: false,
}

export const HOME: HomeContent = {
  heroKicker: 'Sleep Anaesthesia',
  heroHeadline: 'Sleep dentistry & IV sedation, at your dental clinic.',
  heroSubheading:
    'FANZCA specialist anaesthetists, hospital-grade monitoring and every medication, brought to dental clinics across Queensland and Victoria, so patients can sleep through implants, wisdom teeth and long appointments without a hospital admission.',
  primaryCtaText: "I'm a dentist: sedation for my clinic",
  primaryCtaHref: '/clinics',
  secondaryCtaText: "I'm a patient: sleep dentistry",
  secondaryCtaHref: '/patients',
  stats: [
    { value: '15+', label: 'Years of specialist anaesthetist training' },
    { value: '100%', label: 'ANZCA-accredited anaesthesiologists' },
    { value: '40%', label: 'Of people experience dental fear' },
    { value: 'QLD+VIC', label: 'Metro and regional coverage' },
  ],
}

export const BANNER: Banner = {
  enabled: false,
  message: '',
  linkText: '',
  linkHref: '',
  startsAt: '',
  endsAt: '',
}
