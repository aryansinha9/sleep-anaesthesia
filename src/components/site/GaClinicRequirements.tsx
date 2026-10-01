// Locked content (client request, Oct 2026): the GA clinic suitability
// requirements and site logistics. Rendered ONLY by the portal page after a
// valid clinic access code; server component, so none of this text is sent to
// visitors who have not unlocked the portal.
import 'server-only'

const REQUIREMENTS: { title: string; intro?: string; items: string[]; note?: string }[] = [
  // Item 01 supplied by the client (website edits.docx), verbatim.
  { title: 'Accreditation, Inspections and regulations apply to all clinics set up for General Anaesthesia.', items: [] },
  { title: 'Access to the clinic', items: ['Ground floor access, or easy lift access suitable for clinical equipment', 'No steps or stairs anywhere along the patient pathway', 'Clear, unobstructed access from street or car park to the treatment room'], note: 'This ensures patients can be safely moved and, if required, quickly transferred by ambulance.' },
  { title: 'Entry and exit', items: ['Easy entry and exit for large anaesthetic machines', 'Unrestricted access for an ambulance stretcher', 'Wide hallways and doorways suitable for patient transfer'], note: 'Emergency access must never be compromised.' },
  { title: 'Treatment room', items: ['Large enough for 5–6 clinical staff to work safely around the patient', 'Ample access at the head of the patient at all times', 'Ideally large or sliding doors, to allow rapid equipment and patient movement'], note: 'Adequate space is essential for airway management, monitoring, and emergency response.' },
  { title: 'Stairs and level changes', items: ['Steps are not permitted', 'All patient movement must occur on a flat, level surface or via a suitable lift'], note: 'This reduces risk during patient transfer and emergency evacuation.' },
  { title: 'Equipment and emergency readiness', items: ['Full anaesthetic machines and monitoring equipment', 'Oxygen, suction, and emergency power access', 'Emergency resuscitation equipment', 'Clear pathways for rapid ambulance access and patient extraction'] },
  { title: 'Strict patient suitability screening', intro: 'Not all patients are suitable for general anaesthesia in a clinic setting. We conduct thorough pre-anaesthetic screening to assess:', items: ['Medical history and existing health conditions', 'Medications and allergies', 'Previous anaesthetic history', 'Individual risk factors'], note: 'Patients who do not meet safety criteria are referred to a hospital environment where additional resources are available.' },
]

export function GaClinicRequirements() {
  return (
    <>
      <section className="features" id="requirements">
          <span className="kicker">Clinic suitability requirements</span>
          <h2 className="section-title">Where general anaesthesia can be delivered</h2>
          <p className="section-intro">General anaesthesia can only be safely delivered in clinics that meet strict physical access and space requirements.</p>
          {REQUIREMENTS.map((r, i) => (
            <div className="feature reveal" key={r.title}>
              <p className="f-num">{String(i + 1).padStart(2, '0')}</p>
              <h3 className="f-title">{r.title}</h3>
              <div className="f-copy">
                {r.intro && <p>{r.intro}</p>}
                {r.items.length > 0 && <ul>{r.items.map((it) => <li key={it}>{it}</li>)}</ul>}
                {r.note && <p>{r.note}</p>}
              </div>
            </div>
          ))}
        </section>

        <section id="logistics" className="section">
          <span className="kicker">Logistics &amp; site requirements</span>
          <h2 className="section-title">Setting up on the day</h2>
          <p className="section-intro">To ensure a smooth setup and efficient workflow, please ensure the following requirements can be met:</p>
          <div className="cells reveal">
            <div className="cell"><h3>Clinic access</h3><ul className="checklist"><li>Ground floor access or lift access available</li><li>No stairs or access restrictions</li><li>Parking close to the clinic for our medical vehicle</li><li>Clear access from parking to the treatment room</li></ul></div>
            <div className="cell"><h3>Doorways &amp; access</h3><ul className="checklist"><li>Wide doorways suitable for transporting medical equipment (ideally 900&nbsp;mm or wider)</li><li>Clear hallways and unobstructed access throughout the clinic</li></ul></div>
            <div className="cell"><h3>Treatment room</h3><ul className="checklist"><li>Large enough to comfortably accommodate a minimum of 4–5 people</li><li>Adequate space for monitoring equipment, ventilator and medical trolley</li><li>Standard power outlets available</li><li>Clinical suction available</li><li>Good lighting and ventilation</li></ul></div>
            <div className="cell"><h3>Recovery area</h3><ul className="checklist"><li>Dedicated recovery area for post-procedure monitoring</li><li>Comfortable seating or recovery chair</li><li>Privacy for patients during recovery</li></ul></div>
          </div>
          <p className="fine-print" style={{ maxWidth: 'var(--measure)', fontSize: 16 }}>Our team will liaise with your clinic before the first operating list to confirm access, room layout and equipment positioning, ensuring an efficient setup with minimal disruption to your practice.</p>
        </section>
    </>
  )
}
