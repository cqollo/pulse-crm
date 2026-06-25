'use client'
import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  wide?: boolean
  footer?: React.ReactNode
}

export function Modal({ open, onClose, title, children, wide, footer }: ModalProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const el = ref.current
    if (!el) return
    const focusable = el.querySelectorAll<HTMLElement>(
      'input,select,textarea,button,[tabindex]:not([tabindex="-1"])'
    )
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    first?.focus()
    const trap = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key !== 'Tab') return
      if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); last?.focus() } }
      else             { if (document.activeElement === last)  { e.preventDefault(); first?.focus() } }
    }
    document.addEventListener('keydown', trap)
    return () => document.removeEventListener('keydown', trap)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 animate-fade-in"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        ref={ref}
        className={cn(
          'bg-[var(--surface-0)] rounded-xl border border-[var(--border-subtle)] shadow-xl w-full animate-fade-up',
          wide ? 'max-w-lg' : 'max-w-md'
        )}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-subtle)]">
          <h2 className="text-[15px] font-medium">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="text-[var(--ink-3)] hover:text-[var(--ink)] transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="p-5 flex flex-col gap-4">{children}</div>
        {footer && (
          <div className="px-5 py-3.5 border-t border-[var(--border-subtle)] flex justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

export function Field({
  label, error, children, hint,
}: { label: string; error?: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[12px] font-medium text-[var(--ink-2)]">{label}</label>
      {children}
      {hint && !error && <span className="text-[11px] text-[var(--ink-3)]">{hint}</span>}
      {error && <span className="text-[11px] text-red-500" role="alert">{error}</span>}
    </div>
  )
}

export const inputCls = [
  'w-full h-9 px-3 text-[13px] rounded-lg border border-[var(--border)] bg-[var(--surface-1)]',
  'text-[var(--ink)] outline-none transition-colors',
  'focus:border-accent focus:ring-1 focus:ring-accent/20',
  'placeholder:text-[var(--ink-3)]',
].join(' ')

export function Btn({ children, onClick, variant = 'primary', type = 'button', disabled, className }: {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'ghost' | 'danger'
  type?: 'button' | 'submit'
  disabled?: boolean
  className?: string
}) {
  const base = 'h-8 px-4 rounded-lg text-[13px] font-medium transition-all cursor-pointer disabled:opacity-50'
  const variants = {
    primary: 'bg-accent text-accent-fg hover:opacity-85',
    ghost: 'bg-[var(--surface-1)] border border-[var(--border)] text-[var(--ink-2)] hover:border-[var(--border)] hover:text-[var(--ink)]',
    danger: 'bg-red-50 text-red-700 hover:bg-red-100',
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cn(base, variants[variant], className)}>
      {children}
    </button>
  )
}
