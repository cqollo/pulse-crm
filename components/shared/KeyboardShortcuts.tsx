'use client'
import { useEffect } from 'react'
import { useCRM } from '@/store'
import { Modal } from './Modal'
import { Keyboard } from 'lucide-react'

const SHORTCUTS = [
  { keys: ['C'], desc: 'New contact' },
  { keys: ['D'], desc: 'New deal' },
  { keys: ['/', 'Cmd+K'], desc: 'Focus search' },
  { keys: ['Esc'], desc: 'Close panel / modal' },
  { keys: ['G', '1'], desc: 'Go to Dashboard' },
  { keys: ['G', '2'], desc: 'Go to Contacts' },
  { keys: ['G', '3'], desc: 'Go to Pipeline' },
  { keys: ['G', '4'], desc: 'Go to Activity' },
  { keys: ['G', '5'], desc: 'Go to Forecast' },
  { keys: ['G', '6'], desc: 'Go to Reminders' },
  { keys: ['N'], desc: 'Open notepad' },
  { keys: ['?'], desc: 'Show keyboard shortcuts' },
]

export function KeyboardShortcuts() {
  const {
    shortcutsOpen, setShortcutsOpen,
    openContactModal, openDealModal,
    setView, notepadOpen, setNotepadOpen,
    contactPanelId, closeContactPanel,
    dealPanelId, closeDealPanel,
    contactModalOpen, closeContactModal,
    dealModalOpen, closeDealModal,
  } = useCRM()

  useEffect(() => {
    let gPressed = false
    let gTimer: ReturnType<typeof setTimeout>

    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName
      const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)

      // Escape — close panels/modals
      if (e.key === 'Escape') {
        if (contactModalOpen) { closeContactModal(); return }
        if (dealModalOpen) { closeDealModal(); return }
        if (shortcutsOpen) { setShortcutsOpen(false); return }
        if (notepadOpen) { setNotepadOpen(false); return }
        if (contactPanelId) { closeContactPanel(); return }
        if (dealPanelId) { closeDealPanel(); return }
        return
      }

      if (isInput) return

      // G + number navigation
      if (e.key === 'g' || e.key === 'G') {
        gPressed = true
        clearTimeout(gTimer)
        gTimer = setTimeout(() => { gPressed = false }, 1000)
        return
      }
      if (gPressed) {
        const map: Record<string, Parameters<typeof setView>[0]> = {
          '1': 'dashboard', '2': 'contacts', '3': 'pipeline',
          '4': 'notes', '5': 'forecast', '6': 'reminders',
        }
        if (map[e.key]) { setView(map[e.key]); gPressed = false; return }
      }

      switch (e.key) {
        case 'c': case 'C': openContactModal(); break
        case 'd': case 'D': openDealModal(); break
        case 'n': case 'N': setNotepadOpen(!notepadOpen); break
        case '?': setShortcutsOpen(true); break
        case '/':
          e.preventDefault()
          document.querySelector<HTMLInputElement>('input[placeholder*="Search"]')?.focus()
          break
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [contactModalOpen, dealModalOpen, shortcutsOpen, notepadOpen, contactPanelId, dealPanelId])

  return (
    <Modal open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} title="Keyboard shortcuts">
      <div className="grid grid-cols-1 gap-1">
        {SHORTCUTS.map((s, i) => (
          <div key={i} className="flex items-center justify-between py-1.5 border-b border-[var(--border-subtle)] last:border-0">
            <span className="text-[13px] text-[var(--ink-2)]">{s.desc}</span>
            <div className="flex items-center gap-1">
              {s.keys.map((k, j) => (
                <span key={j}>
                  <kbd className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 text-[11px] font-mono font-medium bg-[var(--surface-1)] border border-[var(--border)] rounded text-[var(--ink-2)]">{k}</kbd>
                  {j < s.keys.length - 1 && <span className="text-[10px] text-[var(--ink-3)] mx-0.5">then</span>}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-[var(--ink-3)] mt-1">Shortcuts are disabled when typing in an input field.</p>
    </Modal>
  )
}

export function ShortcutsHint() {
  const { setShortcutsOpen } = useCRM()
  return (
    <button
      onClick={() => setShortcutsOpen(true)}
      title="Keyboard shortcuts (?)"
      aria-label="Keyboard shortcuts"
      className="w-10 h-10 flex items-center justify-center rounded-xl text-[var(--ink-3)] hover:text-[var(--ink)] hover:bg-[var(--surface-1)] transition-all"
    >
      <Keyboard size={16} />
    </button>
  )
}
