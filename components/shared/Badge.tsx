'use client'
import { STATUS_CLASS, STATUS_LABEL, STAGE_CLASS } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { Status, Stage } from '@/lib/types'

export function StatusBadge({ status, className }: { status: Status; className?: string }) {
  return (
    <span className={cn('text-[11px] font-medium px-2 py-0.5 rounded', STATUS_CLASS[status], className)}>
      {STATUS_LABEL[status]}
    </span>
  )
}

export function StageBadge({ stage, className }: { stage: Stage; className?: string }) {
  return (
    <span className={cn('text-[11px] font-medium px-2 py-0.5 rounded', STAGE_CLASS[stage], className)}>
      {stage}
    </span>
  )
}

export function Tag({ label, onRemove }: { label: string; onRemove?: () => void }) {
  // deterministic color from label
  let h = 0
  for (let i = 0; i < label.length; i++) h = (h * 31 + label.charCodeAt(i)) >>> 0
  const PALETTE = [
    { bg: '#F0E6FB', fg: '#7C3AED' }, { bg: '#FDE8F0', fg: '#BE185D' },
    { bg: '#E0F2FE', fg: '#0369A1' }, { bg: '#ECFDF5', fg: '#065F46' },
    { bg: '#FFF7ED', fg: '#9A3412' }, { bg: '#F0FDF4', fg: '#15803D' },
  ]
  const { bg, fg } = PALETTE[h % PALETTE.length]
  return (
    <span
      className="inline-flex items-center gap-1 text-[11px] font-medium px-2 h-5 rounded-full"
      style={{ background: bg, color: fg }}
    >
      <span className="max-w-[100px] truncate">{label}</span>
      {onRemove && (
        <button
          onClick={onRemove}
          aria-label={`Remove tag: ${label}`}
          className="opacity-60 hover:opacity-100 leading-none"
        >×</button>
      )}
    </span>
  )
}
