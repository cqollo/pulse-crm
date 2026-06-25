'use client'
import { useEffect } from 'react'
import { useCRM } from '@/store'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { applyTheme, getTheme } from '@/lib/themes'
import {
  LayoutDashboard, Users, Columns3,
  Inbox, Settings, LogOut, Check, X, Building2
} from 'lucide-react'

// Views
import { Dashboard } from './dashboard/Dashboard'
import { ContactList } from './contacts/ContactList'
import { PipelineBoard } from './pipeline/PipelineBoard'
import { InboxView } from './dashboard/InboxView'
import { ImportExportView } from './dashboard/ImportExportView'
import { SettingsView } from './settings/SettingsView'

// Panels & Modals
import { ContactPanel } from './panels/ContactPanel'
import { DealPanel } from './panels/DealPanel'
import { ContactModal } from './modals/ContactModal'
import { DealModal } from './modals/DealModal'
import { ImportModal } from './modals/ImportModal'

// Shared
import { Toast } from './shared/Toast'
import { TeamAvatar } from './shared/Avatar'
import { KeyboardShortcuts, ShortcutsHint } from './shared/KeyboardShortcuts'
import { Notepad } from './notepad/Notepad'
import { TrialBanner } from './shared/TrialBanner'
import { cn } from '@/lib/utils'
import type { View } from '@/lib/types'

const NAV_ITEMS: { view: View; icon: React.ReactNode; label: string }[] = [
  { view: 'dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
  { view: 'contacts',  icon: <Users size={18} />,           label: 'Contacts' },
  { view: 'pipeline',  icon: <Columns3 size={18} />,        label: 'Pipeline & Forecast' },
  { view: 'notes',     icon: <Inbox size={18} />,           label: 'Inbox' },
]

const VIEW_LABELS: Record<View, string> = {
  dashboard:     'Dashboard',
  contacts:      'Contacts',
  pipeline:      'Pipeline',
  notes:         'Inbox',
  'import-export': 'Import & Export',
  team:          'Team',
  automations:   'Automations',
  forecast:      'Forecast',
  notepad:       'Notepad',
  reminders:     'Reminders',
  settings:      'Settings',
}

function OnboardingBanner() {
  const { obChecks, bannerDismissed, dismissBanner, openContactModal, openDealModal, setView } = useCRM()
  if (bannerDismissed) return null
  const steps = [
    { key: 'c' as const, label: 'Add your first contact', done: obChecks.c, action: () => openContactModal() },
    { key: 'd' as const, label: 'Create a deal',          done: obChecks.d, action: () => openDealModal() },
    { key: 'e' as const, label: 'Draft an AI email',      done: obChecks.e, action: () => setView('contacts') },
  ]
  const doneCount = Object.values(obChecks).filter(Boolean).length
  if (doneCount === 3) return null
  return (
    <div className="bg-accent text-accent-fg rounded-xl p-4 flex items-center gap-4 flex-wrap">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[13px] font-medium">Complete your setup</span>
          <span className="text-[11px] opacity-60">{doneCount} of 3 done</span>
          <div className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white/70 rounded-full transition-all" style={{ width: `${(doneCount / 3) * 100}%` }} />
          </div>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          {steps.map(s => (
            <button key={s.key} onClick={s.action}
              className={cn('flex items-center gap-1.5 text-[12px] transition-all', s.done ? 'opacity-50 line-through' : 'hover:opacity-80')}>
              <div className={cn('w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0',
                s.done ? 'bg-white border-white' : 'border-white/50')}>
                {s.done && <Check size={10} className="text-accent" />}
              </div>
              {s.label}
            </button>
          ))}
        </div>
      </div>
      <button onClick={dismissBanner} aria-label="Dismiss" className="opacity-60 hover:opacity-100 transition-opacity flex-shrink-0">
        <X size={16} />
      </button>
    </div>
  )
}

function RemindersBadge() {
  const { reminders } = useCRM()
  const today = new Date().toISOString().slice(0, 10)
  const overdue = reminders.filter(r => !r.done && r.dueDate < today).length
  if (!overdue) return null
  return (
    <span className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center bg-red-500 text-white text-[9px] font-bold rounded-full">
      {overdue > 9 ? '9+' : overdue}
    </span>
  )
}

export default function CRMShell() {
  const { view, setView, team, themeId } = useCRM()
  const me = team.find(m => m.isMe)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => { applyTheme(getTheme(themeId)) }, [themeId])

  const signOut = async () => {
    await supabase.auth.signOut()
    router.replace('/auth/login')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--surface-2)]">
      {/* Sidebar — 5 items max */}
      <nav className="w-14 flex flex-col items-center py-4 gap-1 bg-[var(--surface-0)] border-r border-[var(--border-subtle)] flex-shrink-0" aria-label="Main navigation">
        <div className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center text-accent-fg text-[13px] font-bold mb-3 flex-shrink-0">P</div>

        {NAV_ITEMS.map(item => (
          <button
            key={item.view}
            onClick={() => setView(item.view)}
            aria-label={item.label}
            aria-current={view === item.view ? 'page' : undefined}
            title={item.label}
            className={cn(
              'w-10 h-10 flex items-center justify-center rounded-xl transition-all relative',
              view === item.view
                ? 'bg-accent text-accent-fg'
                : 'text-[var(--ink-3)] hover:text-[var(--ink)] hover:bg-[var(--surface-1)]'
            )}
          >
            {item.icon}
            {item.view === 'notes' && <RemindersBadge />}
          </button>
        ))}

        <div className="flex-1" />
        <ShortcutsHint />
        {me && (
          <button
            onClick={() => setView('settings')}
            title="Settings"
            aria-label="Settings"
            className={cn(
              'w-10 h-10 flex items-center justify-center rounded-xl transition-all',
              view === 'settings'
                ? 'bg-accent text-accent-fg'
                : 'text-[var(--ink-3)] hover:text-[var(--ink)] hover:bg-[var(--surface-1)]'
            )}
          >
            <TeamAvatar {...me} size="sm" />
          </button>
        )}
        <button onClick={signOut} title="Sign out" aria-label="Sign out"
          className="w-10 h-10 flex items-center justify-center rounded-xl text-[var(--ink-3)] hover:text-[var(--ink)] hover:bg-[var(--surface-1)] transition-all mt-1">
          <LogOut size={16} />
        </button>
      </nav>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <TrialBanner />
        <header className="h-12 border-b border-[var(--border-subtle)] bg-[var(--surface-0)] flex items-center px-5 gap-3 flex-shrink-0">
          <h1 className="text-[15px] font-medium">{VIEW_LABELS[view]}</h1>
          <div className="flex-1" />
          {me && (
            <div className="flex items-center gap-2">
              <TeamAvatar {...me} size="sm" />
              <span className="text-[12px] text-[var(--ink-2)]">{me.name}</span>
            </div>
          )}
        </header>

        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
          <OnboardingBanner />
          {view === 'dashboard' && <Dashboard />}
          {view === 'contacts'  && <ContactList />}
          {view === 'pipeline'  && <PipelineBoard />}
          {view === 'notes'     && <InboxView />}
          {view === 'settings'  && <SettingsView />}
          {/* Legacy routes still accessible via keyboard shortcuts */}
          {view === 'forecast'      && <></>}
          {view === 'reminders'     && <></>}
          {view === 'automations'   && <></>}
          {view === 'import-export' && <ImportExportView />}
          {view === 'team'          && <></>}
        </div>
      </main>

      <ContactPanel />
      <DealPanel />
      <ContactModal />
      <DealModal />
      <ImportModal />
      <KeyboardShortcuts />
      <Notepad />
      <Toast />
    </div>
  )
}
