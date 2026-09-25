'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState, useTransition } from 'react'
import { deleteEntry, discardDraft, publishEntry, restoreAndPublishVersion, restoreVersion, saveDraft, unpublishEntry } from '@/app/admin/actions/content'
import { fetchVideoThumbnail } from '@/app/admin/actions/media'
import { COLLECTION_BY_KEY, DAYS, type FieldDef } from '@/content/collections'
import { SLOT_BY_KEY } from '@/content/slots'
import type { CollectionKey, ImageRef } from '@/content/types'
import { ConfirmButton } from './Confirm'
import { CaptionsField, ImageField, VideoFileField } from './MediaFields'
import { RichTextEditor } from './RichTextEditor'
import { useResultToast, useToast } from './Toast'

type Values = Record<string, unknown>
type Errors = Record<string, string>
type VersionMeta = { id: number; kind: 'draft' | 'published'; createdAt: string; by: string | null }

const slugify = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[®™©]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80)
const visible = (f: FieldDef, v: Values) => !f.showIf || f.showIf.in.includes(String(v[f.showIf.field]))
const fmt = (iso: string) => new Date(iso).toLocaleString('en-AU', { dateStyle: 'medium', timeStyle: 'short' })

/** Client-side checks mirror the server rules for instant feedback (the server re-validates). */
function clientValidate(fields: FieldDef[], v: Values, rtLengths: Record<string, number>, prefix = ''): Errors {
  const errors: Errors = {}
  for (const f of fields) {
    if (!visible(f, v)) continue
    const key = prefix + f.name
    const val = v[f.name]
    if (f.type === 'text' || f.type === 'textarea') {
      const s = String(val ?? '')
      if (f.required && !s.trim()) errors[key] = `${f.label} is required.`
      else if (s.length > f.max) errors[key] = `${f.label} must be ${f.max} characters or fewer.`
    } else if (f.type === 'richtext') {
      const len = rtLengths[key] ?? String(val ?? '').replace(/<[^>]+>/g, '').length
      if (f.required && len === 0) errors[key] = `${f.label} is required.`
      else if (len > f.max) errors[key] = `${f.label} must be ${f.max} characters or fewer.`
    } else if (f.type === 'slug') {
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(val ?? ''))) errors[key] = 'Use lower-case letters, numbers and single hyphens only.'
    } else if (f.type === 'image') {
      const img = val as ImageRef | null
      if (f.required && !img) errors[key] = `${f.label} is required.`
      if (img && !img.alt?.trim()) errors[`${key}.alt`] = 'Alt text is required. Describe what the image shows.'
    } else if ((f.type === 'url' || f.type === 'email') && f.required && !String(val ?? '').trim()) {
      errors[key] = `${f.label} is required.`
    } else if (f.type === 'list') {
      ;((val as Values[]) || []).forEach((item, i) => Object.assign(errors, clientValidate(f.fields, item, rtLengths, `${key}.${i}.`)))
    }
  }
  return errors
}

function Counter({ value, max }: { value: number; max: number }) {
  return <span className="count" data-over={value > max} aria-live="polite">{value}/{max}</span>
}

function Field({ f, v, set, errors, prefix, rtLen, setRtLen, collection, all }: {
  f: FieldDef; v: Values; set: (name: string, value: unknown) => void; errors: Errors; prefix: string
  rtLen: Record<string, number>; setRtLen: (k: string, n: number) => void; collection: CollectionKey; all: Values
}) {
  const key = prefix + f.name
  const id = `f-${key.replace(/\./g, '-')}`
  const err = errors[key]
  const helpId = f.help ? `${id}-help` : undefined
  const errId = err ? `${id}-err` : undefined
  const described = [helpId, errId].filter(Boolean).join(' ') || undefined
  const val = v[f.name]
  const label = (extra?: React.ReactNode) => (
    <label htmlFor={id}><span>{f.label}{f.required && <span className="req" aria-hidden="true">*</span>}</span>{extra}</label>
  )
  const help = f.help && <p className="help" id={helpId}>{f.help}</p>
  const error = err && <p className="err" id={errId} role="alert">{err}</p>

  let control: React.ReactNode
  switch (f.type) {
    case 'text':
    case 'email':
    case 'url':
    case 'date': {
      const s = String(val ?? '')
      const type = f.type === 'text' ? (f.pattern === 'phone' ? 'tel' : 'text') : f.type
      const max = f.type === 'text' ? f.max : f.type === 'url' ? 300 : 160
      return (
        <div className="adm-field" data-error={!!err}>
          {label(f.type === 'text' && <Counter value={s.length} max={f.max} />)}
          <input className="input" id={id} type={type} value={s} maxLength={f.type === 'text' ? f.max + 20 : max} required={f.required} aria-invalid={!!err} aria-describedby={described}
            placeholder={f.type === 'url' ? (f.allowRelative ? '/contact or https://…' : 'https://…') : undefined}
            onChange={(e) => set(f.name, e.target.value)} />
          {help}{error}
        </div>
      )
    }
    case 'textarea': {
      const s = String(val ?? '')
      return (
        <div className="adm-field" data-error={!!err}>
          {label(<Counter value={s.length} max={f.max} />)}
          <textarea className="input" id={id} rows={f.rows || 4} value={s} maxLength={f.max + 50} aria-invalid={!!err} aria-describedby={described} onChange={(e) => set(f.name, e.target.value)} />
          {help}{error}
        </div>
      )
    }
    case 'richtext':
      return (
        <div className="adm-field" data-error={!!err}>
          <span className="lbl"><span>{f.label}{f.required && <span className="req">*</span>}</span><Counter value={rtLen[key] ?? String(val ?? '').replace(/<[^>]+>/g, '').length} max={f.max} /></span>
          <RichTextEditor id={id} value={String(val ?? '')} variant={f.variant} invalid={!!err} describedBy={described} onChange={(html, n) => { setRtLen(key, n); set(f.name, html) }} />
          {help}{error}
        </div>
      )
    case 'number':
      return (
        <div className="adm-field" data-error={!!err}>
          {label()}
          <div className={f.prefix ? 'prefix' : undefined}>
            {f.prefix && <span>{f.prefix}</span>}
            <input className="input" id={id} type="number" inputMode="numeric" min={f.min} max={f.max} step={f.step || 1} value={Number(val ?? 0)} aria-invalid={!!err} aria-describedby={described} onChange={(e) => set(f.name, e.target.value === '' ? 0 : Number(e.target.value))} />
          </div>
          {help}{error}
        </div>
      )
    case 'boolean':
      return (
        <div className="adm-field">
          <label className="switch" htmlFor={id} style={{ justifyContent: 'flex-start' }}>
            <input id={id} type="checkbox" role="switch" checked={Boolean(val)} aria-describedby={described} onChange={(e) => set(f.name, e.target.checked)} />
            <span>{f.label}</span>
          </label>
          {help}
        </div>
      )
    case 'select':
      return (
        <div className="adm-field" data-error={!!err}>
          {label()}
          <select className="input" id={id} value={String(val ?? '')} aria-invalid={!!err} aria-describedby={described} onChange={(e) => set(f.name, e.target.value)}>
            {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          {help}{error}
        </div>
      )
    case 'slug': {
      const s = String(val ?? '')
      const base = collection === 'treatments' ? '/treatments/' : collection === 'locations' ? '/areas/' : '/'
      return (
        <div className="adm-field" data-error={!!err}>
          {label(<Counter value={s.length} max={80} />)}
          <div className="prefix"><span>{base}</span><input className="input" id={id} value={s} maxLength={80} aria-invalid={!!err} aria-describedby={described} onChange={(e) => set(f.name, slugify(e.target.value) + (e.target.value.endsWith('-') ? '-' : ''))} onBlur={(e) => set(f.name, slugify(e.target.value))} /></div>
          {help}{error}
        </div>
      )
    }
    case 'image': {
      const aspect = f.aspect === 'slot' ? SLOT_BY_KEY[String(all.slot)]?.aspect || [4, 3] : f.aspect
      return (
        <div className="adm-field" data-error={!!err}>
          <span className="lbl"><span>{f.label}{f.required && <span className="req">*</span>}</span></span>
          <ImageField id={id} value={(val as ImageRef | null) ?? null} onChange={(img) => set(f.name, img)} aspect={aspect} invalid={!!err} altError={errors[`${key}.alt`]} />
          {help}{error}
        </div>
      )
    }
    case 'videofile':
      return <div className="adm-field" data-error={!!err}><span className="lbl">{f.label}</span><VideoFileField id={id} value={String(val ?? '')} onChange={(u) => set(f.name, u)} />{help}{error}</div>
    case 'captions':
      return <div className="adm-field"><span className="lbl">{f.label}</span><CaptionsField id={id} value={String(val ?? '')} onChange={(u) => set(f.name, u)} />{help}</div>
    case 'hours': {
      const hours = (val || {}) as Record<string, { closed: boolean; open: string; close: string }>
      const setDay = (d: string, patch: Partial<{ closed: boolean; open: string; close: string }>) => set(f.name, { ...hours, [d]: { ...hours[d], ...patch } })
      return (
        <fieldset className="adm-field" style={{ border: 0, padding: 0, margin: 0 }}>
          <legend className="lbl" style={{ marginBottom: 8 }}>{f.label}</legend>
          <div className="hours-grid">
            {DAYS.map(([d, name]) => {
              const h = hours[d] || { closed: true, open: '09:00', close: '15:00' }
              const dErr = errors[`${key}.${d}`]
              return (
                <div key={d}>
                  <div className="hours-row">
                    <strong>{name}</strong>
                    <label className="switch"><input type="checkbox" role="switch" checked={!h.closed} onChange={(e) => setDay(d, { closed: !e.target.checked })} aria-label={`${name} open`} /><span>{h.closed ? 'Closed' : 'Open'}</span></label>
                    <input className="input" type="time" value={h.open} disabled={h.closed} aria-label={`${name} opening time`} onChange={(e) => setDay(d, { open: e.target.value })} />
                    <input className="input" type="time" value={h.close} disabled={h.closed} aria-label={`${name} closing time`} onChange={(e) => setDay(d, { close: e.target.value })} />
                  </div>
                  {dErr && <p className="err">{dErr}</p>}
                </div>
              )
            })}
          </div>
          {help}
        </fieldset>
      )
    }
    case 'list': {
      const items = (val as Values[]) || []
      const blank = () => Object.fromEntries(f.fields.map((x) => [x.name, x.type === 'boolean' ? false : '']))
      return (
        <fieldset className="adm-field" style={{ border: 0, padding: 0, margin: 0 }}>
          <legend className="lbl" style={{ marginBottom: 8 }}><span>{f.label}</span><span className="count">{items.length}/{f.maxItems}</span></legend>
          {help}
          <div style={{ display: 'grid', gap: 10 }}>
            {items.map((item, i) => (
              <div className="list-item" key={i}>
                <div className="list-item-head">
                  <span>Item {i + 1}</span>
                  <span className="actions-bar">
                    <button type="button" className="btn btn-ghost btn-sm" disabled={i === 0} onClick={() => { const n = [...items]; [n[i - 1], n[i]] = [n[i], n[i - 1]]; set(f.name, n) }} aria-label="Move up">↑</button>
                    <button type="button" className="btn btn-ghost btn-sm" disabled={i === items.length - 1} onClick={() => { const n = [...items]; [n[i + 1], n[i]] = [n[i], n[i + 1]]; set(f.name, n) }} aria-label="Move down">↓</button>
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => set(f.name, items.filter((_, j) => j !== i))}>Remove</button>
                  </span>
                </div>
                {f.fields.map((sub) => (
                  <Field key={sub.name} f={sub} v={item} prefix={`${key}.${i}.`} errors={errors} rtLen={rtLen} setRtLen={setRtLen} collection={collection} all={all}
                    set={(n, value) => set(f.name, items.map((it, j) => (j === i ? { ...it, [n]: value } : it)))} />
                ))}
              </div>
            ))}
          </div>
          {items.length < f.maxItems && <div><button type="button" className="btn btn-secondary btn-sm" onClick={() => set(f.name, [...items, blank()])}>+ Add item</button></div>}
          {error}
        </fieldset>
      )
    }
  }
  return control
}

export function EntryEditor({ def: { key: collection }, id: initialId, initial, status: initialStatus, previewPath, versions, isAdmin }: {
  def: { key: CollectionKey }; id: string | null; initial: Values; status: 'live' | 'changes' | 'draft'; previewPath: string | null; versions: VersionMeta[]; isAdmin: boolean
}) {
  const def = COLLECTION_BY_KEY[collection]
  const router = useRouter()
  const show = useResultToast()
  const toast = useToast()
  const [values, setValues] = useState<Values>(initial)
  const [errors, setErrors] = useState<Errors>({})
  const [rtLen, setRtLenState] = useState<Record<string, number>>({})
  const [id, setId] = useState(initialId)
  const [dirty, setDirty] = useState(false)
  const [pending, start] = useTransition()
  const slugTouched = useRef(Boolean(initialId))
  const status = initialStatus

  useEffect(() => {
    if (!dirty) return
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault() }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])

  const slugField = def.fields.find((f) => f.type === 'slug') as Extract<FieldDef, { type: 'slug' }> | undefined
  const set = (name: string, value: unknown) => {
    setDirty(true)
    setValues((v) => {
      const next = { ...v, [name]: value }
      if (slugField && name === slugField.name) slugTouched.current = true
      if (slugField && name === slugField.from && !slugTouched.current) next[slugField.name] = slugify(String(value))
      return next
    })
    setErrors((e) => (e[name] ? Object.fromEntries(Object.entries(e).filter(([k]) => k !== name)) : e))
  }
  const setRtLen = (k: string, n: number) => setRtLenState((s) => ({ ...s, [k]: n }))

  // Auto-fetch the YouTube/Vimeo thumbnail as the poster when none is set.
  const lastVideoUrl = useRef(String(initial.url || ''))
  async function maybeFetchThumb() {
    if (collection !== 'videos' || values.source === 'upload' || values.poster) return
    const url = String(values.url || '')
    if (!url || url === lastVideoUrl.current) return
    lastVideoUrl.current = url
    const r = await fetchVideoThumbnail(url, String(values.title || ''))
    if (r.ok) set('poster', r.data)
  }

  const visibleFields = useMemo(() => def.fields.filter((f) => visible(f, values)), [def.fields, values])

  async function save(): Promise<string | null> {
    const ce = clientValidate(def.fields, values, rtLen)
    if (Object.keys(ce).length) {
      setErrors(ce)
      toast('error', 'Please fix the highlighted fields.')
      document.getElementById(`f-${Object.keys(ce)[0].split('.')[0]}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return null
    }
    const r = await saveDraft(collection, id, values)
    if (!r.ok) {
      setErrors(r.errors || {})
      show(r)
      return null
    }
    setErrors({})
    setDirty(false)
    if (!id) {
      setId(r.data.id)
      if (!def.singleton) router.replace(`/admin/content/${collection}/${r.data.id}`)
    }
    return r.data.id
  }

  const onSave = () => start(async () => { const saved = await save(); if (saved) { toast('success', 'Draft saved. The live site has not changed.'); router.refresh() } })
  const onPublish = async () => {
    const saved = dirty || !id ? await save() : id
    if (!saved) return
    const r = await publishEntry(collection, saved)
    if (!r.ok && r.errors) setErrors(r.errors)
    if (show(r)) { setDirty(false); router.refresh() }
  }
  const onPreview = () => start(async () => {
    const saved = dirty || !id ? await save() : id
    if (!saved) return
    router.refresh()
    const path = previewPath || '/'
    window.open(`/api/preview?path=${encodeURIComponent(path.split('#')[0])}`, '_blank', 'noopener')
  })

  const title = String(values[def.titleField] || '') || `New ${def.singular.toLowerCase()}`
  const statusBadge = status === 'live' ? <span className="badge badge-live">Published</span> : status === 'changes' ? <span className="badge badge-changes">Unpublished changes</span> : <span className="badge badge-draft">Draft (not live)</span>

  return (
    <>
      <div className="adm-head">
        <div style={{ minWidth: 0 }}>
          {!def.singleton && <p style={{ margin: '0 0 6px', fontSize: 14 }}><Link href={`/admin/content/${collection}`}>← {def.label}</Link></p>}
          <h1 style={{ overflowWrap: 'anywhere' }}>{def.singleton ? def.label : title}</h1>
          <p className="lead" style={{ marginBottom: 0 }}>{def.description}</p>
        </div>
      </div>
      <div className="form-layout">
        <form className="adm-card adm-form" onSubmit={(e) => { e.preventDefault(); onSave() }} onBlur={() => { void maybeFetchThumb() }} noValidate>
          {collection === 'media' && values.slot ? <p className="notice" style={{ margin: 0 }}>{SLOT_BY_KEY[String(values.slot)]?.help}</p> : null}
          {errors._form && <p className="notice error">{errors._form}</p>}
          {visibleFields.map((f) => (
            <Field key={f.name} f={f} v={values} set={set} errors={errors} prefix="" rtLen={rtLen} setRtLen={setRtLen} collection={collection} all={values} />
          ))}
        </form>

        <aside className="form-side">
          <div className="adm-card" style={{ display: 'grid', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}><strong>Status</strong>{statusBadge}</div>
            {dirty && <p className="notice" style={{ margin: 0 }}>You have unsaved changes.</p>}
            <div className="actions-bar">
              <button type="button" className="btn btn-secondary" disabled={pending} onClick={onSave}>{pending ? 'Saving…' : 'Save draft'}</button>
              {previewPath !== null || def.singleton ? <button type="button" className="btn btn-secondary" disabled={pending} onClick={onPreview}>Preview</button> : null}
            </div>
            <ConfirmButton className="btn btn-primary" label="Publish" title="Publish to the live site?" confirmLabel="Publish now" disabled={pending}
              body={<p style={{ margin: 0 }}>This saves your changes and updates the live website immediately.</p>} onConfirm={onPublish} />
            <p className="muted" style={{ fontSize: 13, margin: 0 }}>Saving a draft never changes the live site. Preview shows the draft on the real page, only to you.</p>
          </div>

          {id && !def.singleton && (
            <div className="adm-card" style={{ display: 'grid', gap: 10 }}>
              <strong>More actions</strong>
              {status === 'changes' && (
                <ConfirmButton label="Discard unpublished changes" title="Discard your changes?" confirmLabel="Discard changes" danger
                  body={<p style={{ margin: 0 }}>The draft will be thrown away and the editor will show the published version again. (It stays in version history.)</p>}
                  onConfirm={async () => { if (show(await discardDraft(collection, id))) { setDirty(false); window.location.reload() } }} />
              )}
              {status !== 'draft' && (
                <ConfirmButton label="Unpublish" title="Take this off the live site?" confirmLabel="Unpublish"
                  body={<p style={{ margin: 0 }}>It will disappear from the website straight away but stay here as a draft.</p>}
                  onConfirm={async () => { if (show(await unpublishEntry(collection, id))) router.refresh() }} />
              )}
              <ConfirmButton label="Delete" title="Move to the bin?" confirmLabel="Move to bin" danger
                body={<p style={{ margin: 0 }}>It will be removed from the live site. You can restore it from the Bin for 30 days{isAdmin ? '' : '; only an admin can delete it permanently'}.</p>}
                onConfirm={async () => { if (show(await deleteEntry(collection, id))) { setDirty(false); router.push(`/admin/content/${collection}`) } }} />
            </div>
          )}

          {id && versions.length > 0 && (
            <div className="adm-card">
              <strong>Version history</strong>
              <ul style={{ listStyle: 'none', padding: 0, margin: '10px 0 0', display: 'grid', gap: 8, maxHeight: 340, overflowY: 'auto' }}>
                {versions.map((v, i) => (
                  <li key={v.id} style={{ fontSize: 13, borderTop: i ? '1px solid var(--color-divider)' : 0, paddingTop: i ? 8 : 0 }}>
                    <div><strong>{v.kind === 'published' ? 'Published' : 'Draft saved'}</strong> · {fmt(v.createdAt)}</div>
                    <div className="muted">{v.by}</div>
                    {i > 0 && (
                      <div className="actions-bar" style={{ marginTop: 6 }}>
                        <ConfirmButton className="btn btn-secondary btn-sm" label="Restore as draft" title="Restore this version?" confirmLabel="Restore as draft"
                          body={<p style={{ margin: 0 }}>The version from {fmt(v.createdAt)} becomes your draft. The live site won&apos;t change until you publish.</p>}
                          onConfirm={async () => { if (show(await restoreVersion(collection, id, v.id))) window.location.reload() }} />
                        <ConfirmButton className="btn btn-primary btn-sm" label="Restore & publish" title="Restore and publish this version?" confirmLabel="Restore & publish"
                          body={<p style={{ margin: 0 }}>The version from {fmt(v.createdAt)} will go live immediately.</p>}
                          onConfirm={async () => { if (show(await restoreAndPublishVersion(collection, id, v.id))) window.location.reload() }} />
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </>
  )
}
