'use client'

import { closestCenter, DndContext, KeyboardSensor, PointerSensor, TouchSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import Link from 'next/link'
import { useMemo, useState, useTransition } from 'react'
import { reorderEntries } from '@/app/admin/actions/content'
import type { EntryStatus } from '@/lib/admin/queries'
import { useResultToast } from './Toast'

export type ListRow = { id: string; title: string; subtitle: string; status: EntryStatus; thumb: string | null }

const BADGE: Record<EntryStatus, [string, string]> = { live: ['badge-live', 'Published'], changes: ['badge-changes', 'Unpublished changes'], draft: ['badge-draft', 'Draft'] }

function Row({ row, collection, draggable }: { row: ListRow; collection: string; draggable: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: row.id, disabled: !draggable })
  const [cls, label] = BADGE[row.status]
  return (
    <li ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} data-dragging={isDragging}>
      {draggable && <button type="button" className="drag" aria-label={`Drag to reorder ${row.title}`} {...attributes} {...listeners}>⋮⋮</button>}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {row.thumb && <img className="thumb" src={row.thumb} alt="" />}
      <span className="t">
        <Link href={`/admin/content/${collection}/${row.id}`}>{row.title}</Link>
        {row.subtitle && <small>{row.subtitle}</small>}
      </span>
      <span className={`badge ${cls}`}>{label}</span>
      <Link className="btn btn-secondary btn-sm" href={`/admin/content/${collection}/${row.id}`}>Edit</Link>
    </li>
  )
}

export function EntryList({ collection, rows: initial, sortable }: { collection: string; rows: ListRow[]; sortable: boolean }) {
  const [rows, setRows] = useState(initial)
  const [q, setQ] = useState('')
  const [pending, start] = useTransition()
  const show = useResultToast()
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )
  const filtered = useMemo(() => (q ? rows.filter((r) => (r.title + ' ' + r.subtitle).toLowerCase().includes(q.toLowerCase())) : rows), [rows, q])
  const draggable = sortable && !q

  function onDragEnd(e: DragEndEvent) {
    if (!e.over || e.active.id === e.over.id) return
    const from = rows.findIndex((r) => r.id === e.active.id)
    const to = rows.findIndex((r) => r.id === e.over!.id)
    const next = arrayMove(rows, from, to)
    const previous = rows
    setRows(next)
    start(async () => {
      const r = await reorderEntries(collection, next.map((x) => x.id))
      if (!show(r)) setRows(previous)
    })
  }

  return (
    <>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 12 }}>
        {rows.length > 8 && <input className="input" style={{ maxWidth: 320 }} type="search" placeholder="Filter…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Filter list" />}
        {sortable && <span className="muted" style={{ fontSize: 13 }}>{q ? 'Clear the filter to reorder.' : 'Drag ⋮⋮ to reorder. Order changes go live straight away.'}{pending ? ' Saving…' : ''}</span>}
      </div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={filtered.map((r) => r.id)} strategy={verticalListSortingStrategy}>
          <ul className="sortable">
            {filtered.map((r) => <Row key={r.id} row={r} collection={collection} draggable={draggable} />)}
          </ul>
        </SortableContext>
      </DndContext>
    </>
  )
}
