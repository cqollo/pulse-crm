'use client'
import { useState } from 'react'
import { useCRM } from '@/store'
import { Avatar } from '../shared/Avatar'
import { StatusBadge, Tag } from '../shared/Badge'
import { TeamAvatar } from '../shared/Avatar'
import { Search, ArrowUpDown, Plus, Upload, Download, Mail, Phone, ChevronDown } from 'lucide-react'
import { cn, STATUS_LABEL } from '@/lib/utils'
import type { Status } from '@/lib/types'

const STATUSES: (Status | 'all')[] = ['all', 'hot', 'warm', 'cold', 'customer']

export function ContactList() {
  const {
    contacts, team, searchQuery, setSearch,
    activeFilter, setFilter, activeSort, setSort, sortDir,
    activeOwnerFilter, setOwnerFilter,
    openContactPanel, openContactModal, openImportModal, showToast,
  } = useCRM()

  const [statusOpen, setStatusOpen] = useState(false)

  const filtered = contacts
    .filter(c => {
      const q = searchQuery.toLowerCase()
      const matchQ = !q || `${c.fname} ${c.lname} ${c.email} ${c.company} ${c.role}`.toLowerCase().includes(q)
      const matchF = activeFilter === 'all' || c.status === activeFilter
      const matchO = activeOwnerFilter === 'all' || c.ownerId === activeOwnerFilter
      return matchQ && matchF && matchO
    })
    .sort((a, b) => {
      if (activeSort === 'name') return sortDir * `${a.fname} ${a.lname}`.localeCompare(`${b.fname} ${b.lname}`)
      if (activeSort === 'status') return sortDir * a.status.localeCompare(b.status)
      if (activeSort === 'value') {
        const parse = (v: string) => parseFloat((v || '0').replace(/[^0-9.]/g, '')) * (v?.toLowerCase().includes('k') ? 1000 : 1)
        return sortDir * (parse(b.value) - parse(a.value))
      }
      return 0
    })

  const exportCsv = () => {
    const cols = ['First', 'Last', 'Email', 'Role', 'Company', 'Status', 'Value', 'Phone', 'LinkedIn', 'Tags']
    const rows = contacts.map(c => [c.fname, c.lname, c.email, c.role, c.company, c.status, c.value, c.phone, c.linkedin, (c.tags || []).join('; ')].map(v => `"${(v || '').replace(/"/g, '""')}"`).join(','))
    const csv = [cols.join(','), ...rows].join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = `pulse-contacts-${Date.now()}.csv`
    a.click()
    showToast(`${contacts.length} contacts exported`, 'download')
  }

  const currentStatusLabel = activeFilter === 'all' ? 'Status' : STATUS_LABEL[activeFilter]

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar — clean and tight */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-3)]" aria-hidden />
          <input
            className="w-full h-9 pl-9 pr-3 text-[13px] rounded-lg border border-[var(--border)] bg-[var(--surface-0)] placeholder:text-[var(--ink-3)] outline-none focus:border-accent transition-colors"
            placeholder="Search contacts…"
            value={searchQuery}
            onChange={e => setSearch(e.target.value)}
            aria-label="Search contacts"
          />
        </div>

        {/* Status dropdown — replaces 4 pills */}
        <div className="relative">
          <button
            onClick={() => setStatusOpen(!statusOpen)}
            className={cn('flex items-center gap-1.5 h-9 px-3 rounded-lg text-[13px] border transition-all',
              activeFilter !== 'all'
                ? 'bg-accent text-accent-fg border-accent'
                : 'bg-[var(--surface-0)] border-[var(--border)] text-[var(--ink-2)] hover:border-[var(--ink-3)]'
            )}>
            {currentStatusLabel} <ChevronDown size={13} />
          </button>
          {statusOpen && (
            <div className="absolute top-full mt-1 left-0 bg-[var(--surface-0)] border border-[var(--border)] rounded-xl shadow-lg z-20 min-w-[140px] py-1 animate-fade-up">
              {STATUSES.map(s => (
                <button key={s} onClick={() => { setFilter(s); setStatusOpen(false) }}
                  className={cn('w-full text-left px-3 py-2 text-[13px] hover:bg-[var(--surface-1)] transition-colors capitalize',
                    activeFilter === s && 'text-accent font-medium'
                  )}>
                  {s === 'all' ? 'All statuses' : STATUS_LABEL[s]}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Owner filter */}
        <select
          value={activeOwnerFilter}
          onChange={e => setOwnerFilter(e.target.value)}
          className="h-9 px-2 text-[13px] rounded-lg border border-[var(--border)] bg-[var(--surface-0)] text-[var(--ink-2)] outline-none focus:border-accent"
          aria-label="Filter by owner"
        >
          <option value="all">All owners</option>
          {team.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>

        <div className="flex-1" />

        <button onClick={openImportModal} className="flex items-center gap-1.5 h-9 px-3 rounded-lg text-[13px] border border-[var(--border)] bg-[var(--surface-0)] text-[var(--ink-2)] hover:border-[var(--ink-3)] transition-all">
          <Upload size={13} /> Import
        </button>
        <button onClick={exportCsv} className="flex items-center gap-1.5 h-9 px-3 rounded-lg text-[13px] border border-[var(--border)] bg-[var(--surface-0)] text-[var(--ink-2)] hover:border-[var(--ink-3)] transition-all">
          <Download size={13} /> Export
        </button>
        <button onClick={() => openContactModal()} className="flex items-center gap-1.5 h-9 px-4 bg-accent text-accent-fg rounded-lg text-[13px] font-medium hover:opacity-85 transition-opacity">
          <Plus size={14} /> New contact
        </button>
      </div>

      {/* Column headers */}
      <div className="flex items-center gap-3 text-[11px] font-medium text-[var(--ink-3)] uppercase tracking-wide px-3">
        <span className="w-8" />
        <SortBtn label="Name" col="name" active={activeSort} dir={sortDir} onClick={() => setSort('name')} className="w-48" />
        <SortBtn label="Status" col="status" active={activeSort} dir={sortDir} onClick={() => setSort('status')} className="w-24" />
        <SortBtn label="Value" col="value" active={activeSort} dir={sortDir} onClick={() => setSort('value')} className="w-24" />
        <span className="w-32">Tags</span>
        <span className="w-24">Owner</span>
        <span className="w-16" />
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[var(--surface-1)] border border-[var(--border-subtle)] flex items-center justify-center">
            <Search size={20} className="text-[var(--ink-3)]" />
          </div>
          <p className="text-[14px] font-medium">{searchQuery ? 'No contacts match your search' : 'No contacts yet'}</p>
          <p className="text-[12px] text-[var(--ink-2)]">{searchQuery ? 'Try a different search or filter' : 'Add your first contact to get started'}</p>
          {!searchQuery && (
            <button onClick={() => openContactModal()} className="flex items-center gap-1.5 h-8 px-4 bg-accent text-accent-fg rounded-lg text-[13px] font-medium hover:opacity-85 mt-1">
              <Plus size={14} /> Add contact
            </button>
          )}
        </div>
      )}

      {/* List */}
      <div className="flex flex-col gap-1" role="list" aria-label="Contacts">
        {filtered.map(c => {
          const owner = team.find(m => m.id === c.ownerId)
          return (
            <div key={c.id} role="listitem"
              onClick={() => openContactPanel(c.id)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[var(--surface-0)] border border-[var(--border-subtle)] hover:border-[var(--border)] cursor-pointer transition-all group animate-fade-up relative"
              tabIndex={0}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openContactPanel(c.id) } }}
              aria-label={`${c.fname} ${c.lname}, ${c.role} at ${c.company}`}
            >
              <Avatar fname={c.fname} lname={c.lname} colorIdx={c.colorIdx} size="sm" />

              {/* Name + role — fixed width, no stretching */}
              <div className="w-48 min-w-0">
                <div className="text-[13px] font-medium truncate">{c.fname} {c.lname}</div>
                {/* Fix: brighter subtitle text */}
                <div className="text-[11px] text-[var(--ink-2)] truncate">{c.role} · {c.company}</div>
              </div>

              {/* Faint horizontal guide line */}
              <div className="flex-1 h-px bg-[var(--border-subtle)] opacity-40 hidden group-hover:hidden" />

              <div className="w-24"><StatusBadge status={c.status} /></div>
              <div className="w-24 text-[13px] font-mono font-medium text-[var(--ink-2)]">{c.value || '—'}</div>
              <div className="w-32 flex flex-wrap gap-1">
                {(c.tags || []).slice(0, 2).map(t => <Tag key={t} label={t} />)}
                {(c.tags || []).length > 2 && <span className="text-[10px] text-[var(--ink-3)]">+{c.tags.length - 2}</span>}
              </div>
              <div className="w-24 flex items-center gap-1.5">
                {owner
                  ? <><TeamAvatar {...owner} size="sm" /><span className="text-[12px] text-[var(--ink-2)] truncate">{owner.name}</span></>
                  : <span className="text-[12px] text-[var(--ink-3)]">Unassigned</span>
                }
              </div>

              {/* Quick actions — visible on hover */}
              <div className="w-16 flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={e => e.stopPropagation()}>
                {c.email && (
                  <a href={`mailto:${c.email}`} aria-label={`Email ${c.fname}`}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--ink-3)] hover:text-accent hover:bg-[var(--surface-1)] transition-all"
                    title={c.email}>
                    <Mail size={13} />
                  </a>
                )}
                {c.phone && (
                  <a href={`tel:${c.phone}`} aria-label={`Call ${c.fname}`}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--ink-3)] hover:text-accent hover:bg-[var(--surface-1)] transition-all"
                    title={c.phone}>
                    <Phone size={13} />
                  </a>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {filtered.length > 0 && (
        <p className="text-[12px] text-[var(--ink-3)] text-center">{filtered.length} contact{filtered.length !== 1 ? 's' : ''}</p>
      )}
    </div>
  )
}

function SortBtn({ label, col, active, dir, onClick, className }: {
  label: string; col: string; active: string; dir: number; onClick: () => void; className?: string
}) {
  return (
    <button onClick={onClick}
      className={cn('flex items-center gap-1 hover:text-[var(--ink)] transition-colors', className, active === col && 'text-[var(--ink)]')}>
      {label} <ArrowUpDown size={10} className={active === col ? 'opacity-100' : 'opacity-40'} />
      {active === col && <span className="text-[9px]">{dir === 1 ? '↑' : '↓'}</span>}
    </button>
  )
}
