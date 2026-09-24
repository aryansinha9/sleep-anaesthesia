import type { SiteSettings } from '@/content/types'
import { enquiriesEnabled } from '@/lib/enquiry'
import { telHref } from '@/lib/format'
import { EnquiryForm } from './EnquiryForm'

/** The enquiry form, or (if no delivery is configured yet) direct contact details. */
export function Enquiry({ settings, audience, page, title, lockAudience }: { settings: SiteSettings; audience: 'clinic' | 'patient'; page: string; title?: string; lockAudience?: boolean }) {
  if (enquiriesEnabled()) return <EnquiryForm defaultAudience={audience} page={page} title={title} lockAudience={lockAudience} />
  return (
    <div className="enquiry" id="enquire">
      <h2>{title || 'Get in touch'}</h2>
      <p className="muted" style={{ margin: 0 }}>{audience === 'clinic' ? 'Talk to us about sedation lists for your practice.' : 'Ask us anything about sedation for your procedure.'}</p>
      <div className="cta-row" style={{ marginTop: 4 }}>
        {settings.phone && <a className="btn btn-primary" href={telHref(settings.phone)}>Call {settings.phone}</a>}
        <a className="btn btn-secondary" href={`mailto:${settings.email}`}>Email us</a>
      </div>
    </div>
  )
}
