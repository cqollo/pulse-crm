'use client'
import { useState } from 'react'
import { useCRM } from '@/store'
import { Bell, Activity, Check, Trash2, Plus, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Reminder } from '@/lib/types'

type Tab = 'reminders' | 'activity'

export function InboxView() {
  const [tab, setTab] = useState<Tab>('reminders')
  const { reminders, activity, contacts, deals, toggleReminder, deleteReminder, addReminder } = useCRM()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ entityType: 'contact' as 'contact' | 'deal', entityId: '', note: '', dueDate: '' })

  const today = new Date().toISOString().slice(0, 10)
  const overdue  = reminders.filter(r => !r.done && r.dueDate < today)
  const upcoming = reminders.filter(r => !r.done && r.dueDate >= today).sort((a, b) => a.dueDate.localeCompare(b.dueDate))
  const done     = reminders.filter(r => r.done)

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

  const inputCls = 'h-9 px-3 text-[13px] rounded-lg border border-[var(--border)] bg-[var(--surface-1)] outline-none focus:border-accent text-[var(--ink)] w-full'

  return (
    <div className="max-w-2xl flex flex-col gap-5">
      {/* Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-[var(--surface-1)] p-1 rounded-xl">
          <button onClick={() => setTab('reminders')}
            className={cn('flex items-center gap-1.5 h-8 px-3 rounded-lg text-[13px] transition-all',
              tab === 'reminders' ? 'bg-[var(--surface-0)] text-[var(--ink)] shadow-sm font-medium' : 'text-[var(--ink-3)]'
            )}>
            <Bell size={13} /> Tasks
            {(overdue.length > 0) && <span className="w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">{overdue.length}</span>}
          </button>
          <button onClick={() => setTab('activity')}
            className={cn('flex items-center gap-1.5 h-8 px-3 rounded-lg text-[13px] transition-all',
              tab === 'activity' ? 'bg-[var(--surface-0)] text-[var(--ink)] shadow-sm font-medium' : 'text-[var(--ink-3)]'
            )}>
            <Activity size={13} /> Activity
          </button>
        </div>
        {tab === 'reminders' && (
          <button onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 h-8 px-3 bg-accent text-accent-fg rounded-lg text-[13px] font-medium hover:opacity-85">
            <Plus size={13} /> New Task
          </button>
        )}
      </div>

      {/* New reminder form */}
      {tab === 'reminders' && showForm && (
        <div className="bg-[var(--surface-0)] border border-[var(--border-subtle)] rounded-xl p-5 flex flex-col gap-3 animate-fade-up">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium text-[var(--ink-2)]">Type</label>
              <select className={inputCls} value={form.entityType}
                onChange={e => setForm(f => ({ ...f, entityType: e.target.value as 'contact' | 'deal', entityId: '' }))}>
                <option value="contact">Contact</option>
                <option value="deal">Deal</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium text-[var(--ink-2)]">Due date</label>
              <input type="date" className={inputCls} value={form.dueDate} min={today}
                onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-[var(--ink-2)]">{form.entityType === 'contact' ? 'Contact' : 'Deal'}</label>
            <select className={inputCls} value={form.entityId} onChange={e => setForm(f => ({ ...f, entityId: e.target.value }))}>
              <option value="">Select…</option>
              {entityOptions.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-[var(--ink-2)]">Note</label>
            <input className={inputCls} placeholder="e.g. Send proposal follow-up" value={form.note}
              onChange={e => setForm(f => ({ ...f, note: e.target.value }))} />
          </div>
          <div className="flex gap-2">
            <button onClick={submit} className="h-8 px-4 bg-accent text-accent-fg rounded-lg text-[13px] font-medium hover:opacity-85">Set reminder</button>
            <button onClick={() => setShowForm(false)} className="h-8 px-3 border border-[var(--border)] rounded-lg text-[13px] text-[var(--ink-2)]">Cancel</button>
          </div>
        </div>
      )}

      {/* Reminders */}
      {tab === 'reminders' && (
        <div className="flex flex-col gap-4">
          {overdue.length > 0 && <Section title="Overdue" icon={<AlertCircle size={13} className="text-red-500" />}>
            {overdue.map(r => <ReminderRow key={r.id} r={r} overdue onToggle={() => toggleReminder(r.id)} onDelete={() => deleteReminder(r.id)} />)}
          </Section>}
          {upcoming.length > 0 && <Section title="Upcoming" icon={<Bell size={13} className="text-[var(--ink-3)]" />}>
            {upcoming.map(r => <ReminderRow key={r.id} r={r} onToggle={() => toggleReminder(r.id)} onDelete={() => deleteReminder(r.id)} />)}
          </Section>}
          {done.length > 0 && <Section title="Completed" icon={<Check size={13} className="text-green-500" />}>
            {done.map(r => <ReminderRow key={r.id} r={r} done onToggle={() => toggleReminder(r.id)} onDelete={() => deleteReminder(r.id)} />)}
          </Section>}
          {reminders.length === 0 && !showForm && (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[var(--surface-1)] border border-[var(--border-subtle)] flex items-center justify-center">
                <Bell size={20} className="text-[var(--ink-3)]" />
              </div>
              <p className="text-[14px] font-medium">No reminders yet</p>
              <p className="text-[12px] text-[var(--ink-3)]">Set follow-up reminders on contacts and deals.</p>
            </div>
          )}
        </div>
      )}

      {/* Activity */}
      {tab === 'activity' && (
        <div>
          {activity.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[var(--surface-1)] border border-[var(--border-subtle)] flex items-center justify-center">
                <Activity size={20} className="text-[var(--ink-3)]" />
              </div>
              <p className="text-[14px] font-medium">No activity yet</p>
            </div>
          ) : (
            <div className="bg-[var(--surface-0)] border border-[var(--border-subtle)] rounded-xl divide-y divide-[var(--border-subtle)]">
              {activity.map(a => (
                <div key={a.id} className="flex items-start gap-3 p-4">
                  <div className="w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: a.color }} />
                  <div className="flex-1">
                    <p className="text-[13px] text-[var(--ink-2)]">{a.text}</p>
                    <p className="text-[11px] text-[var(--ink-3)] mt-0.5">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-[11px] font-medium uppercase tracking-wide text-[var(--ink-3)]">{title}</span>
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
          done ? 'bg-green-500 border-green-500' : overdue ? 'border-red-400' : 'border-[var(--border)] hover:border-accent'
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
        <button onClick={onDelete} aria-label="Delete" className="text-[var(--ink-3)] hover:text-red-600 transition-colors">
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  )
}
