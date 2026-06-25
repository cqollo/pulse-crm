'use client'
import { useState } from 'react'
import { useCRM } from '@/store'
import { TeamAvatar } from '../shared/Avatar'
import { Trash2, Plus, UserCheck } from 'lucide-react'
import { inputCls } from '../shared/Modal'

export function TeamView() {
  const { team, deals, contacts, addTeamMember, removeTeamMember } = useCRM()
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [initials, setInitials] = useState('')
  const [err, setErr] = useState('')

  const submit = () => {
    if (!name.trim()) { setErr('Name required'); return }
    if (!role.trim()) { setErr('Role required'); return }
    addTeamMember(name.trim(), role.trim(), initials.trim())
    setName(''); setRole(''); setInitials(''); setErr('')
  }

  return (
    <div className="max-w-2xl flex flex-col gap-6">
      <div>
        <h2 className="text-[15px] font-semibold mb-1">Team</h2>
        <p className="text-[13px] text-[var(--ink-3)]">Manage your workspace members. You can assign contacts and deals to any team member.</p>
      </div>

      {/* Member list */}
      <div className="flex flex-col gap-2">
        {team.map(m => {
          const memberDeals = deals.filter(d => d.ownerId === m.id).length
          const memberContacts = contacts.filter(c => c.ownerId === m.id).length
          return (
            <div key={m.id} className="flex items-center gap-4 p-4 bg-[var(--surface-0)] border border-[var(--border-subtle)] rounded-xl">
              <TeamAvatar {...m} size="md" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[14px] font-medium">{m.name}</span>
                  {m.isMe && (
                    <span className="text-[10px] bg-accent text-accent-fg px-1.5 py-0.5 rounded font-medium">YOU</span>
                  )}
                </div>
                <div className="text-[12px] text-[var(--ink-3)]">{m.role}</div>
              </div>
              <div className="flex items-center gap-4 text-right">
                <div>
                  <div className="text-[14px] font-medium">{memberDeals}</div>
                  <div className="text-[11px] text-[var(--ink-3)]">deals</div>
                </div>
                <div>
                  <div className="text-[14px] font-medium">{memberContacts}</div>
                  <div className="text-[11px] text-[var(--ink-3)]">contacts</div>
                </div>
                {!m.isMe && (
                  <button
                    onClick={() => removeTeamMember(m.id)}
                    aria-label={`Remove ${m.name}`}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--ink-3)] hover:text-red-600 hover:bg-red-50 transition-all"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Add member */}
      <div className="bg-[var(--surface-0)] border border-[var(--border-subtle)] rounded-xl p-5">
        <h3 className="text-[13px] font-medium mb-4 flex items-center gap-2">
          <UserCheck size={15} className="text-[var(--ink-3)]" /> Add team member
        </h3>
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium text-[var(--ink-2)]">Name</label>
              <input className={inputCls} value={name} onChange={e => setName(e.target.value)} placeholder="Alex Johnson" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-medium text-[var(--ink-2)]">Role</label>
              <input className={inputCls} value={role} onChange={e => setRole(e.target.value)} placeholder="Account Executive" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-[var(--ink-2)]">Initials <span className="text-[var(--ink-3)] font-normal">(optional — auto-generated if empty)</span></label>
            <input className={inputCls} value={initials} onChange={e => setInitials(e.target.value.toUpperCase().slice(0, 2))} placeholder="AJ" maxLength={2} />
          </div>
          {err && <p className="text-[12px] text-red-500">{err}</p>}
          <button onClick={submit} className="flex items-center gap-1.5 h-9 px-4 bg-accent text-accent-fg rounded-lg text-[13px] font-medium hover:opacity-85 transition-opacity self-start">
            <Plus size={14} /> Add member
          </button>
        </div>
      </div>
    </div>
  )
}
