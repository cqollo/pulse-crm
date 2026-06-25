'use client'
import { useState } from 'react'
import { useCRM } from '@/store'
import { Zap, Plus, Trash2, ToggleLeft, ToggleRight, Play } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AutoTrigger, AutoAction } from '@/lib/types'

const TRIGGERS: { value: AutoTrigger; label: string }[] = [
  { value: 'contact_created',       label: 'Contact is created' },
  { value: 'contact_status_changed', label: 'Contact status changes' },
  { value: 'deal_created',          label: 'Deal is created' },
  { value: 'deal_stage_changed',    label: 'Deal stage changes' },
]

const ACTIONS: { value: AutoAction; label: string }[] = [
  { value: 'assign_to_me',    label: 'Assign to me' },
  { value: 'add_tag',         label: 'Add a tag' },
  { value: 'create_reminder', label: 'Create a follow-up reminder' },
  { value: 'send_webhook',    label: 'Send webhook' },
]

const TRIGGER_VALUES: Record<string, string[]> = {
  contact_status_changed: ['hot', 'warm', 'cold', 'customer'],
  deal_stage_changed:     ['Lead', 'Qualified', 'Proposal', 'Negotiation'],
}

export function AutomationsView() {
  const { automations, addAutomation, toggleAutomation, deleteAutomation } = useCRM()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    name: '', trigger: 'contact_created' as AutoTrigger,
    triggerValue: '', action: 'assign_to_me' as AutoAction, actionValue: '',
  })

  const triggerVals = TRIGGER_VALUES[form.trigger]
  const needsActionValue = ['add_tag', 'send_webhook', 'create_reminder'].includes(form.action)

  const submit = () => {
    if (!form.name.trim()) return
    addAutomation({
      name: form.name,
      enabled: true,
      trigger: form.trigger,
      triggerValue: form.triggerValue || undefined,
      action: form.action,
      actionValue: form.actionValue || undefined,
    })
    setForm({ name: '', trigger: 'contact_created', triggerValue: '', action: 'assign_to_me', actionValue: '' })
    setShowForm(false)
  }

  return (
    <div className="max-w-2xl flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[15px] font-semibold mb-1">Automations</h2>
          <p className="text-[13px] text-[var(--ink-3)]">Build rules that trigger automatically when things happen in your CRM.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 h-8 px-3 bg-accent text-accent-fg rounded-lg text-[13px] font-medium hover:opacity-85 transition-opacity"
        >
          <Plus size={14} /> New rule
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-[var(--surface-0)] border border-[var(--border-subtle)] rounded-xl p-5 flex flex-col gap-4 animate-fade-up">
          <h3 className="text-[13px] font-medium">New automation rule</h3>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-[var(--ink-2)]">Rule name</label>
            <input
              className="h-9 px-3 text-[13px] rounded-lg border border-[var(--border)] bg-[var(--surface-1)] outline-none focus:border-accent"
              placeholder="e.g. Auto-assign hot leads to me"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            />
          </div>

          {/* WHEN */}
          <div className="bg-[var(--surface-1)] rounded-xl p-4 flex flex-col gap-3">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--ink-3)]">When…</div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-medium text-[var(--ink-2)]">Trigger</label>
                <select
                  className="h-9 px-3 text-[13px] rounded-lg border border-[var(--border)] bg-[var(--surface-0)] outline-none focus:border-accent"
                  value={form.trigger}
                  onChange={e => setForm(f => ({ ...f, trigger: e.target.value as AutoTrigger, triggerValue: '' }))}
                >
                  {TRIGGERS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              {triggerVals && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-medium text-[var(--ink-2)]">Value</label>
                  <select
                    className="h-9 px-3 text-[13px] rounded-lg border border-[var(--border)] bg-[var(--surface-0)] outline-none focus:border-accent"
                    value={form.triggerValue}
                    onChange={e => setForm(f => ({ ...f, triggerValue: e.target.value }))}
                  >
                    <option value="">Any</option>
                    {triggerVals.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* THEN */}
          <div className="bg-[var(--surface-1)] rounded-xl p-4 flex flex-col gap-3">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--ink-3)]">Then…</div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-medium text-[var(--ink-2)]">Action</label>
                <select
                  className="h-9 px-3 text-[13px] rounded-lg border border-[var(--border)] bg-[var(--surface-0)] outline-none focus:border-accent"
                  value={form.action}
                  onChange={e => setForm(f => ({ ...f, action: e.target.value as AutoAction, actionValue: '' }))}
                >
                  {ACTIONS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                </select>
              </div>
              {needsActionValue && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-medium text-[var(--ink-2)]">
                    {form.action === 'add_tag' ? 'Tag name' : form.action === 'send_webhook' ? 'Webhook URL' : 'Reminder note'}
                  </label>
                  <input
                    className="h-9 px-3 text-[13px] rounded-lg border border-[var(--border)] bg-[var(--surface-0)] outline-none focus:border-accent"
                    placeholder={form.action === 'add_tag' ? 'VIP' : form.action === 'send_webhook' ? 'https://…' : 'Follow up'}
                    value={form.actionValue}
                    onChange={e => setForm(f => ({ ...f, actionValue: e.target.value }))}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={submit} className="h-8 px-4 bg-accent text-accent-fg rounded-lg text-[13px] font-medium hover:opacity-85">
              Create rule
            </button>
            <button onClick={() => setShowForm(false)} className="h-8 px-3 border border-[var(--border)] rounded-lg text-[13px] text-[var(--ink-2)] hover:border-[var(--ink-3)]">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Rules list */}
      {automations.length === 0 && !showForm ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <div className="w-12 h-12 rounded-2xl bg-[var(--surface-1)] border border-[var(--border-subtle)] flex items-center justify-center">
            <Zap size={20} className="text-[var(--ink-3)]" />
          </div>
          <p className="text-[14px] font-medium">No automation rules yet</p>
          <p className="text-[12px] text-[var(--ink-3)]">Create rules to automatically tag contacts, assign deals, send webhooks, and more.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {automations.map(rule => {
            const trigger = TRIGGERS.find(t => t.value === rule.trigger)
            const action = ACTIONS.find(a => a.value === rule.action)
            return (
              <div key={rule.id} className="bg-[var(--surface-0)] border border-[var(--border-subtle)] rounded-xl p-4 flex items-center gap-4">
                <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                  rule.enabled ? 'bg-accent/10 text-accent' : 'bg-[var(--surface-1)] text-[var(--ink-3)]'
                )}>
                  <Zap size={15} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium mb-0.5">{rule.name}</div>
                  <div className="text-[11px] text-[var(--ink-3)]">
                    {trigger?.label}{rule.triggerValue ? ` → ${rule.triggerValue}` : ''} · {action?.label}{rule.actionValue ? `: ${rule.actionValue}` : ''}
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="flex items-center gap-1 text-[11px] text-[var(--ink-3)]">
                    <Play size={11} /> {rule.runCount} runs
                  </div>
                  <button
                    onClick={() => toggleAutomation(rule.id)}
                    aria-label={rule.enabled ? 'Disable rule' : 'Enable rule'}
                    className={cn('transition-colors', rule.enabled ? 'text-accent' : 'text-[var(--ink-3)]')}
                  >
                    {rule.enabled ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                  </button>
                  <button onClick={() => deleteAutomation(rule.id)} aria-label="Delete rule"
                    className="text-[var(--ink-3)] hover:text-red-600 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
