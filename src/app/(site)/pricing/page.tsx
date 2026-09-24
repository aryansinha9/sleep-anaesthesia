import Link from 'next/link'
import { CloseBand } from '@/components/site/CloseBand'
import { JsonLd } from '@/components/site/JsonLd'
import { getSettings } from '@/lib/data'
import { breadcrumbSchema, buildMetadata } from '@/lib/seo'

// Brief §3–4: the per-session price table and the removed buy-now-pay-later/wallet options are gone
// from the source entirely (not hidden); pricing is by quote. The TLC figures
// below are the finance provider's repayment guide, not our fees.
export const generateMetadata = () =>
  buildMetadata({ path: '/pricing', pageKey: 'pricing', title: 'Dental Sedation Fees, Medicare Rebates & Payment Plans', description: 'One all-inclusive dental sedation fee with no surprise charges. Medicare rebates processed for you, and TLC payment plans. Contact us for a quote.' })

const TLC_APPLY = 'https://tlc.com.au/apply?partner_id=4997&type=medical'
const RECKONER: [string, string, string?][] = [
  ['$2,000', '$25', '36 mths'], ['$2,500', '$30', '36 mths'], ['$3,500', '$40', '36 mths'], ['$5,000', '$30'], ['$6,000', '$35'], ['$7,000', '$45'], ['$8,000', '$55'], ['$10,000', '$70'],
  ['$20,000', '$125'], ['$25,000', '$135'], ['$30,000', '$160'], ['$35,000', '$180'], ['$40,000', '$175', '84 mths'], ['$45,000', '$195', '84 mths'], ['$50,000', '$220', '84 mths'],
  ['$55,000', '$240', '84 mths'], ['$60,000', '$265', '84 mths'], ['$65,000', '$285', '84 mths'], ['$70,000', '$305', '84 mths'],
]

export default async function PricingPage() {
  const settings = await getSettings()
  return (
    <>
      <div className="wrap">
        <section className="page-hero">
          <span className="kicker">Fees &amp; payment plans</span>
          <h1 className="display"><span className="line">One all-inclusive fee.</span> <span className="line">No surprise charges.</span></h1>
          <p className="sub">Dental sedation fees, made simple. Patients are charged directly, payment plans are offered, and we process the Medicare rebate on behalf of patients.</p>
          <div className="cta-row">
            <Link className="btn btn-primary" href="/contact#enquire">Request a quote</Link>
            <a className="btn btn-secondary" href="#plans">Payment plans</a>
          </div>
        </section>

        <hr className="rule2" />

        <section className="section">
          <span className="kicker">How it works</span>
          <h2 className="visually-hidden">How our fees work</h2>
          <div className="cells reveal">
            <div className="cell"><h3>All-inclusive single fee</h3><p>One fee covers your specialist anaesthesiologist, anaesthetic nurse, all medications, monitoring, emergency equipment, pre-operative assessment and aftercare, meaning no surprise charges.</p></div>
            <div className="cell"><h3>Patients charged directly</h3><p>There is no cost to the dental clinic. You&apos;ll receive an accurate quote in advance, with secure payment links online or via Eftpos.</p></div>
            <div className="cell"><h3>Medicare rebate handled</h3><p>Medicare rebates are processed on the day of operation. The majority of patients are able to immediately pay their entire balance within 24 hours of having their procedure.</p></div>
          </div>
        </section>

        <section className="split tinted reveal" id="quote">
          <div className="split-copy">
            <span className="kicker">Your quote</span>
            <h2 className="section-title">Pricing depends on procedure length and location</h2>
            <p className="note">Every procedure is different, so we quote each patient individually before anything is booked. Contact us for a quote, or ask your dentist to include sedation in your treatment plan.</p>
            <div className="cta-row"><Link className="btn btn-primary" href="/contact#enquire">Contact us for a quote</Link></div>
          </div>
        </section>

        <hr className="rule2" />

        <section className="features" id="plans">
          <span className="kicker">Payment plans available</span>
          <h2 className="section-title">Spread the cost with TLC</h2>
          <div className="feature reveal">
            <p className="f-num">01</p>
            <h3 className="f-title">TLC: Total Lifestyle Credit</h3>
            <div className="f-copy">
              <p>Total Lifestyle Credit (Australian Credit Licence 509691) offers flexible payment plans:</p>
              <ul>
                <li>A TLC payment plan has the flexibility to pay off as quickly as you want</li>
                <li>The plan covers any medical fees and related costs like flights or accommodation, and the entire process is arranged by their team</li>
                <li>There aren&apos;t any upfront or hidden fees; the weekly payment covers everything</li>
                <li>The interest rate is determined by the applicant&apos;s score, but rates are very competitive, and interest is only charged for the term you wish to use, so it is very flexible</li>
              </ul>
              <p><strong>Terms &amp; conditions:</strong> speak to TLC directly for a quote based on your personal circumstances and for the full terms and conditions. A full credit and financial assessment would need to be completed prior to acceptance of any offer or product.</p>
              <p><a className="btn btn-primary" href={TLC_APPLY} target="_blank" rel="noopener noreferrer">Apply with TLC: intake form</a></p>
            </div>
          </div>
          <div className="feature reveal">
            <p className="f-num">02</p>
            <h3 className="f-title">Proof of income for TLC</h3>
            <div className="f-copy">
              <p>You MUST be able to provide TLC with proof of income. Commonly requested documents:</p>
              <ul>
                <li><strong>Employed</strong> (full time / part time / casual): 2 recent pay slips</li>
                <li><strong>Other income</strong>: Centrelink (family assistance A&amp;B / carer / disability / elderly / self-retiree): most recent Centrelink statement</li>
                <li><strong>Self-employed</strong>: most recent personal tax return</li>
              </ul>
              <p><a href={TLC_APPLY} target="_blank" rel="noopener noreferrer">TLC intake form</a>. You&apos;ll need these documents ready when you apply.</p>
            </div>
          </div>
        </section>

        <hr className="rule2" />

        <section id="tlc-reckoner" className="section">
          <span className="kicker">TLC standard payment ready reckoner</span>
          <h2 className="section-title">What a TLC plan looks like per week</h2>
          <p className="section-intro">Indicative weekly repayments from Total Lifestyle Credit (a finance guide, not our fees). Speak to TLC for a quote based on your circumstances.</p>
          <div className="split reveal" style={{ padding: 0, alignItems: 'start', gridTemplateColumns: 'minmax(0, 6fr) minmax(0, 5fr)' }}>
            <div className="cell" style={{ padding: 0, overflow: 'hidden' }}>
              <table className="reckoner">
                <thead><tr><th scope="col">Purchase price (inc GST)</th><th scope="col">Weekly</th></tr></thead>
                <tbody>
                  {RECKONER.map(([price, weekly, term]) => (
                    <tr key={price}><td>{price} {term && <span className="muted">({term})</span>}</td><td>{weekly}</td></tr>
                  ))}
                </tbody>
              </table>
              <p className="reckoner-note">*Prices to be used as a guide only. From $5,000 to $35,000, prices are based on 60-month terms. Total Lifestyle Credit, Australian Credit Licence number 509691.</p>
            </div>
            <div>
              <ul className="checklist">
                <li>TLC can fund from <strong>$2,000 to $70,000</strong></li>
                <li>Flexible repayments with up to 84 months</li>
                <li>No stress: the whole process is managed privately by TLC&apos;s consultants</li>
                <li>Either use your unique client portal or call TLC on <a href="tel:1300045047">1300 045 047</a></li>
                <li>Email TLC via <a href="mailto:admin@tlc.com.au">admin@tlc.com.au</a></li>
              </ul>
              <div className="cta-row">
                <a className="btn btn-primary" href={TLC_APPLY} target="_blank" rel="noopener noreferrer">Apply online with TLC</a>
                <a className="btn btn-secondary" href="tel:1300045047">TLC quotes: 1300 045 047</a>
              </div>
            </div>
          </div>
        </section>
      </div>

      <CloseBand lines={['An accurate quote,', 'before you commit.']} sub="Sedation for a typical procedure, like wisdom teeth, is significantly more affordable in-clinic compared to hospital settings." settings={settings} />
      <JsonLd data={breadcrumbSchema([{ name: 'Fees & payment plans', path: '/pricing' }])} />
    </>
  )
}
