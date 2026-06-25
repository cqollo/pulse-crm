'use client'
import { useCRM } from '@/store'
import { TeamAvatar } from './Avatar'
import { cn } from '@/lib/utils'

interface Props {
  value: string | null
  onChange: (id: string | null) => void
  label?: string
}

export function AssigneeSelector({ value, onChange, label }: Props) {
  const team = useCRM(s => s.team)
  return (
    <div>
      {label && <div className="text-[12px] font-medium text-[var(--ink-2)] mb-2">{label}</div>}
      <div className="flex flex-wrap gap-2" role="group" aria-label="Assign to team member">
        {team.map(m => (
          <button
            key={m.id}
            type="button"
            aria-pressed={value === m.id}
            aria-label={`Assign to ${m.name}${m.isMe ? ' (you)' : ''}`}
            onClick={() => onChange(value === m.id ? null : m.id)}
            className={cn(
              'flex items-center gap-2 h-8 px-3 rounded-full text-[12px] border transition-all',
              value === m.id
                ? 'bg-accent text-accent-fg border-accent'
                : 'bg-[var(--surface-1)] border-[var(--border)] text-[var(--ink-2)] hover:border-[var(--ink-3)]'
            )}
          >
            <TeamAvatar {...m} size="sm" />
            {m.name}{m.isMe ? ' (you)' : ''}
          </button>
        ))}
      </div>
    </div>
  )
}
