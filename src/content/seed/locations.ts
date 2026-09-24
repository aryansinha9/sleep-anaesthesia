// Service areas (brief §1.2–1.3). Primary areas each get a page with distinct
// copy. Towns are stored with active=false until the client confirms which
// ones are serviced (brief §13 item 3); inactive towns never render.
import type { Location } from '../types'

const cta = `<p><a href="/contact">Contact us</a> to check availability for your clinic or to arrange a list.</p>`

const primary = (l: Omit<Location, 'kind' | 'active' | 'hasPage'>): Location => ({ ...l, kind: 'primary', active: true, hasPage: true })

export const PRIMARY_LOCATIONS: Location[] = [
  primary({
    name: 'Brisbane',
    slug: 'brisbane',
    state: 'QLD',
    region: 'South East Queensland',
    summary: 'All of Brisbane, north and south of the river, including the CBD, inner suburbs and outer metropolitan practices.',
    body:
      `<h2>Mobile sedation for Brisbane dental clinics</h2><p>Brisbane is our home base: our office is in Chermside, and our anaesthetists work with dental and oral surgery practices right across the city, from the CBD and inner suburbs to outer metropolitan clinics north and south of the river.</p>` +
      `<h2>Short-notice lists are more likely here</h2><p>Because our team is based locally, Brisbane clinics have the most flexibility for scheduling. We recommend booking 1–2 weeks ahead, but we do our best to accommodate short-notice cases, and regular clinics can secure recurring operating days.</p>` +
      `<h2>For Brisbane patients</h2><p>There is no clinic to travel to: your anaesthetist comes to the dental practice where your treatment is already booked. Ask your dentist whether they work with Sleep Anaesthesia, or <a href="/contact">contact us</a> and we can help.</p>` +
      cta,
    seoTitle: 'Mobile IV Sedation for Dental Clinics in Brisbane',
    seoDescription: 'FANZCA specialist anaesthetists providing mobile IV sedation and general anaesthesia to dental clinics across Brisbane. Office in Chermside.',
  }),
  primary({
    name: 'Gold Coast',
    slug: 'gold-coast',
    state: 'QLD',
    region: 'South East Queensland',
    summary: 'Dental clinics across the whole Gold Coast, from the northern suburbs to the southern border.',
    body:
      `<h2>Specialist anaesthesia for Gold Coast practices</h2><p>We travel to dental clinics across the Gold Coast with a complete anaesthetic setup: anaesthetic and monitoring equipment, medications, emergency gear and an anaesthetic nurse. Your practice provides the treatment room and dental team; we handle sedation, recovery, patient paperwork and Medicare claims.</p>` +
      `<h2>Planning a Gold Coast list</h2><p>Gold Coast lists work best when booked in advance so we can schedule travel. Clinics that combine several patients into one operating day, such as wisdom teeth and implant cases, make the most of each visit.</p>` +
      cta,
    seoTitle: 'Mobile Dental Sedation on the Gold Coast',
    seoDescription: 'Mobile IV sedation and general anaesthesia for Gold Coast dental clinics, delivered by FANZCA specialist anaesthetists with hospital-grade equipment.',
  }),
  primary({
    name: 'Sunshine Coast',
    slug: 'sunshine-coast',
    state: 'QLD',
    region: 'South East Queensland',
    summary: 'Practices throughout the Sunshine Coast region and hinterland.',
    body:
      `<h2>Sedation without sending patients to Brisbane</h2><p>For Sunshine Coast patients, the alternative to in-chair sedation is often a hospital admission or a trip to Brisbane. We bring specialist anaesthetists to practices throughout the Sunshine Coast, so patients can be treated by the dentist they already know, close to home.</p>` +
      `<h2>How clinics work with us</h2><p>There is no cost to your practice: patients are billed directly and receive a Medicare rebate on the anaesthesia fee where eligible. Lists are scheduled in advance around our travel, and we can bring additional staff for high-volume days.</p>` +
      cta,
    seoTitle: 'Mobile Dental Sedation on the Sunshine Coast',
    seoDescription: 'Specialist-led IV sedation and general anaesthesia for Sunshine Coast dental practices. No cost to your clinic, Medicare rebates for patients.',
  }),
  primary({
    name: 'Toowoomba',
    slug: 'toowoomba',
    state: 'QLD',
    region: 'Darling Downs',
    summary: 'Dental clinics in Toowoomba and across the Darling Downs.',
    body:
      `<h2>Specialist anaesthesia on the Darling Downs</h2><p>Toowoomba practices can offer their patients IV sedation and general anaesthesia delivered by a FANZCA specialist anaesthetist, without referring them to a hospital list or to Brisbane. We bring every piece of equipment and all medications with us.</p>` +
      `<h2>Booking a Toowoomba list</h2><p>Toowoomba lists are planned ahead so the day can be scheduled around travel. Grouping several patients into one operating day is the most efficient approach for your clinic and your patients.</p>` +
      cta,
    seoTitle: 'Mobile IV Sedation for Toowoomba Dental Clinics',
    seoDescription: 'Mobile IV sedation and general anaesthesia for dental clinics in Toowoomba and the Darling Downs, by FANZCA specialist anaesthetists.',
  }),
  primary({
    name: 'Regional Queensland',
    slug: 'regional-queensland',
    state: 'QLD',
    region: 'Regional Queensland',
    summary: 'Outreach lists for dental clinics in regional Queensland towns, planned in advance.',
    body:
      `<h2>Outreach sedation for regional Queensland</h2><p>Patients in regional Queensland often face long waits or long drives for dental treatment under sedation. We run outreach lists for regional dental clinics, bringing a specialist anaesthetist, an anaesthetic nurse and a complete mobile setup to your practice.</p>` +
      `<h2>How regional lists work</h2><ul><li>Lists are planned well in advance to coordinate travel and accommodation.</li><li>A higher minimum booking applies to regional and outreach centres, so lists usually combine several patients over one or more days.</li><li>Your clinic must meet our access and room requirements, especially for <a href="/general-anaesthesia">general anaesthesia</a>.</li></ul>` +
      cta,
    seoTitle: 'Mobile Dental Sedation in Regional Queensland',
    seoDescription: 'Outreach IV sedation and general anaesthesia lists for regional Queensland dental clinics, delivered by FANZCA specialist anaesthetists.',
  }),
  primary({
    name: 'Melbourne',
    slug: 'melbourne',
    state: 'VIC',
    region: 'Melbourne',
    summary: 'Melbourne dental clinics, including the CBD and South East suburbs.',
    body:
      `<h2>Mobile anaesthesia for Melbourne dental clinics</h2><p>Our Victorian team provides the same service as in Queensland: FANZCA specialist anaesthetists and anaesthetic nurses with hospital-grade monitoring, brought to your practice. All practitioners are insured, credentialed and licensed to provide sedation in Victoria.</p>` +
      `<h2>Working with Melbourne practices</h2><p>We work with Melbourne clinics in the CBD and South East suburbs. Ad-hoc lists are welcome and regular operating days can be arranged. Patients are billed directly, so there is no cost to your practice.</p>` +
      cta,
    seoTitle: 'Mobile IV Sedation for Melbourne Dental Clinics',
    seoDescription: 'FANZCA specialist anaesthetists providing mobile IV sedation and general anaesthesia to Melbourne dental clinics. No cost to your practice.',
  }),
  primary({
    name: 'Regional Victoria',
    slug: 'regional-victoria',
    state: 'VIC',
    region: 'Regional Victoria',
    summary: 'Outreach lists for dental clinics in regional Victorian towns, planned in advance.',
    body:
      `<h2>Bringing specialist sedation to regional Victoria</h2><p>We run outreach lists for dental clinics in regional Victoria, so patients can have treatment under IV sedation or general anaesthesia at their local practice rather than travelling to Melbourne.</p>` +
      `<h2>Planning an outreach list</h2><ul><li>Outreach lists are scheduled well ahead to coordinate travel.</li><li>A higher minimum booking applies to regional and outreach centres.</li><li>We confirm access, room layout and equipment positioning with your team before the first list.</li></ul>` +
      cta,
    seoTitle: 'Mobile Dental Sedation in Regional Victoria',
    seoDescription: 'Outreach IV sedation and general anaesthesia lists for regional Victorian dental clinics, delivered by FANZCA specialist anaesthetists.',
  }),
]

const QLD_TOWNS = ['Toowoomba', 'Ipswich', 'Gympie', 'Bundaberg', 'Hervey Bay', 'Maryborough', 'Gladstone', 'Rockhampton', 'Yeppoon', 'Mackay', 'Townsville', 'Ayr', 'Charters Towers', 'Cairns', 'Innisfail', 'Atherton', 'Mount Isa', 'Emerald', 'Biloela', 'Warwick', 'Dalby', 'Chinchilla', 'Roma', 'Kingaroy', 'Gatton', 'Beaudesert']
const VIC_TOWNS = ['Geelong', 'Ballarat', 'Bendigo', 'Shepparton', 'Mildura', 'Warrnambool', 'Wodonga', 'Traralgon', 'Morwell', 'Moe', 'Sale', 'Bairnsdale', 'Horsham', 'Colac', 'Wangaratta', 'Echuca', 'Swan Hill', 'Ararat', 'Portland', 'Hamilton', 'Benalla', 'Seymour', 'Kyneton', 'Castlemaine', 'Warragul', 'Leongatha']

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

const town = (name: string, state: 'QLD' | 'VIC'): Location => ({
  name,
  // Toowoomba is also a primary area; its town entry gets a distinct slug.
  slug: slugify(name) + (PRIMARY_LOCATIONS.some((p) => p.slug === slugify(name)) ? '-town' : ''),
  kind: 'town',
  state,
  region: state === 'QLD' ? 'Regional Queensland' : 'Regional Victoria',
  active: false,
  hasPage: false,
  summary: '',
  body: '',
  seoTitle: '',
  seoDescription: '',
})

export const LOCATIONS: Location[] = [...PRIMARY_LOCATIONS, ...QLD_TOWNS.map((t) => town(t, 'QLD')), ...VIC_TOWNS.map((t) => town(t, 'VIC'))]
