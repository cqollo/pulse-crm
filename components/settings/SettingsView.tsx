'use client'
import { useState, useEffect } from 'react'
import { useCRM } from '@/store'
import { createClient } from '@/lib/supabase/client'
import { THEMES, applyTheme } from '@/lib/themes'
import { Trash2, Plus, Copy, Eye, EyeOff, Globe, Key, Sliders, Palette, User, Users, Zap, Keyboard, CreditCard, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { FieldType } from '@/lib/types'

type Tab = 'profile' | 'team' | 'automations' | 'shortcuts' | 'billing'

const TABS: { id: Tab; icon: React.ReactNode; label: string }[] = [
  { id: 'profile',     icon: <User size={15} />,     label: 'My profile' },
  { id: 'team',        icon: <Users size={15} />,    label: 'Team members' },
  { id: 'automations', icon: <Zap size={15} />,      label: 'Automations' },
  { id: 'shortcuts',   icon: <Keyboard size={15} />, label: 'Keyboard shortcuts' },
  { id: 'billing',     icon: <CreditCard size={15} />, label: 'Billing' },
]

const SHORTCUTS = [
  { keys: ['C'], desc: 'New contact' },
  { keys: ['D'], desc: 'New deal' },
  { keys: ['N'], desc: 'Open notepad' },
  { keys: ['/', '⌘K'], desc: 'Focus search' },
  { keys: ['?'], desc: 'Keyboard shortcuts' },
  { keys: ['Esc'], desc: 'Close panel / modal' },
  { keys: ['G', '1'], desc: 'Go to Dashboard' },
  { keys: ['G', '2'], desc: 'Go to Contacts' },
  { keys: ['G', '3'], desc: 'Go to Pipeline' },
  { keys: ['G', '4'], desc: 'Go to Inbox' },
]

export function SettingsView() {
  const [tab, setTab] = useState<Tab>('profile')

  return (
    <div className="flex gap-6 min-h-[600px]">
      {/* Left nav — 1/4 width */}
      <aside className="w-52 flex-shrink-0">
        <div className="bg-[var(--surface-0)] border border-[var(--border-subtle)] rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--border-subtle)]">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--ink-3)]">Settings</p>
          </div>
          <nav className="p-2 flex flex-col gap-0.5">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={cn(
                  'flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-[13px] text-left transition-all',
                  tab === t.id
                    ? 'bg-accent text-accent-fg font-medium'
                    : 'text-[var(--ink-2)] hover:bg-[var(--surface-1)]'
                )}>
                {t.icon} {t.label}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Right workspace — 3/4 width */}
      <div className="flex-1 min-w-0">
        <div className="bg-[var(--surface-0)] border border-[var(--border-subtle)] rounded-xl p-6">
          {tab === 'profile'     && <ProfilePanel />}
          {tab === 'team'        && <TeamPanel />}
          {tab === 'automations' && <AutomationsPanel />}
          {tab === 'shortcuts'   && <ShortcutsPanel />}
          {tab === 'billing'     && <BillingPanel />}
        </div>
      </div>
    </div>
  )
}

// ─── Profile ──────────────────────────────────────────────────────────────────

function ProfilePanel() {
  const { themeId, setTheme } = useCRM()
  const [name, setName]           = useState('')
  const [email, setEmail]         = useState('')
  const [saved, setSaved]         = useState(false)
  const [pwMsg, setPwMsg]         = useState('')
  const supabase                  = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      setName(user.user_metadata?.full_name || '')
      setEmail(user.email || '')
    })
  }, [])

  const save = async () => {
    await supabase.auth.updateUser({ data: { full_name: name } })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const resetPassword = async () => {
    if (!email) return
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    })
    setPwMsg('Reset link sent — check your email.')
  }

  const applyT = (id: typeof themeId) => {
    setTheme(id)
    applyTheme(THEMES.find(t => t.id === id)!)
  }

  return (
    <div className="flex flex-col gap-6 max-w-md">
      <div>
        <h2 className="text-[16px] font-semibold mb-0.5">My profile</h2>
        <p className="text-[13px] text-[var(--ink-3)]">Manage your personal details and preferences.</p>
      </div>

      <Field label="Full name">
        <input className={inputCls} value={name} onChange={e => setName(e.target.value)} placeholder="Jane Smith" />
      </Field>
      <Field label="Email address">        
        <input className={cn(inputCls, 'opacity-60 cursor-not-allowed')} value={email} readOnly disabled />
        <p className="text-[11px] text-[var(--ink-3)] mt-1">Email cannot be changed here. Contact support.</p>
      </Field>

      {/* Theme picker */}
      <div>
        <p className="text-[12px] font-medium text-[var(--ink-2)] mb-2">Theme</p>
        <div className="grid grid-cols-3 gap-2">
          {THEMES.map(t => (
            <button key={t.id} onClick={() => applyT(t.id)} aria-pressed={themeId === t.id}
              className={cn('rounded-xl p-2.5 border-2 text-left transition-all hover:scale-[1.02]', themeId === t.id ? 'border-accent' : 'border-[var(--border-subtle)]')}
              style={{ background: t.surface1 }}>
              {/* Mini preview */}
              <div className="rounded-lg overflow-hidden mb-1.5 border" style={{ borderColor: t.border }}>
                <div className="h-4 flex items-center px-1.5 gap-1" style={{ background: t.surface0 }}>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: t.accent }} />
                  <div className="h-1 rounded flex-1" style={{ background: t.surface2 }} />
                </div>
                <div className="h-6 flex gap-1 p-1" style={{ background: t.surface1 }}>
                  <div className="w-3 rounded" style={{ background: t.accent, opacity: 0.8 }} />
                  <div className="flex-1 rounded" style={{ background: t.surface2 }} />
                </div>
              </div>
              <div className="text-[11px] font-medium" style={{ color: t.ink }}>{t.name}</div>
              {themeId === t.id && <div className="text-[10px]" style={{ color: t.accent }}>Active</div>}
            </button>
          ))}
        </div>
      </div>

      {/* Password reset */}
      <div className="pt-2 border-t border-[var(--border-subtle)]">
        <p className="text-[12px] font-medium text-[var(--ink-2)] mb-2">Password</p>
        {pwMsg
          ? <p className="text-[13px] text-green-600 bg-green-50 border border-green-200 rounded-lg px-3 py-2">{pwMsg}</p>
          : <button onClick={resetPassword} className="text-[13px] text-[var(--ink-2)] underline underline-offset-2 hover:text-[var(--ink)]">Send password reset email</button>
        }
      </div>

      {/* One save button */}
      <div className="flex justify-end pt-2 border-t border-[var(--border-subtle)]">
        <button onClick={save}
          className="flex items-center gap-2 h-9 px-5 bg-accent text-accent-fg rounded-lg text-[13px] font-medium hover:opacity-85 transition-opacity">
          {saved ? <><Check size={14} /> Saved</> : 'Save changes'}
        </button>
      </div>
    </div>
  )
}

// ─── Team ─────────────────────────────────────────────────────────────────────

function TeamPanel() {
  const { team, deals, contacts, removeTeamMember } = useCRM()
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('Sales Rep')
  const [inviting, setInviting] = useState(false)
  const [inviteMsg, setInviteMsg] = useState('')
  const supabase = createClient()

  const invite = async () => {
    if (!inviteEmail.trim()) return
    setInviting(true)
    try {
      // Supabase invite by email (admin endpoint)
      const res = await fetch('/api/team/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      })
      if (res.ok) {
        setInviteMsg(`Invite sent to ${inviteEmail}`)
        setInviteEmail(''); setInviteRole('Sales Rep')
        setTimeout(() => { setInviteMsg(''); setInviteOpen(false) }, 2500)
      } else {
        setInviteMsg('Failed to send invite. Check your setup.')
      }
    } catch {
      setInviteMsg('Error sending invite.')
    }
    setInviting(false)
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[16px] font-semibold mb-0.5">Team members</h2>
          <p className="text-[13px] text-[var(--ink-3)]">{team.length} member{team.length !== 1 ? 's' : ''} in this workspace.</p>
        </div>
        <button onClick={() => setInviteOpen(true)}
          className="flex items-center gap-1.5 h-8 px-4 bg-accent text-accent-fg rounded-lg text-[13px] font-medium hover:opacity-85">
          <Plus size={13} /> Invite member
        </button>
      </div>

      {/* Team table */}
      <div className="border border-[var(--border-subtle)] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-[var(--surface-1)]">
            <tr>
              {['Name', 'Role', 'Deals', 'Contacts', ''].map(h => (
                <th key={h} className="text-left px-4 py-2.5 text-[11px] font-medium uppercase tracking-wide text-[var(--ink-3)] border-b border-[var(--border-subtle)]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)]">
            {team.map(m => (
              <tr key={m.id} className="hover:bg-[var(--surface-1)] transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                      style={{ background: m.bg, color: m.color }}>{m.initials}</div>
                    <div>
                      <div className="text-[13px] font-medium flex items-center gap-1.5">
                        {m.name}
                        {m.isMe && <span className="text-[10px] bg-accent text-accent-fg px-1.5 py-0.5 rounded font-bold">YOU</span>}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-[13px] text-[var(--ink-2)]">{m.role}</td>
                <td className="px-4 py-3 text-[13px] font-medium">{deals.filter(d => d.ownerId === m.id).length}</td>
                <td className="px-4 py-3 text-[13px] font-medium">{contacts.filter(c => c.ownerId === m.id).length}</td>
                <td className="px-4 py-3 text-right">
                  {!m.isMe && (
                    <button onClick={() => removeTeamMember(m.id)} aria-label={`Remove ${m.name}`}
                      className="text-[var(--ink-3)] hover:text-red-600 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Invite modal */}
      {inviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 animate-fade-in"
          onClick={e => { if (e.target === e.currentTarget) setInviteOpen(false) }}>
          <div className="bg-[var(--surface-0)] border border-[var(--border-subtle)] rounded-xl p-6 w-full max-w-sm shadow-xl animate-fade-up flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[15px] font-semibold">Invite team member</h3>
              <button onClick={() => setInviteOpen(false)} className="text-[var(--ink-3)] hover:text-[var(--ink)]"><X size={16} /></button>
            </div>
            <Field label="Email address">
              <input className={inputCls} type="email" placeholder="colleague@company.com" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} autoFocus />
            </Field>
            <Field label="Role">
              <select className={inputCls} value={inviteRole} onChange={e => setInviteRole(e.target.value)}>
                <option>Sales Rep</option>
                <option>Sales Lead</option>
                <option>Account Executive</option>
                <option>BDR</option>
                <option>Admin</option>
              </select>
            </Field>
            {inviteMsg && <p className="text-[12px] text-green-600 bg-green-50 border border-green-200 rounded-lg px-3 py-2">{inviteMsg}</p>}
            <div className="flex gap-2 justify-end">
              <button onClick={() => setInviteOpen(false)} className="h-8 px-3 border border-[var(--border)] rounded-lg text-[13px] text-[var(--ink-2)]">Cancel</button>
              <button onClick={invite} disabled={inviting}
                className="h-8 px-4 bg-accent text-accent-fg rounded-lg text-[13px] font-medium hover:opacity-85 disabled:opacity-50">
                {inviting ? 'Sending…' : 'Send invite'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Automations ──────────────────────────────────────────────────────────────

import type { AutoTrigger, AutoAction } from '@/lib/types'

const TRIGGERS: { value: AutoTrigger; label: string }[] = [
  { value: 'contact_created',        label: 'Contact is created' },
  { value: 'contact_status_changed', label: 'Contact status changes' },
  { value: 'deal_created',           label: 'Deal is created' },
  { value: 'deal_stage_changed',     label: 'Deal stage changes' },
]
const ACTIONS: { value: AutoAction; label: string }[] = [
  { value: 'assign_to_me',    label: 'Assign to me' },
  { value: 'add_tag',         label: 'Add a tag' },
  { value: 'create_reminder', label: 'Create follow-up reminder' },
  { value: 'send_webhook',    label: 'Send webhook' },
]
const TRIGGER_VALUES: Record<string, string[]> = {
  contact_status_changed: ['hot', 'warm', 'cold', 'customer'],
  deal_stage_changed:     ['Lead', 'Qualified', 'Proposal', 'Negotiation'],
}

function AutomationsPanel() {
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
    addAutomation({ name: form.name, enabled: true, trigger: form.trigger, triggerValue: form.triggerValue || undefined, action: form.action, actionValue: form.actionValue || undefined })
    setForm({ name: '', trigger: 'contact_created', triggerValue: '', action: 'assign_to_me', actionValue: '' })
    setShowForm(false)
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[16px] font-semibold mb-0.5">Automations</h2>
          <p className="text-[13px] text-[var(--ink-3)]">If / Then rules that run automatically.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 h-8 px-4 bg-accent text-accent-fg rounded-lg text-[13px] font-medium hover:opacity-85">
          <Plus size={13} /> New rule
        </button>
      </div>

      {showForm && (
        <div className="bg-[var(--surface-1)] border border-[var(--border-subtle)] rounded-xl p-5 flex flex-col gap-4 animate-fade-up">
          <Field label="Rule name">
            <input className={inputCls} placeholder="e.g. Auto-assign hot leads" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} autoFocus />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[var(--surface-0)] rounded-xl p-4 flex flex-col gap-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--ink-3)]">IF…</p>
              <Field label="Trigger">
                <select className={inputCls} value={form.trigger} onChange={e => setForm(f => ({ ...f, trigger: e.target.value as AutoTrigger, triggerValue: '' }))}>
                  {TRIGGERS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </Field>
              {triggerVals && (
                <Field label="Value">
                  <select className={inputCls} value={form.triggerValue} onChange={e => setForm(f => ({ ...f, triggerValue: e.target.value }))}>
                    <option value="">Any</option>
                    {triggerVals.map(v => <option key={v}>{v}</option>)}
                  </select>
                </Field>
              )}
            </div>
            <div className="bg-[var(--surface-0)] rounded-xl p-4 flex flex-col gap-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--ink-3)]">THEN…</p>
              <Field label="Action">
                <select className={inputCls} value={form.action} onChange={e => setForm(f => ({ ...f, action: e.target.value as AutoAction, actionValue: '' }))}>
                  {ACTIONS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                </select>
              </Field>
              {needsActionValue && (
                <Field label={form.action === 'add_tag' ? 'Tag name' : form.action === 'send_webhook' ? 'Webhook URL' : 'Reminder note'}>
                  <input className={inputCls} value={form.actionValue} onChange={e => setForm(f => ({ ...f, actionValue: e.target.value }))} />
                </Field>
              )}
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowForm(false)} className="h-8 px-3 border border-[var(--border)] rounded-lg text-[13px] text-[var(--ink-2)]">Cancel</button>
            <button onClick={submit} className="h-8 px-4 bg-accent text-accent-fg rounded-lg text-[13px] font-medium hover:opacity-85">Create rule</button>
          </div>
        </div>
      )}

      {automations.length === 0 && !showForm ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <div className="w-12 h-12 rounded-2xl bg-[var(--surface-1)] border border-[var(--border-subtle)] flex items-center justify-center">
            <Zap size={20} className="text-[var(--ink-3)]" />
          </div>
          <p className="text-[14px] font-medium">No automation rules yet</p>
          <p className="text-[12px] text-[var(--ink-3)]">Create If / Then rules to automate repetitive tasks.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {automations.map(rule => {
            const trigger = TRIGGERS.find(t => t.value === rule.trigger)
            const action  = ACTIONS.find(a => a.value === rule.action)
            return (
              <div key={rule.id} className="flex items-center gap-4 p-4 bg-[var(--surface-1)] rounded-xl border border-[var(--border-subtle)]">
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium mb-0.5">{rule.name}</p>
                  <p className="text-[11px] text-[var(--ink-3)]">
                    If {trigger?.label}{rule.triggerValue ? ` = ${rule.triggerValue}` : ''} → {action?.label}{rule.actionValue ? `: ${rule.actionValue}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-[11px] text-[var(--ink-3)]">{rule.runCount} runs</span>
                  {/* Toggle switch */}
                  <button onClick={() => toggleAutomation(rule.id)} aria-label={rule.enabled ? 'Disable' : 'Enable'}
                    className={cn('w-10 h-5 rounded-full transition-colors relative flex-shrink-0', rule.enabled ? 'bg-accent' : 'bg-[var(--border)]')}>
                    <span className={cn('absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform', rule.enabled ? 'translate-x-5' : 'translate-x-0.5')} />
                  </button>
                  <button onClick={() => deleteAutomation(rule.id)} aria-label="Delete"
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

// ─── Shortcuts ────────────────────────────────────────────────────────────────

function ShortcutsPanel() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-[16px] font-semibold mb-0.5">Keyboard shortcuts</h2>
        <p className="text-[13px] text-[var(--ink-3)]">Quick reference for all shortcuts. Disabled when typing in an input.</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {SHORTCUTS.map((s, i) => (
          <div key={i} className="flex items-center justify-between py-3 px-4 bg-[var(--surface-1)] rounded-xl">
            <span className="text-[13px] text-[var(--ink-2)]">{s.desc}</span>
            <div className="flex items-center gap-1 flex-shrink-0">
              {s.keys.map((k, j) => (
                <span key={j} className="flex items-center gap-1">
                  <kbd className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 text-[11px] font-mono font-semibold bg-[var(--surface-0)] border border-[var(--border)] rounded-lg shadow-sm text-[var(--ink-2)]">
                    {k}
                  </kbd>
                  {j < s.keys.length - 1 && <span className="text-[10px] text-[var(--ink-3)]">then</span>}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Billing ──────────────────────────────────────────────────────────────────

function BillingPanel() {
  const [sub, setSub] = useState<{ plan: string; status: string; trial_ends_at: string | null } | null>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      const { data } = await supabase.from('subscriptions').select('plan, status, trial_ends_at').eq('user_id', user.id).maybeSingle()
      setSub(data)
    })
  }, [])

  const daysLeft = sub?.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(sub.trial_ends_at).getTime() - Date.now()) / 86400000))
    : 14

  const plan      = sub?.plan ?? 'free'
  const isActive  = sub?.status === 'active'
  const planLabel = plan === 'team' ? 'Team — $29/mo' : plan === 'solo' ? 'Solo — $9/mo' : 'Free trial'

  return (
    <div className="flex flex-col gap-6 max-w-md">
      <div>
        <h2 className="text-[16px] font-semibold mb-0.5">Billing & subscription</h2>
        <p className="text-[13px] text-[var(--ink-3)]">Manage your plan and payment details.</p>
      </div>

      {/* Current plan */}
      <div className="bg-[var(--surface-1)] border border-[var(--border-subtle)] rounded-xl p-5 flex items-center justify-between">
        <div>
          <p className="text-[12px] text-[var(--ink-3)] mb-0.5">Current plan</p>
          <p className="text-[16px] font-semibold">{planLabel}</p>
          {!isActive && (
            <p className="text-[12px] text-[var(--ink-2)] mt-0.5">
              {daysLeft > 0 ? `${daysLeft} days left in trial` : 'Trial expired'}
            </p>
          )}
          {isActive && <p className="text-[12px] text-green-600 mt-0.5">Active</p>}
        </div>
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', isActive ? 'bg-green-100 text-green-700' : 'bg-[var(--surface-2)] text-[var(--ink-3)]')}>
          <CreditCard size={18} />
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        {isActive ? (
          <a href={process.env.NEXT_PUBLIC_LS_PORTAL_URL ?? '/pricing'}
            className="flex items-center justify-center h-10 px-5 bg-accent text-accent-fg rounded-xl text-[13px] font-medium hover:opacity-85 transition-opacity">
            Manage subscription
          </a>
        ) : (
          <a href="/pricing"
            className="flex items-center justify-center h-10 px-5 bg-accent text-accent-fg rounded-xl text-[13px] font-medium hover:opacity-85 transition-opacity">
            Upgrade to a paid plan
          </a>
        )}
        <p className="text-[11px] text-center text-[var(--ink-3)]">
          Payments and invoices are handled securely by Lemon Squeezy.
        </p>
      </div>
    </div>
  )
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

const inputCls = 'w-full h-9 px-3 text-[13px] rounded-lg border border-[var(--border)] bg-[var(--surface-1)] text-[var(--ink)] outline-none focus:border-accent transition-colors placeholder:text-[var(--ink-3)]'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[12px] font-medium text-[var(--ink-2)]">{label}</label>
      {children}
    </div>
  )
}
