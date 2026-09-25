// Sleep treatments (brief §5). One entry per procedure; menu, lists and
// pages all render from this data. No existing treatment entries existed on
// this site, so there are no duplicates to merge.
import type { Treatment } from '../types'

const prepare = `<h2>Preparing and recovering</h2><ul><li>Fast as instructed: no food for 6 hours beforehand, and clear fluids only up to 2 hours before.</li><li>Arrange a responsible adult to take you home and stay with you for the rest of the day and night.</li><li>Do not drive, drink alcohol or sign legal documents for 24 hours afterwards.</li></ul><p>Full instructions, and answers to payment and Medicare questions, are on our <a href="/patients">patient information page</a>.</p>`

const disclaimer = `<p>Suitability for sedation is assessed individually. Any surgical or invasive procedure carries risks; before proceeding, you should seek a second opinion from an appropriately qualified health practitioner.</p>`

export const TREATMENTS: Treatment[] = [
  {
    title: 'Sedation for Wisdom Teeth Removal',
    menuLabel: 'Wisdom teeth',
    slug: 'wisdom-teeth',
    summary: 'IV sedation or general anaesthesia for wisdom teeth removal, provided by a specialist anaesthetist at your own dental clinic.',
    body:
      `<h2>Wisdom teeth removal, without the hospital admission</h2><p>Wisdom teeth are often removed together, and impacted teeth can take time. Many patients would rather not be aware of the procedure. With Sleep Anaesthesia, a FANZCA specialist anaesthetist comes to your dentist or oral surgeon's clinic, so you can be sedated for your wisdom teeth removal without being admitted to hospital.</p>` +
      `<h2>How sedation works for wisdom teeth</h2><p>Most wisdom teeth procedures are done under <a href="/iv-sedation">IV sedation</a>: medication through a small drip in your arm makes you deeply relaxed and sleepy, and most patients remember little or nothing afterwards. Your dentist still uses local anaesthetic to numb the area. For more complex surgery in clinics that meet our requirements, <a href="/general-anaesthesia">general anaesthesia</a> may be an option.</p><p>Your anaesthetist and an anaesthetic nurse monitor your oxygen levels, heart rhythm, blood pressure and breathing throughout, and stay with you through recovery.</p>` +
      prepare + disclaimer,
    image: null,
    visibleInMenu: true,
    seoTitle: 'IV Sedation for Wisdom Teeth Removal',
    seoDescription: 'Sleep through wisdom teeth removal at your own dental clinic. IV sedation by FANZCA specialist anaesthetists, with Medicare rebates processed for you.',
  },
  {
    title: 'Sedation for Strong Gag Reflex',
    menuLabel: 'Strong gag reflex',
    slug: 'gag-reflex',
    summary: 'A strong gag reflex can make even routine dental work difficult. Sedation lets your dentist work while you stay relaxed.',
    body:
      `<h2>When your gag reflex gets in the way of treatment</h2><p>For some people, impressions, X-rays, fillings or simply having instruments in the mouth trigger a strong gag reflex. It is common, it is not something you can simply switch off, and it can mean putting off treatment you need.</p>` +
      `<h2>How sedation helps</h2><p>Under <a href="/iv-sedation">IV sedation</a> you are deeply relaxed and the reflex is usually much less of a problem, so your dentist can complete the work, often in a single longer appointment instead of several short ones. A specialist anaesthetist looks after your breathing and vital signs the whole time, and your dentist concentrates on your teeth.</p>` +
      prepare + disclaimer,
    image: null,
    visibleInMenu: true,
    seoTitle: 'Sedation for a Strong Gag Reflex',
    seoDescription: 'Struggle with a strong gag reflex at the dentist? IV sedation by a specialist anaesthetist at your own dental clinic can help you complete treatment.',
  },
  {
    title: 'Sedation for Dental Implants',
    menuLabel: 'Dental implants',
    slug: 'dental-implants',
    summary: 'Specialist-led IV sedation or general anaesthesia for single and multiple dental implant procedures, in your dental clinic.',
    body:
      `<h2>Dental implants, in specialist hands</h2><p>Implant surgery can involve long appointments, bone grafting and several implants placed at once. Sleep Anaesthesia brings a FANZCA specialist anaesthetist, an anaesthetic nurse and hospital-grade monitoring to your implant dentist's clinic, so you can be sedated for the procedure where your treatment is already planned.</p>` +
      `<h2>Choosing the right anaesthetic</h2><p>Most implant procedures are performed under <a href="/iv-sedation">IV sedation</a>. For longer or more complex surgery, and in clinics that meet our <a href="/general-anaesthesia">site requirements</a>, general anaesthesia may be offered. Your anaesthetist will talk you through the options before the day.</p><p>Looking for full-arch treatment? See <a href="/treatments/all-on-4">All-on-4®</a> and <a href="/treatments/all-on-x">All-on-X surgery</a>.</p>` +
      prepare + disclaimer,
    image: null,
    visibleInMenu: true,
    seoTitle: 'Sedation for Dental Implants',
    seoDescription: 'IV sedation and general anaesthesia for dental implant surgery, delivered in your dental clinic by FANZCA specialist anaesthetists across QLD and VIC.',
  },
  {
    title: 'Sedation for Tooth Extractions',
    menuLabel: 'Extractions',
    slug: 'extractions',
    summary: 'IV sedation for single or multiple tooth extractions, so anxious patients can have teeth removed comfortably at their dentist.',
    body:
      `<h2>Tooth extractions with a specialist anaesthetist</h2><p>Whether it is one difficult tooth or several extractions in one visit, sedation can make the appointment much easier, especially if you are anxious about dental treatment. Sleep Anaesthesia provides specialist anaesthetists at your own dental clinic, so there is no need for a hospital admission.</p>` +
      `<h2>What to expect</h2><p>Your anaesthetist will meet you beforehand and place a small drip for <a href="/iv-sedation">IV sedation</a>. You will be deeply relaxed while your dentist numbs the area and completes the extractions. Recovery is monitored by our team until you are ready to go home with your escort.</p>` +
      prepare + disclaimer,
    image: null,
    visibleInMenu: true,
    seoTitle: 'Sedation for Tooth Extractions',
    seoDescription: 'Anxious about having a tooth removed? IV sedation for single and multiple extractions, provided by specialist anaesthetists at your own dental clinic.',
  },
  {
    title: 'Sedation for All-on-4® Treatment',
    menuLabel: 'All-on-4®',
    slug: 'all-on-4',
    summary: 'Anaesthesia for All-on-4® full-arch implant treatment, delivered by a specialist anaesthetist in your dental clinic.',
    body:
      `<h2>Full-arch treatment is a big day</h2><p>All-on-4® treatment usually combines extractions, implant placement and a temporary bridge in one long appointment. Many patients prefer to be sedated for the whole procedure. Sleep Anaesthesia brings the full anaesthetic setup to your implant clinic, so the surgery can go ahead where your treatment was planned.</p>` +
      `<h2>Sedation or general anaesthesia</h2><p>We provide <a href="/iv-sedation">IV sedation</a> for All-on-4® procedures, and <a href="/general-anaesthesia">general anaesthesia</a> in clinics that meet our access and space requirements. A FANZCA specialist anaesthetist and an anaesthetic nurse stay with you throughout the procedure and recovery.</p>` +
      prepare + `<p>All-on-4® is a registered trademark of Nobel Biocare.</p>` + disclaimer,
    image: null,
    visibleInMenu: true,
    seoTitle: 'Sedation for All-on-4® Treatment',
    seoDescription: 'IV sedation and general anaesthesia for All-on-4® full-arch implant treatment, delivered in your dental clinic by FANZCA specialist anaesthetists.',
  },
  {
    title: 'Sedation for All-on-X Surgery',
    menuLabel: 'All-on-X surgery',
    slug: 'all-on-x',
    summary: 'Specialist anaesthesia for All-on-X full-arch surgery, one of the procedures we support most often in dental clinics.',
    body:
      `<h2>Anaesthesia for All-on-X surgery</h2><p>All-on-X is a full-arch implant approach using as many implants as your surgeon plans for your jaw. It is one of the procedures we support most often, and one full All-on-X surgery can make up a whole operating session for a clinic.</p>` +
      `<h2>How we support the procedure</h2><p>A FANZCA specialist anaesthetist provides <a href="/iv-sedation">IV sedation</a>, or <a href="/general-anaesthesia">general anaesthesia</a> where the clinic meets our requirements. We bring the anaesthetic machine, monitoring, medications and emergency equipment, and an anaesthetic nurse manages recovery, so the surgical team can focus on the surgery.</p><p>Dental clinics: see <a href="/clinics">how mobile sedation works for your practice</a>.</p>` +
      prepare + disclaimer,
    image: null,
    visibleInMenu: true,
    seoTitle: 'Sedation for All-on-X Surgery',
    seoDescription: 'Mobile IV sedation and general anaesthesia for All-on-X full-arch surgery, delivered in your dental clinic by FANZCA specialist anaesthetists.',
  },
]
