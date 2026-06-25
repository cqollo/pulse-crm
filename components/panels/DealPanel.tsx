'use client'
import { useCRM } from '@/store'
import { TeamAvatar } from '../shared/Avatar'
import { StageBadge } from '../shared/Badge'
import { EntityNote } from '../notepad/Notepad'
import { X, Trash2, Edit, Clock } from 'lucide-react'
import { STAGES, cn } from '@/lib/utils'
import type { Stage } from '@/lib/types'

export function DealPanel() {
  const { dealPanelId, closeDealPanel, deals, team, openDealModal, deleteDeal, moveDeal, updateDeal } = useCRM()
  const deal = deals.find(d => d.id === dealPanelId)

  if (!dealPanelId) return null

  const owner = deal ? team.find(m => m.id === deal.ownerId) : null

  const confirmDelete = () => {
    if (!deal) return
    if (confirm(`Delete "${deal.title}"?`)) deleteDeal(deal.id)
  }

  return (
    <>
      <div className="fixed inset-0 z-30 bg-black/20 animate-fade-in" onClick={closeDealPanel} aria-hidden />
      <aside
        aria-label={deal ? `${deal.title} deal details` : 'Deal details'}
        className="fixed right-0 top-0 h-full w-full max-w-sm z-40 bg-[var(--surface-0)] border-l border-[var(--border-subtle)] shadow-2xl flex flex-col animate-slide-in overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-subtle)]">
          <span className="text-[13px] font-medium text-[var(--ink-2)]">Deal</span>
          <div className="flex items-center gap-1">
            {deal && (
              <>
                <button onClick={() => openDealModal(deal.id)} aria-label="Edit deal"
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--ink-3)] hover:text-[var(--ink)] hover:bg-[var(--surface-1)] transition-all">
                  <Edit size={15} />
                </button>
                <button onClick={confirmDelete} aria-label="Delete deal"
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--ink-3)] hover:text-red-600 hover:bg-red-50 transition-all">
                  <Trash2 size={15} />
                </button>
              </>
            )}
            <button onClick={closeDealPanel} aria-label="Close panel"
              className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--ink-3)] hover:text-[var(--ink)] hover:bg-[var(--surface-1)] transition-all">
              <X size={16} />
            </button>
          </div>
        </div>

        {!deal ? (
          <div className="flex-1 flex items-center justify-center text-[13px] text-[var(--ink-3)]">Deal not found</div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {/* Identity */}
            <div className="px-5 py-5 border-b border-[var(--border-subtle)]">
              <div className="text-[18px] font-semibold leading-snug mb-1">{deal.title}</div>
              <div className="text-[12px] text-[var(--ink-3)] mb-3">{deal.company}</div>
              <div className="flex items-center gap-3">
                <span className="text-[24px] font-mono font-semibold">{deal.value}</span>
                <div className="flex flex-col gap-1">
                  <StageBadge stage={deal.stage} />
                  <span className="text-[11px] text-[var(--ink-3)]">{deal.prob} probability</span>
                </div>
              </div>
            </div>

            {/* Stage mover */}
            <div className="px-5 py-4 border-b border-[var(--border-subtle)]">
              <div className="text-[11px] font-medium uppercase tracking-wide text-[var(--ink-3)] mb-3">Move stage</div>
              <div className="flex gap-1.5 flex-wrap">
                {STAGES.map(s => (
                  <button
                    key={s}
                    onClick={() => moveDeal(deal.id, s as Stage)}
                    aria-pressed={deal.stage === s}
                    className={cn(
                      'h-7 px-3 rounded-lg text-[12px] border transition-all',
                      deal.stage === s
                        ? 'bg-accent text-accent-fg border-accent'
                        : 'bg-[var(--surface-1)] border-[var(--border)] text-[var(--ink-2)] hover:border-[var(--ink-3)]'
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Details */}
            <div className="px-5 py-4 flex flex-col gap-3 border-b border-[var(--border-subtle)]">
              {owner && (
                <Row label="Owner">
                  <div className="flex items-center gap-2">
                    <TeamAvatar {...owner} size="sm" />
                    <span className="text-[13px]">{owner.name}</span>
                    {owner.isMe && <span className="text-[10px] bg-accent/10 text-accent px-1.5 py-0.5 rounded">you</span>}
                  </div>
                </Row>
              )}
              <Row label="Created" value={deal.createdAt} />
              <Row label="Updated" value={deal.updatedAt} />
            </div>

            {/* History */}
            <div className="px-5 py-4">
              <div className="flex items-center gap-2 mb-3">
                <Clock size={13} className="text-[var(--ink-3)]" />
                <span className="text-[11px] font-medium uppercase tracking-wide text-[var(--ink-3)]">History</span>
              </div>
              {(deal.history || []).length === 0 ? (
                <p className="text-[12px] text-[var(--ink-3)]">No history yet</p>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {[...(deal.history || [])].reverse().map((h, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className={cn('w-2 h-2 rounded-full mt-1.5 flex-shrink-0',
                        h.type === 'created' ? 'bg-green-500' :
                        h.type === 'stage' ? 'bg-purple-500' : 'bg-amber-500'
                      )} />
                      <div>
                        <p className="text-[13px] text-[var(--ink-2)]">{h.text}</p>
                        <p className="text-[11px] text-[var(--ink-3)]">{h.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Notes */}
            <div className="px-5 pb-5 border-t border-[var(--border-subtle)] pt-4">
              <EntityNote
                note={deal.notes || ''}
                onChange={val => updateDeal(deal.id, { notes: val })}
              />
            </div>
          </div>
        )}
      </aside>
    </>
  )
}

function Row({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-[11px] font-medium uppercase tracking-wide text-[var(--ink-3)] w-20 flex-shrink-0 pt-0.5">{label}</span>
      {children ?? <span className="text-[13px] text-[var(--ink-2)]">{value}</span>}
    </div>
  )
}
