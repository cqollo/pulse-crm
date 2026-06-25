'use client'
import { getAvatarColor, getInitials } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface AvatarProps {
  fname: string
  lname: string
  colorIdx: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = { sm: 'w-7 h-7 text-[10px]', md: 'w-9 h-9 text-xs', lg: 'w-12 h-12 text-base' }

export function Avatar({ fname, lname, colorIdx, size = 'md', className }: AvatarProps) {
  const [bg, fg] = getAvatarColor(colorIdx)
  return (
    <div
      className={cn('rounded-full flex items-center justify-center font-semibold flex-shrink-0', sizes[size], className)}
      style={{ background: bg, color: fg }}
      aria-hidden="true"
    >
      {getInitials(fname, lname)}
    </div>
  )
}

interface TeamAvatarProps {
  bg: string
  color: string
  initials: string
  name: string
  isMe?: boolean
  size?: 'sm' | 'md'
}

const teamSizes = { sm: 'w-7 h-7 text-[10px]', md: 'w-9 h-9 text-xs' }

export function TeamAvatar({ bg, color, initials, name, isMe, size = 'sm' }: TeamAvatarProps) {
  return (
    <div
      className={cn('rounded-full flex items-center justify-center font-semibold flex-shrink-0 relative', teamSizes[size])}
      style={{ background: bg, color }}
      title={name + (isMe ? ' (you)' : '')}
      aria-label={name + (isMe ? ' (you)' : '')}
    >
      {initials}
      {isMe && (
        <span className="absolute -top-1 -right-1 text-[8px] bg-accent text-accent-fg px-1 rounded leading-tight font-bold">
          YOU
        </span>
      )}
    </div>
  )
}
