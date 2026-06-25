'use client'
import { useState, useMemo } from 'react'
import { useCRM } from '@/store'
import { TeamAvatar } from '../shared/Avatar'
import { formatPipelineValue } from '@/lib/utils'
import { getDailyQuote } from '@/lib/quotes'
import { Users, TrendingUp, DollarSign, UsersRound, Plus, Quote, ChevronRight } from 'lucide-react'

type Range = 'month' | 'quarter' | 'all'

function inRange(dateStr: string, range: Range): boolean {
  if (range === 'all') return true
  const d = new Date(dateStr)
  const now = new Date()
  if (range === 'month') {
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }
  // quarter
  const q = Math.floor(now.getMonth() / 3)
  const dq = Math.floor(d.getMonth() / 3)
  return dq === q && d.getFullYear() === now.getFullYear()
}

export function Dashboard() {
  const { contacts, deals, team, activity, openContactModal, openDealModal, setView } = useCRM()
  const [range, setRange] = useState<Range>('all')
  const quote = getDailyQuote()

  const filteredContacts = useMemo(() => contacts.filter(c => inRange(c.createdAt, range)), [contacts, range])
  const filteredDeals    = useMemo(() => deals.filter(d => inRange(d.createdAt, range)), [deals, range])

  const stats = [
    {
      label: 'Contacts', value: filteredContacts.length,
      sub: filteredContacts.filter(c => c.status === 'hot').length + ' hot leads',
      icon: <Users size={18} />, color: '#534AB7', bg: '#EEEDFE',
      action: () => setView('contacts'),
    },
    {
      label: 'Deals', value: filteredDeals.length,
      sub: filteredDeals.filter(d => d.stage === 'Negotiation').length + ' in negotiation',
      icon: <TrendingUp size={18} />, color: '#0F6E56', bg: '#E1F5EE',
      action: () => setView('pipeline'),
    },
    {
      label: 'Pipeline value', value: formatPipelineValue(filteredDeals),
      sub: 'Across all stages',
      icon: <DollarSign size={18} />, color: '#854F0B', bg: '#FAEEDA',
      action: () => setView('pipeline'),
    },
    {
      label: 'Team members', value: team.length,
      sub: 'Active workspace',
      icon: <UsersRound size={18} />, color: '#185FA5', bg: '#E6F1FB',
      action: () => setView('settings'),
    },
  ]

  const STAGES = ['Lead', 'Qualified', 'Proposal', 'Negotiation']
  const maxCount = Math.max(...STAGES.map(s => filteredDeals.filter(d => d.stage === s).length), 1)

  const teamPerf = team.map(m => ({
    ...m,
    deals: filteredDeals.filter(d => d.ownerId === m.id).length,
    contacts: filteredContacts.filter(c => c.ownerId === m.id).length,
  }))

  return (
    <div className="flex flex-col gap-6">
      {/* Daily quote */}
      <div className="bg-accent text-accent-fg rounded-xl px-6 py-4 flex items-start gap-4">
        <Quote size={20} className="opacity-40 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-[14px] font-medium leading-relaxed">{quote.text}</p>
          <p className="text-[12px] opacity-60 mt-1">— {quote.author}</p>
        </div>
      </div>

      {/* Time range toggle */}
      <div className="flex items-center justify-between">
        <h2 className="text-[13px] font-medium text-[var(--ink-2)]">Overview</h2>
        <div className="flex gap-1 bg-[var(--surface-1)] p-1 rounded-lg">
          {([['month', 'This month'], ['quarter', 'This quarter'], ['all', 'All time']] as [Range, string][]).map(([val, label]) => (
            <button key={val} onClick={() => setRange(val)}
              className={`h-7 px-3 rounded-md text-[12px] transition-all ${range === val ? 'bg-[var(--surface-0)] text-[var(--ink)] shadow-sm font-medium' : 'text-[var(--ink-3)] hover:text-[var(--ink)]'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {stats.map(s => (
          <button key={s.label} onClick={s.action}
            className="bg-[var(--surface-0)] border border-[var(--border-subtle)] rounded-xl p-4 text-left hover:border-[var(--border)] hover:shadow-sm transition-all group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[12px] text-[var(--ink-2)]">{s.label}</span>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
            </div>
            <div className="text-[26px] font-semibold font-mono leading-none mb-1.5">{s.value}</div>
            {/* Fix: brighter sub-text */}
            <div className="text-[12px] text-[var(--ink-2)] font-medium">{s.sub}</div>
          </button>
        ))}
      </div>

      {/* Body */}
      <div className="grid grid-cols-2 gap-4">
        {/* Sales funnel */}
        <div className="bg-[var(--surface-0)] border border-[var(--border-subtle)] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[13px] font-medium">Sales funnel</h3>
            <button onClick={() => openDealModal()} className="flex items-center gap-1 text-[12px] text-[var(--ink-3)] hover:text-[var(--ink)] transition-colors">
              <Plus size={13} /> Add deal
            </button>
          </div>
          {filteredDeals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
              <p className="text-[13px] text-[var(--ink-3)]">Add deals to see your funnel.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {STAGES.map(stage => {
                const count = filteredDeals.filter(d => d.stage === stage).length
                const pct = Math.round((count / maxCount) * 100)
                const value = filteredDeals.filter(d => d.stage === stage).reduce((s, d) => {
                  const n = parseFloat((d.value || '0').replace(/[^0-9.]/g, ''))
                  return s + n * (d.value?.toLowerCase().includes('k') ? 1000 : 1)
                }, 0)
                return (
                  <div key={stage}>
                    <div className="flex items-center justify-between text-[12px] mb-1.5">
                      <span className="text-[var(--ink-2)] font-medium">{stage}</span>
                      <span className="text-[var(--ink-2)] font-mono">{count} · ${Math.round(value / 1000) || 0}k</span>
                    </div>
                    <div className="h-2 bg-[var(--surface-1)] rounded-full overflow-hidden">
                      <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Recent activity — capped at 4 */}
        <div className="bg-[var(--surface-0)] border border-[var(--border-subtle)] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[13px] font-medium">Recent activity</h3>
            {activity.length > 4 && (
              <button onClick={() => setView('notes')}
                className="flex items-center gap-1 text-[12px] text-[var(--ink-3)] hover:text-[var(--ink)] transition-colors">
                View all <ChevronRight size={12} />
              </button>
            )}
          </div>
          {activity.length === 0 ? (
            <p className="text-[13px] text-[var(--ink-3)]">Activity will appear here.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {activity.slice(0, 4).map(a => (
                <div key={a.id} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: a.color }} />
                  <div>
                    <p className="text-[13px] text-[var(--ink-2)]">{a.text}</p>
                    <p className="text-[11px] text-[var(--ink-2)] opacity-60 mt-0.5">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Team performance */}
      <div className="bg-[var(--surface-0)] border border-[var(--border-subtle)] rounded-xl p-5">
        <h3 className="text-[13px] font-medium mb-4">Team performance</h3>
        <div className="grid grid-cols-3 gap-3">
          {teamPerf.map(m => (
            <div key={m.id} className="flex items-center gap-3 p-3 bg-[var(--surface-1)] rounded-xl">
              <TeamAvatar {...m} size="md" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-[13px] font-medium truncate">{m.name}</span>
                  {m.isMe && <span className="text-[10px] bg-accent/10 text-accent px-1.5 py-0.5 rounded flex-shrink-0">you</span>}
                </div>
                <div className="text-[11px] text-[var(--ink-2)]">{m.role}</div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-[13px] font-medium">{m.deals}</div>
                <div className="text-[11px] text-[var(--ink-2)]">deals</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
