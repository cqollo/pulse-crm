'use client'
import { useState } from 'react'
import { useCRM } from '@/store'
import { Bell, Check, Trash2, Plus, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Reminder } from '@/lib/types'

export function RemindersView() {
  const { reminders, contacts, deals, toggleReminder, deleteReminder, addReminder } = useCRM()
  const [form, setForm] = useState({ entityType: 'contact' as 'contact' | 'deal', entityId: '', note: '', dueDate: '' })
  const [showForm, setShowForm] = useState(false)

  const today = new Date().toISOString().slice(0, 10)
  const overdue = reminders.filter(r => !r.done && r.dueDate < today)
  const upcoming = reminders.filter(r => !r.done && r.dueDate >= today).sort((a, b) => a.dueDate.localeCompare(b.dueDate))
  const done = reminders.filter(r => r.done)

  const entityOptions = form.entityType === 'contact'
    ? contacts.map(c => ({ id: c.id, label: `${c.fname} ${c.lname} — ${c.company}` }))
    : deals.map(d => ({ id: d.id, label: `${d.title} — ${d.company}` }))

  const submit = () => {
    if (!form.entityId || !form.note || !form.dueDate) return
    const entity = form.entityType === 'contact'
      ? contacts.find(c => c.id === form.entityId)
      : deals.find(d => d.id === form.entityId)
    const entityName = form.entityType === 'contact'
      ? `${(entity as typeof contacts[0])?.fname} ${(entity as typeof contacts[0])?.lname}`
      : (entity as typeof deals[0])?.title || ''
    addReminder({ entityType: form.entityType, entityId: form.entityId, entityName, note: form.note, dueDate: form.dueDate })
    setForm({ entityType: 'contact', entityId: '', note: '', dueDate: '' })
    setShowForm(false)
  }

  return (
    <div className="max-w-2xl flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[15px] font-semibold mb-1">Follow-up reminders</h2>
          <p className="text-[13px] text-[var(--ink-3)]">Never miss a follow-up. Set reminders on contacts and deals.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 h-8 px-3 bg-accent text-accent-fg rounded-lg text-[13px] font-medium hover:opacity-85 transition-opacity">
          <Plus size={14} /> New reminder
        </button>
      </div>

      {/* New reminder form */}
      {showForm && (
        <div className="bg-[var(--surface-0)] border border-[var(--border-subtle)] rounded-xl p-5 flex flex-col gap-3 animate-fade-up">
          <h3 className="text-[13px] font-medium">New reminder</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium text-[var(--ink-2)]">Type</label>
              <select className="h-9 px-3 text-[13px] rounded-lg border border-[var(--border)] bg-[var(--surface-1)] outline-none focus:border-accent"
                value={form.entityType} onChange={e => setForm(f => ({ ...f, entityType: e.target.value as 'contact' | 'deal', entityId: '' }))}>
                <option value="contact">Contact</option>
                <option value="deal">Deal</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium text-[var(--ink-2)]">Due date</label>
              <input type="date" className="h-9 px-3 text-[13px] rounded-lg border border-[var(--border)] bg-[var(--surface-1)] outline-none focus:border-accent"
                value={form.dueDate} min={today} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-[var(--ink-2)]">{form.entityType === 'contact' ? 'Contact' : 'Deal'}</label>
            <select className="h-9 px-3 text-[13px] rounded-lg border border-[var(--border)] bg-[var(--surface-1)] outline-none focus:border-accent"
              value={form.entityId} onChange={e => setForm(f => ({ ...f, entityId: e.target.value }))}>
              <option value="">Select {form.entityType}…</option>
              {entityOptions.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-[var(--ink-2)]">Note</label>
            <input className="h-9 px-3 text-[13px] rounded-lg border border-[var(--border)] bg-[var(--surface-1)] outline-none focus:border-accent"
              placeholder="e.g. Send proposal follow-up" value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} />
          </div>
          <div className="flex gap-2">
            <button onClick={submit} className="h-8 px-4 bg-accent text-accent-fg rounded-lg text-[13px] font-medium hover:opacity-85">Set reminder</button>
            <button onClick={() => setShowForm(false)} className="h-8 px-3 border border-[var(--border)] rounded-lg text-[13px] text-[var(--ink-2)] hover:border-[var(--ink-3)]">Cancel</button>
          </div>
        </div>
      )}

      {/* Overdue */}
      {overdue.length > 0 && (
        <Section title="Overdue" icon={<AlertCircle size={14} className="text-red-500" />} count={overdue.length}>
          {overdue.map(r => <ReminderRow key={r.id} r={r} overdue onToggle={() => toggleReminder(r.id)} onDelete={() => deleteReminder(r.id)} />)}
        </Section>
      )}

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <Section title="Upcoming" icon={<Bell size={14} className="text-[var(--ink-3)]" />} count={upcoming.length}>
          {upcoming.map(r => <ReminderRow key={r.id} r={r} onToggle={() => toggleReminder(r.id)} onDelete={() => deleteReminder(r.id)} />)}
        </Section>
      )}

      {/* Done */}
      {done.length > 0 && (
        <Section title="Completed" icon={<Check size={14} className="text-green-500" />} count={done.length}>
          {done.map(r => <ReminderRow key={r.id} r={r} done onToggle={() => toggleReminder(r.id)} onDelete={() => deleteReminder(r.id)} />)}
        </Section>
      )}

      {reminders.length === 0 && !showForm && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <div className="w-12 h-12 rounded-2xl bg-[var(--surface-1)] border border-[var(--border-subtle)] flex items-center justify-center">
            <Bell size={20} className="text-[var(--ink-3)]" />
          </div>
          <p className="text-[14px] font-medium">No reminders yet</p>
          <p className="text-[12px] text-[var(--ink-3)]">Set follow-up reminders on contacts and deals to stay on top of your pipeline.</p>
        </div>
      )}
    </div>
  )
}

function Section({ title, icon, count, children }: { title: string; icon: React.ReactNode; count: number; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-[12px] font-medium uppercase tracking-wide text-[var(--ink-3)]">{title}</span>
        <span className="text-[11px] text-[var(--ink-3)]">({count})</span>
      </div>
      <div className="flex flex-col gap-1.5">{children}</div>
    </div>
  )
}

function ReminderRow({ r, done, overdue, onToggle, onDelete }: { r: Reminder; done?: boolean; overdue?: boolean; onToggle: () => void; onDelete: () => void }) {
  const dueLabel = new Date(r.dueDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return (
    <div className={cn('flex items-center gap-3 p-3 bg-[var(--surface-0)] border rounded-xl transition-all',
      overdue ? 'border-red-200 bg-red-50/30' : 'border-[var(--border-subtle)]',
      done && 'opacity-50'
    )}>
      <button onClick={onToggle} aria-label={done ? 'Mark incomplete' : 'Mark complete'}
        className={cn('w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all',
          done ? 'bg-green-500 border-green-500' : overdue ? 'border-red-400 hover:border-red-500' : 'border-[var(--border)] hover:border-accent'
        )}>
        {done && <Check size={10} className="text-white" />}
      </button>
      <div className="flex-1 min-w-0">
        <p className={cn('text-[13px]', done && 'line-through')}>{r.note}</p>
        <p className="text-[11px] text-[var(--ink-3)]">{r.entityName} · {r.entityType}</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className={cn('text-[11px] font-medium px-2 py-0.5 rounded',
          overdue ? 'bg-red-100 text-red-700' : 'bg-[var(--surface-1)] text-[var(--ink-3)]'
        )}>{dueLabel}</span>
        <button onClick={onDelete} aria-label="Delete reminder" className="text-[var(--ink-3)] hover:text-red-600 transition-colors">
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  )
}
