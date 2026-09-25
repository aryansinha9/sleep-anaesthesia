import Link from 'next/link'
import { JsonLd } from '@/components/site/JsonLd'
import { getSettings } from '@/lib/data'
import { fullAddress } from '@/lib/format'
import { breadcrumbSchema, buildMetadata } from '@/lib/seo'

export const generateMetadata = () =>
  buildMetadata({ path: '/privacy', pageKey: 'privacy', title: 'Privacy Policy', description: 'How Sleep Anaesthesia collects, uses and protects personal information, including enquiries and website chat.' })

// Website privacy notice. The chat section covers brief §10. The client should
// have this reviewed against their full practice privacy policy.
export default async function PrivacyPage() {
  const s = await getSettings()
  const chat = s.chatProvider === 'tawk' ? 'Tawk.to' : s.chatProvider === 'crisp' ? 'Crisp' : 'a third-party chat provider'
  return (
    <div className="wrap">
      <section className="page-hero">
        <span className="kicker">Privacy</span>
        <h1 className="display">Privacy policy</h1>
        <p className="sub">How {s.businessName} handles personal information collected through this website. We comply with the Australian Privacy Principles in the Privacy Act 1988 (Cth).</p>
      </section>
      <hr className="rule2" />
      <section className="section">
        <div className="prose">
          <h2>What we collect through this website</h2>
          <p>When you send an enquiry, we collect the details you give us: your name, email address and/or phone number, clinic name (for dental clinics), and your message. We use them only to respond to your enquiry and to arrange our services.</p>
          <p>Please do not include detailed medical information in enquiry forms or chat. Clinical information is collected separately through our secure pre-assessment and consent process.</p>
          <h2>Website chat</h2>
          <p>Our website may offer a chat service provided by {chat}. Messages you send through the chat, and any contact details you provide in it, are processed and stored by that provider on our behalf and may be forwarded to our team by email, SMS or messaging apps so we can reply, including outside office hours. The chat provider may store this information on servers outside Australia. The chat widget is not used for clinical advice, and you should not share detailed medical information in it.</p>
          <h2>Cookies and analytics</h2>
          <p>This website uses cookies that are necessary for it to work. The chat widget, video players (YouTube and Vimeo, loaded only when you press play) and map embed may set their own cookies under their own privacy policies.</p>
          <h2>How we protect your information</h2>
          <p>Enquiries are stored securely with access limited to authorised staff. We do not sell personal information.</p>
          <h2>Access, correction and complaints</h2>
          <p>You can ask to access or correct the personal information we hold about you, or make a privacy complaint, by emailing <a href={`mailto:${s.email}`}>{s.email}</a> or writing to us at {fullAddress(s)}. If you are not satisfied with our response, you can contact the Office of the Australian Information Commissioner (oaic.gov.au).</p>
          <p><Link href="/contact">Contact us</Link> with any questions about this policy.</p>
        </div>
      </section>
      <JsonLd data={breadcrumbSchema([{ name: 'Privacy policy', path: '/privacy' }])} />
    </div>
  )
}
