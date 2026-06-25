'use client'
import { useState } from 'react'
import {
  DndContext, DragOverlay, PointerSensor, useSensor, useSensors,
  type DragEndEvent, type DragStartEvent,
  rectIntersection,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { useCRM } from '@/store'
import { STAGES, cn } from '@/lib/utils'
import type { Deal, Stage } from '@/lib/types'
import { GripVertical, Plus } from 'lucide-react'

// ─── Deal Card ────────────────────────────────────────────────────────────────

function DealCard({ deal, overlay }: { deal: Deal; overlay?: boolean }) {
  const { openDealPanel, team } = useCRM()
  const {
    attributes, listeners, setNodeRef,
    transform, transition, isDragging,
  } = useSortable({ id: deal.id, data: { type: 'deal', stage: deal.stage } })

  const owner = team.find(m => m.id === deal.ownerId)

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
      className={cn(
        'bg-[var(--surface-0)] border border-[var(--border-subtle)] rounded-xl p-3 group transition-all select-none cursor-grab active:cursor-grabbing',
        isDragging && !overlay ? 'opacity-30' : 'hover:border-[var(--border)] hover:shadow-sm',
        overlay && 'shadow-xl rotate-1 opacity-95 cursor-grabbing'
      )}
      tabIndex={0}
      role="button"
      aria-label={`${deal.title}, ${deal.company}, ${deal.value}, ${deal.stage}`}
      onClick={() => !isDragging && openDealPanel(deal.id)}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openDealPanel(deal.id) } }}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <span className="text-[13px] font-medium leading-snug">{deal.title}</span>
        <GripVertical size={14} className="text-[var(--ink-3)] opacity-0 group-hover:opacity-100 transition-opacity mt-0.5 flex-shrink-0" />
      </div>
      <div className="text-[12px] text-[var(--ink-2)] mb-2">{deal.company}</div>
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium font-mono">{deal.value}</span>
        <div className="flex items-center gap-1.5">
          {/* Probability pill with color tint */}
          {(() => {
            const pct = parseInt(deal.prob) || 0
            const bg = pct >= 70 ? '#dcfce7' : pct >= 40 ? '#fef9c3' : '#fee2e2'
            const fg = pct >= 70 ? '#15803d' : pct >= 40 ? '#854d0e' : '#b91c1c'
            return (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded" style={{ background: bg, color: fg }}>
                {deal.prob} win
              </span>
            )
          })()}
          {owner && (
            <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0"
              style={{ background: owner.bg, color: owner.color }} title={owner.name}>
              {owner.initials}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Droppable Column ─────────────────────────────────────────────────────────

function Column({ stage, activeDragId }: { stage: Stage; activeDragId: string | null }) {
  const { deals, openDealModal, activePipelineOwner } = useCRM()
  const { setNodeRef, isOver } = useDroppable({ id: `col-${stage}`, data: { stage } })

  const stageDeals = deals.filter(d =>
    d.stage === stage &&
    (activePipelineOwner === 'all' || d.ownerId === activePipelineOwner)
  )

  const total = stageDeals.reduce((s, d) => {
    const n = parseFloat((d.value || '0').replace(/[^0-9.]/g, ''))
    const m = (d.value || '').toLowerCase().includes('k') ? 1000 : 1
    return s + n * m
  }, 0)

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'rounded-xl p-3 flex flex-col gap-2 min-h-[200px] transition-colors',
        isOver ? 'bg-accent/5 border-2 border-accent/30 border-dashed' : 'bg-[var(--surface-1)]'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-medium uppercase tracking-wide text-[var(--ink-2)]">{stage}</span>
          <span className="text-[11px] bg-[var(--surface-0)] border border-[var(--border-subtle)] px-2 py-0.5 rounded-full text-[var(--ink-3)]">
            {stageDeals.length}
          </span>
        </div>
        {total > 0 && (
          <span className="text-[11px] font-mono text-[var(--ink-3)]">${Math.round(total / 1000)}k</span>
        )}
      </div>

      {/* Cards */}
      <SortableContext items={stageDeals.map(d => d.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2 flex-1">
          {stageDeals.length === 0 && (
            <div className={cn(
              'border-2 border-dashed rounded-xl p-4 text-center text-[12px] text-[var(--ink-3)] leading-relaxed transition-colors',
              isOver ? 'border-accent/40 bg-accent/5 text-accent' : 'border-[var(--border)]'
            )}>
              {isOver ? 'Drop here' : `No ${stage.toLowerCase()} deals`}
            </div>
          )}
          {stageDeals.map(deal => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </div>
      </SortableContext>

      <button
        onClick={() => openDealModal()}
        className="flex items-center gap-1.5 text-[12px] text-[var(--ink-3)] hover:text-[var(--ink)] transition-colors mt-1 py-1"
      >
        <Plus size={13} /> Add deal
      </button>
    </div>
  )
}

// ─── Pipeline Board ───────────────────────────────────────────────────────────

export function PipelineBoard() {
  const { deals, moveDeal, activePipelineOwner, setPipelineOwner, team, openDealModal } = useCRM()
  const [activeDragId, setActiveDragId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const activeDeal = activeDragId ? deals.find(d => d.id === activeDragId) : null

  const onDragStart = ({ active }: DragStartEvent) => {
    setActiveDragId(active.id as string)
  }

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveDragId(null)
    if (!over) return

    const overId = over.id as string
    const deal = deals.find(d => d.id === active.id)
    if (!deal) return

    // Dropped on a column droppable (col-Lead, col-Qualified, etc.)
    if (overId.startsWith('col-')) {
      const targetStage = overId.replace('col-', '') as Stage
      if (targetStage !== deal.stage) moveDeal(deal.id, targetStage)
      return
    }

    // Dropped on another deal card — move to that deal's stage
    const targetDeal = deals.find(d => d.id === overId)
    if (targetDeal && targetDeal.stage !== deal.stage) {
      moveDeal(deal.id, targetDeal.stage)
    }
  }

  return (
    <div>
      {/* Owner filter */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <button
          onClick={() => setPipelineOwner('all')}
          aria-pressed={activePipelineOwner === 'all'}
          className={cn('h-7 px-3 rounded-lg text-[12px] border transition-all',
            activePipelineOwner === 'all'
              ? 'bg-accent text-accent-fg border-accent'
              : 'bg-[var(--surface-0)] border-[var(--border)] text-[var(--ink-2)] hover:border-[var(--ink-3)]'
          )}
        >All</button>
        {team.map(m => (
          <button key={m.id}
            onClick={() => setPipelineOwner(m.id)}
            aria-pressed={activePipelineOwner === m.id}
            className={cn('h-7 px-3 rounded-lg text-[12px] border transition-all flex items-center gap-1.5',
              activePipelineOwner === m.id
                ? 'bg-accent text-accent-fg border-accent'
                : 'bg-[var(--surface-0)] border-[var(--border)] text-[var(--ink-2)] hover:border-[var(--ink-3)]'
            )}
          >
            <div className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold"
              style={{ background: m.bg, color: m.color }}>{m.initials}</div>
            {m.name}
          </button>
        ))}
        <button
          onClick={() => openDealModal()}
          className="ml-auto flex items-center gap-1.5 h-8 px-3 bg-accent text-accent-fg rounded-lg text-[13px] font-medium hover:opacity-85 transition-opacity"
        >
          <Plus size={14} /> New deal
        </button>
      </div>

      {/* Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={rectIntersection}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        <div className="grid grid-cols-4 gap-3">
          {STAGES.map(stage => (
            <Column key={stage} stage={stage as Stage} activeDragId={activeDragId} />
          ))}
        </div>
        <DragOverlay dropAnimation={{ duration: 150, easing: 'ease' }}>
          {activeDeal && <DealCard deal={activeDeal} overlay />}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
