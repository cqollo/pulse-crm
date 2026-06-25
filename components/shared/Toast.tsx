'use client'
import { useCRM } from '@/store'
import { Check, Trash2, UserPlus, Users, Download, AlertCircle, Copy } from 'lucide-react'
import { cn } from '@/lib/utils'

const ICONS: Record<string, React.ReactNode> = {
  check: <Check size={14} />,
  trash: <Trash2 size={14} />,
  'user-plus': <UserPlus size={14} />,
  users: <Users size={14} />,
  download: <Download size={14} />,
  'alert-circle': <AlertCircle size={14} />,
  copy: <Copy size={14} />,
}

export function Toast() {
  const toast = useCRM(s => s.toast)
  if (!toast) return null
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'fixed bottom-5 left-1/2 -translate-x-1/2 z-[999] flex items-center gap-2',
        'px-4 py-2.5 rounded-lg text-sm font-medium shadow-lg animate-fade-up',
        toast.err ? 'bg-red-700 text-white' : 'bg-accent text-accent-fg',
      )}
    >
      {ICONS[toast.icon] ?? <Check size={14} />}
      {toast.msg}
    </div>
  )
}
