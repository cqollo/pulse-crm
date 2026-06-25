'use client'
import { useEffect, useRef } from 'react'
import { useCRM } from '@/store'
import { X, StickyNote } from 'lucide-react'

export function Notepad() {
  const { notepadOpen, setNotepadOpen, scratchpadContent, setScratchpad } = useCRM()
  const ref = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (notepadOpen) setTimeout(() => ref.current?.focus(), 80)
  }, [notepadOpen])

  if (!notepadOpen) return null

  return (
    <div className="fixed bottom-5 right-5 z-50 w-80 bg-[var(--surface-0)] border border-[var(--border)] rounded-2xl shadow-2xl flex flex-col animate-fade-up overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2 text-[13px] font-medium">
          <StickyNote size={14} className="text-[var(--ink-3)]" />
          Notepad
        </div>
        <button onClick={() => setNotepadOpen(false)} aria-label="Close notepad"
          className="text-[var(--ink-3)] hover:text-[var(--ink)] transition-colors">
          <X size={15} />
        </button>
      </div>
      <textarea
        ref={ref}
        value={scratchpadContent}
        onChange={e => setScratchpad(e.target.value)}
        placeholder="Jot anything down… notes, ideas, to-dos."
        className="flex-1 resize-none p-4 text-[13px] bg-transparent text-[var(--ink)] placeholder:text-[var(--ink-3)] outline-none leading-relaxed min-h-[220px]"
      />
      <div className="px-4 py-2 border-t border-[var(--border-subtle)] text-[11px] text-[var(--ink-3)] flex justify-between">
        <span>Auto-saved</span>
        <span>{scratchpadContent.length} chars</span>
      </div>
    </div>
  )
}

export function EntityNote({ note, onChange }: { note: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="text-[11px] font-medium uppercase tracking-wide text-[var(--ink-3)]">Notes</div>
      <textarea
        value={note}
        onChange={e => onChange(e.target.value)}
        placeholder="Add a note…"
        rows={4}
        className="w-full px-3 py-2 text-[13px] rounded-xl border border-[var(--border)] bg-[var(--surface-1)] text-[var(--ink)] placeholder:text-[var(--ink-3)] outline-none focus:border-accent leading-relaxed resize-none transition-colors"
      />
    </div>
  )
}
