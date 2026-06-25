'use client'
import { useMemo } from 'react'
import { useCRM } from '@/store'
import { TrendingUp, Target } from 'lucide-react'
import { STAGES, cn } from '@/lib/utils'
import type { Deal } from '@/lib/types'

function parseVal(v: string): number {
  const n = parseFloat((v || '0').replace(/[^0-9.]/g, ''))
  return n * ((v || '').toLowerCase().includes('k') ? 1000 : 1)
}

function parsePct(p: string): number {
  return parseFloat(p) / 100 || 0
}

function fmt(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `$${Math.round(n / 1_000)}k`
  return `$${Math.round(n)}`
}

export function ForecastView() {
  const { deals, team, activePipelineOwner, setPipelineOwner } = useCRM()

  const filtered = activePipelineOwner === 'all' ? deals : deals.filter(d => d.ownerId === activePipelineOwner)

  const stageData = useMemo(() => STAGES.map(stage => {
    const stageDeals = filtered.filter(d => d.stage === stage)
    const total = stageDeals.reduce((s, d) => s + parseVal(d.value), 0)
    const weighted = stageDeals.reduce((s, d) => s + parseVal(d.value) * parsePct(d.prob), 0)
    return { stage, count: stageDeals.length, total, weighted }
  }), [filtered])

  const totalPipeline = stageData.reduce((s, d) => s + d.total, 0)
  const totalWeighted = stageData.reduce((s, d) => s + d.weighted, 0)
  const wonDeals = filtered.filter(d => d.stage === 'Negotiation')
  const wonValue = wonDeals.reduce((s, d) => s + parseVal(d.value), 0)

  // Monthly projection — group deals by close date or use even spread across next 3 months
  const months = useMemo(() => {
    const now = new Date()
    const result: { label: string; value: number; weighted: number }[] = []
    for (let i = 0; i < 4; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1)
      const label = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      // deals with closeDate in this month, or distribute evenly if no close dates
      const monthDeals = filtered.filter(deal => {
        if (deal.closeDate) {
          const cd = new Date(deal.closeDate)
          return cd.getMonth() === d.getMonth() && cd.getFullYear() === d.getFullYear()
        }
        // No close date: distribute remaining pipeline evenly over 3 months
        return i > 0 && !deal.closeDate
      })
      const hasCloseDates = filtered.some(d => d.closeDate)
      const dealsForMonth = hasCloseDates ? monthDeals : (i === 0 ? [] : filtered.slice(Math.floor(filtered.length * (i - 1) / 3), Math.floor(filtered.length * i / 3)))
      result.push({
        label,
        value: dealsForMonth.reduce((s, d) => s + parseVal(d.value), 0),
        weighted: dealsForMonth.reduce((s, d) => s + parseVal(d.value) * parsePct(d.prob), 0),
      })
    }
    return result
  }, [filtered])

  const maxBar = Math.max(...months.map(m => m.value), 1)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[15px] font-semibold mb-1">Revenue forecast</h2>
          <p className="text-[13px] text-[var(--ink-3)]">Weighted pipeline projection based on deal probability.</p>
        </div>
        {/* Owner filter */}
        <div className="flex gap-1.5">
          <button onClick={() => setPipelineOwner('all')} aria-pressed={activePipelineOwner === 'all'}
            className={cn('h-7 px-3 rounded-lg text-[12px] border transition-all',
              activePipelineOwner === 'all' ? 'bg-accent text-accent-fg border-accent' : 'bg-[var(--surface-0)] border-[var(--border)] text-[var(--ink-2)]'
            )}>All</button>
          {team.map(m => (
            <button key={m.id} onClick={() => setPipelineOwner(m.id)} aria-pressed={activePipelineOwner === m.id}
              className={cn('h-7 px-3 rounded-lg text-[12px] border transition-all',
                activePipelineOwner === m.id ? 'bg-accent text-accent-fg border-accent' : 'bg-[var(--surface-0)] border-[var(--border)] text-[var(--ink-2)]'
              )}>{m.name}</button>
          ))}
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total pipeline', value: fmt(totalPipeline), sub: `${filtered.length} deals`, color: '#534AB7', bg: '#EEEDFE' },
          { label: 'Weighted forecast', value: fmt(totalWeighted), sub: 'By probability', color: '#0F6E56', bg: '#E1F5EE' },
          { label: 'In negotiation', value: fmt(wonValue), sub: `${wonDeals.length} deals`, color: '#854F0B', bg: '#FAEEDA' },
        ].map(k => (
          <div key={k.label} className="bg-[var(--surface-0)] border border-[var(--border-subtle)] rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: k.bg, color: k.color }}>
                <TrendingUp size={14} />
              </div>
              <span className="text-[12px] text-[var(--ink-3)]">{k.label}</span>
            </div>
            <div className="text-[26px] font-mono font-semibold mb-0.5">{k.value}</div>
            <div className="text-[11px] text-[var(--ink-3)]">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Monthly bar chart */}
      <div className="bg-[var(--surface-0)] border border-[var(--border-subtle)] rounded-xl p-5">
        <div className="flex items-center gap-2 mb-5">
          <Target size={15} className="text-[var(--ink-3)]" />
          <h3 className="text-[13px] font-medium">Monthly projection</h3>
          <div className="flex items-center gap-3 ml-auto text-[11px] text-[var(--ink-3)]">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-accent/20 inline-block" /> Total</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-accent inline-block" /> Weighted</span>
          </div>
        </div>
        {filtered.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-[13px] text-[var(--ink-3)]">Add deals to see your forecast</div>
        ) : (
          <div className="flex items-end gap-4 h-48 px-2">
            {months.map(m => (
              <div key={m.label} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex flex-col justify-end gap-1 relative" style={{ height: '160px' }}>
                  {/* Total bar */}
                  <div
                    className="w-full rounded-t-lg bg-accent/15 absolute bottom-0 transition-all"
                    style={{ height: `${Math.max((m.value / maxBar) * 100, m.value > 0 ? 4 : 0)}%` }}
                  />
                  {/* Weighted bar */}
                  <div
                    className="w-full rounded-t-lg bg-accent absolute bottom-0 transition-all"
                    style={{ height: `${Math.max((m.weighted / maxBar) * 100, m.weighted > 0 ? 2 : 0)}%`, width: '60%', left: '20%' }}
                  />
                  {m.value > 0 && (
                    <div className="absolute -top-6 left-0 right-0 text-center text-[10px] font-mono text-[var(--ink-3)]">
                      {fmt(m.value)}
                    </div>
                  )}
                </div>
                <span className="text-[11px] text-[var(--ink-3)]">{m.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stage breakdown table */}
      <div className="bg-[var(--surface-0)] border border-[var(--border-subtle)] rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-[var(--border-subtle)]">
          <h3 className="text-[13px] font-medium">Pipeline breakdown by stage</h3>
        </div>
        <table className="w-full">
          <thead className="bg-[var(--surface-1)]">
            <tr>
              {['Stage', 'Deals', 'Total value', 'Avg probability', 'Weighted value'].map(h => (
                <th key={h} className="text-left px-5 py-2.5 text-[11px] font-medium uppercase tracking-wide text-[var(--ink-3)]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)]">
            {stageData.map(s => {
              const stageDeals = filtered.filter(d => d.stage === s.stage)
              const avgProb = stageDeals.length > 0
                ? Math.round(stageDeals.reduce((acc, d) => acc + parsePct(d.prob) * 100, 0) / stageDeals.length)
                : 0
              return (
                <tr key={s.stage} className="hover:bg-[var(--surface-1)] transition-colors">
                  <td className="px-5 py-3 text-[13px] font-medium">{s.stage}</td>
                  <td className="px-5 py-3 text-[13px] text-[var(--ink-3)]">{s.count}</td>
                  <td className="px-5 py-3 text-[13px] font-mono">{fmt(s.total)}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-[var(--surface-2)] rounded-full overflow-hidden">
                        <div className="h-full bg-accent rounded-full" style={{ width: `${avgProb}%` }} />
                      </div>
                      <span className="text-[12px] text-[var(--ink-3)] w-8 text-right">{avgProb}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-[13px] font-mono font-medium text-accent">{fmt(s.weighted)}</td>
                </tr>
              )
            })}
            <tr className="bg-[var(--surface-1)] font-semibold">
              <td className="px-5 py-3 text-[13px]">Total</td>
              <td className="px-5 py-3 text-[13px]">{filtered.length}</td>
              <td className="px-5 py-3 text-[13px] font-mono">{fmt(totalPipeline)}</td>
              <td className="px-5 py-3 text-[13px]">—</td>
              <td className="px-5 py-3 text-[13px] font-mono text-accent">{fmt(totalWeighted)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
