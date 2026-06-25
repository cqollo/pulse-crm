'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  Contact, Deal, ActivityItem, TeamMember, View, Stage, Status,
  CustomFieldDef, Reminder, AutomationRule, WebhookConfig, ApiKey, ThemeId,
} from '@/lib/types'
import { TEAM_COLORS, TEAM_BG, getInitials, nowStr } from '@/lib/utils'
import * as db from '@/lib/supabase/db'

interface UIState {
  view: View
  contactPanelId: string | null
  dealPanelId: string | null
  contactModalOpen: boolean
  dealModalOpen: boolean
  searchQuery: string
  activeFilter: Status | 'all'
  activeSort: 'name' | 'value' | 'status'
  sortDir: 1 | -1
  activeOwnerFilter: string
  activePipelineOwner: string
  toast: { msg: string; icon: string; err?: boolean } | null
  editContactId: string | null
  editDealId: string | null
  importModalOpen: boolean
  shortcutsOpen: boolean
}

interface CRMState extends UIState {
  // Core data
  contacts: Contact[]
  deals: Deal[]
  activity: ActivityItem[]
  team: TeamMember[]
  colorIdx: number
  workspaceId: string | null
  userId: string | null
  loaded: boolean
  obChecks: { c: boolean; d: boolean; e: boolean }
  bannerDismissed: boolean

  // New features
  customFields: CustomFieldDef[]
  reminders: Reminder[]
  automations: AutomationRule[]
  webhooks: WebhookConfig[]
  apiKeys: ApiKey[]
  themeId: ThemeId
  scratchpadContent: string
  notepadOpen: boolean

  // Bootstrap
  init: (userId: string, userName: string) => Promise<void>

  // UI
  setView: (v: View) => void
  openContactPanel: (id: string) => void
  closeContactPanel: () => void
  openDealPanel: (id: string) => void
  closeDealPanel: () => void
  openContactModal: (editId?: string) => void
  closeContactModal: () => void
  openDealModal: (editId?: string) => void
  closeDealModal: () => void
  openImportModal: () => void
  closeImportModal: () => void
  setSearch: (q: string) => void
  setFilter: (f: Status | 'all') => void
  setSort: (s: 'name' | 'value' | 'status') => void
  setOwnerFilter: (id: string) => void
  setPipelineOwner: (id: string) => void
  showToast: (msg: string, icon?: string, err?: boolean) => void
  dismissBanner: () => void
  updateObCheck: (key: 'c' | 'd' | 'e') => void
  setShortcutsOpen: (v: boolean) => void
  setNotepadOpen: (v: boolean) => void

  // Core data
  addContact: (c: Omit<Contact, 'id' | 'createdAt'>) => Promise<void>
  updateContact: (id: string, patch: Partial<Contact>) => Promise<void>
  deleteContact: (id: string) => Promise<void>
  addDeal: (d: Omit<Deal, 'id' | 'createdAt' | 'updatedAt' | 'history'>) => Promise<void>
  updateDeal: (id: string, patch: Partial<Deal>, historyEntry?: { type: Deal['history'][0]['type']; text: string }) => Promise<void>
  deleteDeal: (id: string) => Promise<void>
  moveDeal: (id: string, stage: Stage) => Promise<void>
  addTeamMember: (name: string, role: string, initials: string) => Promise<void>
  removeTeamMember: (id: string) => Promise<void>
  addActivity: (color: string, text: string) => Promise<void>
  importContacts: (contacts: Omit<Contact, 'id' | 'createdAt'>[]) => Promise<void>

  // Custom fields
  addCustomField: (field: Omit<CustomFieldDef, 'id'>) => void
  removeCustomField: (id: string) => void
  updateCustomField: (id: string, patch: Partial<CustomFieldDef>) => void

  // Reminders
  addReminder: (r: Omit<Reminder, 'id' | 'createdAt' | 'done'>) => void
  toggleReminder: (id: string) => void
  deleteReminder: (id: string) => void

  // Automations
  addAutomation: (a: Omit<AutomationRule, 'id' | 'createdAt' | 'runCount'>) => void
  toggleAutomation: (id: string) => void
  deleteAutomation: (id: string) => void
  runAutomation: (rule: AutomationRule, context: Record<string, string>) => void

  // Webhooks & API
  addWebhook: (url: string, events: string[]) => void
  removeWebhook: (id: string) => void
  toggleWebhook: (id: string) => void
  generateApiKey: (name: string) => ApiKey
  revokeApiKey: (id: string) => void

  // Theme
  setTheme: (id: ThemeId) => void

  // Scratchpad
  setScratchpad: (content: string) => void
}

// ─── Automation runner ────────────────────────────────────────────────────────
function shouldRunAutomation(rule: AutomationRule, trigger: string, context: Record<string, string>): boolean {
  if (!rule.enabled || rule.trigger !== trigger) return false
  if (rule.triggerValue && rule.triggerValue !== context.value) return false
  return true
}

export const useCRM = create<CRMState>()(
  persist(
    (set, get) => ({
      // UI state
      view: 'dashboard',
      contactPanelId: null,
      dealPanelId: null,
      contactModalOpen: false,
      dealModalOpen: false,
      searchQuery: '',
      activeFilter: 'all',
      activeSort: 'name',
      sortDir: 1,
      activeOwnerFilter: 'all',
      activePipelineOwner: 'all',
      toast: null,
      editContactId: null,
      editDealId: null,
      importModalOpen: false,
      shortcutsOpen: false,
      notepadOpen: false,

      // Data state
      contacts: [],
      deals: [],
      activity: [],
      team: [],
      colorIdx: 0,
      workspaceId: null,
      userId: null,
      loaded: false,
      obChecks: { c: false, d: false, e: false },
      bannerDismissed: false,

      // Feature state
      customFields: [],
      reminders: [],
      automations: [],
      webhooks: [],
      apiKeys: [],
      themeId: 'default',
      scratchpadContent: '',

      // ── Bootstrap ──────────────────────────────────────────────────────────
      init: async (userId, userName) => {
        console.log('[CRM] init start — userId:', userId, 'userName:', userName)
        const workspaceId = await db.fetchOrCreateWorkspace(userId, userName)
        console.log('[CRM] workspaceId:', workspaceId)
        if (!workspaceId) {
          console.error('[CRM] No workspaceId — aborting init')
          return
        }
        const [contacts, deals, team, activity] = await Promise.all([
          db.fetchContacts(workspaceId),
          db.fetchDeals(workspaceId),
          db.fetchTeam(workspaceId),
          db.fetchActivity(workspaceId),
        ])
        console.log('[CRM] loaded —', contacts.length, 'contacts,', deals.length, 'deals,', team.length, 'team members')
        set({ workspaceId, userId, contacts, deals, team, activity, colorIdx: contacts.length + deals.length, loaded: true })
      },

      // ── UI ─────────────────────────────────────────────────────────────────
      setView: (view) => set({ view, contactPanelId: null, dealPanelId: null, searchQuery: '' }),
      openContactPanel: (id) => set({ contactPanelId: id, dealPanelId: null }),
      closeContactPanel: () => set({ contactPanelId: null }),
      openDealPanel: (id) => set({ dealPanelId: id, contactPanelId: null }),
      closeDealPanel: () => set({ dealPanelId: null }),
      openContactModal: (editId) => set({ contactModalOpen: true, editContactId: editId ?? null }),
      closeContactModal: () => set({ contactModalOpen: false, editContactId: null }),
      openDealModal: (editId) => set({ dealModalOpen: true, editDealId: editId ?? null }),
      closeDealModal: () => set({ dealModalOpen: false, editDealId: null }),
      openImportModal: () => set({ importModalOpen: true }),
      closeImportModal: () => set({ importModalOpen: false }),
      setSearch: (searchQuery) => set({ searchQuery }),
      setFilter: (activeFilter) => set({ activeFilter }),
      setSort: (s) => {
        const { activeSort, sortDir } = get()
        if (activeSort === s) set({ sortDir: (sortDir * -1) as 1 | -1 })
        else set({ activeSort: s, sortDir: 1 })
      },
      setOwnerFilter: (activeOwnerFilter) => set({ activeOwnerFilter }),
      setPipelineOwner: (activePipelineOwner) => set({ activePipelineOwner }),
      showToast: (msg, icon = 'check', err = false) => {
        set({ toast: { msg, icon, err } })
        setTimeout(() => set({ toast: null }), 2800)
      },
      dismissBanner: () => set({ bannerDismissed: true }),
      updateObCheck: (key) => set(s => ({ obChecks: { ...s.obChecks, [key]: true } })),
      setShortcutsOpen: (v) => set({ shortcutsOpen: v }),
      setNotepadOpen: (v) => set({ notepadOpen: v }),

      // ── Contacts ───────────────────────────────────────────────────────────
      addContact: async (data) => {
        const { workspaceId, team, colorIdx, automations } = get()
        if (!workspaceId) return
        try {
          const inserted = await db.insertContact(workspaceId, { ...data, colorIdx: colorIdx % 7 })
          if (!inserted) return
          const owner = team.find(m => m.id === inserted.ownerId)
          set(s => ({ contacts: [inserted, ...s.contacts], colorIdx: s.colorIdx + 1, obChecks: { ...s.obChecks, c: true } }))
          await get().addActivity('#185FA5', `${inserted.fname} ${inserted.lname} added${owner ? ' by ' + owner.name : ''}`)
          get().showToast(`${inserted.fname} ${inserted.lname} added`, 'user-plus')
          automations.forEach(rule => {
            if (shouldRunAutomation(rule, 'contact_created', {})) get().runAutomation(rule, { entityId: inserted.id, entityName: `${inserted.fname} ${inserted.lname}` })
          })
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : String(e)
          console.error('addContact failed:', msg)
          get().showToast('Failed to save: ' + (msg.includes('does not exist') ? 'Run supabase/schema.sql in your Supabase SQL editor first.' : msg), 'alert-circle', true)
        }
      },

      updateContact: async (id, patch) => {
        const { workspaceId, automations } = get()
        if (!workspaceId) return
        await db.upsertContact(workspaceId, id, patch)
        set(s => ({ contacts: s.contacts.map(c => c.id === id ? { ...c, ...patch } : c) }))
        if (patch.status) {
          const c = get().contacts.find(x => x.id === id)
          automations.forEach(rule => {
            if (shouldRunAutomation(rule, 'contact_status_changed', { value: patch.status! }))
              get().runAutomation(rule, { entityId: id, entityName: c ? `${c.fname} ${c.lname}` : id })
          })
        }
      },

      deleteContact: async (id) => {
        const { workspaceId } = get()
        if (!workspaceId) return
        const c = get().contacts.find(x => x.id === id)
        await db.removeContact(workspaceId, id)
        set(s => ({ contacts: s.contacts.filter(x => x.id !== id), contactPanelId: null }))
        if (c) await get().addActivity('#A32D2D', `${c.fname} ${c.lname} deleted`)
        get().showToast('Contact deleted', 'trash')
      },

      // ── Deals ──────────────────────────────────────────────────────────────
      addDeal: async (data) => {
        const { workspaceId, team, colorIdx, automations } = get()
        if (!workspaceId) return
        try {
          const owner = team.find(m => m.id === data.ownerId)
          const inserted = await db.insertDeal(workspaceId, {
            ...data, colorIdx: colorIdx % 7,
            history: [{ type: 'created', text: `Deal created in ${data.stage}${owner ? ' by ' + owner.name : ''}`, time: nowStr() }],
          })
          if (!inserted) return
          set(s => ({ deals: [...s.deals, inserted], colorIdx: s.colorIdx + 1, obChecks: { ...s.obChecks, d: true } }))
          await get().addActivity('#534AB7', `Deal "${inserted.title}" added to ${inserted.stage}`)
          get().showToast(`${inserted.title} added`, 'check')
          automations.forEach(rule => {
            if (shouldRunAutomation(rule, 'deal_created', {})) get().runAutomation(rule, { entityId: inserted.id, entityName: inserted.title })
          })
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : String(e)
          console.error('addDeal failed:', msg)
          get().showToast('Failed to save: ' + (msg.includes('does not exist') ? 'Run supabase/schema.sql in your Supabase SQL editor first.' : msg), 'alert-circle', true)
        }
      },

      updateDeal: async (id, patch, historyEntry) => {
        const { workspaceId } = get()
        if (!workspaceId) return
        const existing = get().deals.find(d => d.id === id)
        if (!existing) return
        const history = historyEntry ? [...existing.history, { ...historyEntry, time: nowStr() }] : existing.history
        const updated = { ...patch, history }
        await db.upsertDeal(workspaceId, id, updated)
        set(s => ({ deals: s.deals.map(d => d.id === id ? { ...d, ...updated, updatedAt: nowStr() } : d) }))
      },

      deleteDeal: async (id) => {
        const { workspaceId } = get()
        if (!workspaceId) return
        const d = get().deals.find(x => x.id === id)
        await db.removeDeal(workspaceId, id)
        set(s => ({ deals: s.deals.filter(x => x.id !== id), dealPanelId: null }))
        if (d) await get().addActivity('#A32D2D', `Deal "${d.title}" deleted`)
        get().showToast('Deal deleted', 'trash')
      },

      moveDeal: async (id, stage) => {
        const { automations } = get()
        const d = get().deals.find(x => x.id === id)
        if (!d || d.stage === stage) return
        await get().updateDeal(id, { stage }, { type: 'stage', text: `Moved ${d.stage} → ${stage}` })
        await get().addActivity('#534AB7', `Deal "${d.title}" moved to ${stage}`)
        automations.forEach(rule => {
          if (shouldRunAutomation(rule, 'deal_stage_changed', { value: stage })) get().runAutomation(rule, { entityId: id, entityName: d.title })
        })
      },

      addTeamMember: async (name, role, initials) => {
        const { workspaceId, team } = get()
        if (!workspaceId) return
        const idx = team.length % TEAM_COLORS.length
        const member = { name, role, initials: initials || getInitials(name, name.split(' ')[1] ?? ''), color: TEAM_COLORS[idx], bg: TEAM_BG[idx], isMe: false }
        const inserted = await db.insertTeamMember(workspaceId, member)
        if (!inserted) return
        set(s => ({ team: [...s.team, inserted] }))
        get().showToast(`${name} added to team`, 'user-plus')
      },

      removeTeamMember: async (id) => {
        const { workspaceId } = get()
        if (!workspaceId) return
        const m = get().team.find(x => x.id === id)
        await db.removeTeamMember(workspaceId, id)
        set(s => ({ team: s.team.filter(x => x.id !== id), contacts: s.contacts.map(c => c.ownerId === id ? { ...c, ownerId: null } : c), deals: s.deals.map(d => d.ownerId === id ? { ...d, ownerId: null } : d) }))
        if (m) get().showToast(`${m.name} removed`, 'trash')
      },

      addActivity: async (color, text) => {
        const { workspaceId } = get()
        if (!workspaceId) return
        const item: ActivityItem = { id: Date.now().toString(), color, text, time: 'Just now' }
        set(s => ({ activity: [item, ...s.activity].slice(0, 20) }))
        await db.insertActivity(workspaceId, color, text, 'Just now')
      },

      importContacts: async (data) => {
        const { workspaceId, colorIdx } = get()
        if (!workspaceId) return
        let ci = colorIdx
        const inserted: Contact[] = []
        for (const c of data) {
          const result = await db.insertContact(workspaceId, { ...c, colorIdx: (ci++) % 7 })
          if (result) inserted.push(result)
        }
        set(s => ({ contacts: [...s.contacts, ...inserted], colorIdx: ci, obChecks: { ...s.obChecks, c: true } }))
        await get().addActivity('#185FA5', `Imported ${inserted.length} contacts via CSV`)
        get().showToast(`${inserted.length} contacts imported`, 'users')
      },

      // ── Custom fields ──────────────────────────────────────────────────────
      addCustomField: (field) => {
        const f: CustomFieldDef = { ...field, id: 'cf_' + Date.now() }
        set(s => ({ customFields: [...s.customFields, f] }))
        get().showToast(`Field "${field.label}" added`, 'check')
      },
      removeCustomField: (id) => set(s => ({ customFields: s.customFields.filter(f => f.id !== id) })),
      updateCustomField: (id, patch) => set(s => ({ customFields: s.customFields.map(f => f.id === id ? { ...f, ...patch } : f) })),

      // ── Reminders ──────────────────────────────────────────────────────────
      addReminder: (r) => {
        const reminder: Reminder = { ...r, id: 'rem_' + Date.now(), done: false, createdAt: nowStr() }
        set(s => ({ reminders: [...s.reminders, reminder] }))
        get().showToast('Reminder set', 'check')
      },
      toggleReminder: (id) => set(s => ({ reminders: s.reminders.map(r => r.id === id ? { ...r, done: !r.done } : r) })),
      deleteReminder: (id) => set(s => ({ reminders: s.reminders.filter(r => r.id !== id) })),

      // ── Automations ────────────────────────────────────────────────────────
      addAutomation: (a) => {
        const rule: AutomationRule = { ...a, id: 'auto_' + Date.now(), createdAt: nowStr(), runCount: 0 }
        set(s => ({ automations: [...s.automations, rule] }))
        get().showToast(`Automation "${a.name}" created`, 'check')
      },
      toggleAutomation: (id) => set(s => ({ automations: s.automations.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a) })),
      deleteAutomation: (id) => set(s => ({ automations: s.automations.filter(a => a.id !== id) })),
      runAutomation: (rule, context) => {
        const { team, addReminder } = get()
        const me = team.find(m => m.isMe)
        if (rule.action === 'assign_to_me' && me && context.entityId) {
          // handled per entity type externally
        }
        if (rule.action === 'add_tag' && rule.actionValue && context.entityId) {
          const contacts = get().contacts
          const contact = contacts.find(c => c.id === context.entityId)
          if (contact && !contact.tags.includes(rule.actionValue)) {
            get().updateContact(context.entityId, { tags: [...contact.tags, rule.actionValue] })
          }
        }
        if (rule.action === 'create_reminder' && context.entityId) {
          const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1)
          addReminder({ entityType: 'contact', entityId: context.entityId, entityName: context.entityName || '', note: rule.actionValue || 'Follow up', dueDate: tomorrow.toISOString().slice(0, 10) })
        }
        if (rule.action === 'send_webhook' && rule.actionValue) {
          fetch(rule.actionValue, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ rule: rule.name, trigger: rule.trigger, context, timestamp: new Date().toISOString() }) }).catch(() => {})
        }
        set(s => ({ automations: s.automations.map(a => a.id === rule.id ? { ...a, runCount: a.runCount + 1 } : a) }))
      },

      // ── Webhooks & API ─────────────────────────────────────────────────────
      addWebhook: (url, events) => {
        const w: WebhookConfig = { id: 'wh_' + Date.now(), url, events, enabled: true, createdAt: nowStr() }
        set(s => ({ webhooks: [...s.webhooks, w] }))
        get().showToast('Webhook added', 'check')
      },
      removeWebhook: (id) => set(s => ({ webhooks: s.webhooks.filter(w => w.id !== id) })),
      toggleWebhook: (id) => set(s => ({ webhooks: s.webhooks.map(w => w.id === id ? { ...w, enabled: !w.enabled } : w) })),
      generateApiKey: (name) => {
        const raw = 'pk_live_' + Array.from(crypto.getRandomValues(new Uint8Array(24))).map(b => b.toString(16).padStart(2, '0')).join('')
        const masked = raw.slice(0, 12) + '••••••••' + raw.slice(-4)
        const key: ApiKey = { id: 'key_' + Date.now(), name, key: raw, maskedKey: masked, createdAt: nowStr() }
        set(s => ({ apiKeys: [...s.apiKeys, key] }))
        get().showToast('API key generated', 'check')
        return key
      },
      revokeApiKey: (id) => {
        set(s => ({ apiKeys: s.apiKeys.filter(k => k.id !== id) }))
        get().showToast('API key revoked', 'trash')
      },

      // ── Theme ──────────────────────────────────────────────────────────────
      setTheme: (themeId) => set({ themeId }),

      // ── Scratchpad ─────────────────────────────────────────────────────────
      setScratchpad: (scratchpadContent) => set({ scratchpadContent }),
    }),
    {
      name: 'pulse-crm-v2',
      partialize: (s) => ({
        customFields: s.customFields,
        reminders: s.reminders,
        automations: s.automations,
        webhooks: s.webhooks,
        apiKeys: s.apiKeys,
        themeId: s.themeId,
        scratchpadContent: s.scratchpadContent,
        obChecks: s.obChecks,
        bannerDismissed: s.bannerDismissed,
      }),
    }
  )
)
