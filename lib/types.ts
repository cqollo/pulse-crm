export type Status = 'hot' | 'warm' | 'cold' | 'customer'
export type Stage = 'Lead' | 'Qualified' | 'Proposal' | 'Negotiation'

export interface TeamMember {
  id: string
  name: string
  initials: string
  role: string
  color: string
  bg: string
  isMe: boolean
}

export interface Contact {
  id: string
  fname: string
  lname: string
  email: string
  role: string
  company: string
  status: Status
  value: string
  phone: string
  linkedin: string
  tags: string[]
  ownerId: string | null
  colorIdx: number
  createdAt: string
  notes?: string
  customFields?: Record<string, string>
}

export interface DealHistoryEntry {
  type: 'created' | 'stage' | 'edit'
  text: string
  time: string
}

export interface Deal {
  id: string
  title: string
  company: string
  value: string
  prob: string
  stage: Stage
  ownerId: string | null
  colorIdx: number
  createdAt: string
  updatedAt: string
  history: DealHistoryEntry[]
  notes?: string
  customFields?: Record<string, string>
  closeDate?: string
}

export interface ActivityItem {
  id: string
  color: string
  text: string
  time: string
}

export type View = 'dashboard' | 'contacts' | 'pipeline' | 'notes' | 'import-export' | 'team' | 'automations' | 'forecast' | 'notepad' | 'reminders' | 'settings'

// ─── Custom Fields ────────────────────────────────────────────
export type FieldType = 'text' | 'number' | 'date' | 'select'
export interface CustomFieldDef {
  id: string
  label: string
  type: FieldType
  entity: 'contact' | 'deal'
  options?: string[]  // for select type
}

// ─── Reminders ────────────────────────────────────────────────
export interface Reminder {
  id: string
  entityType: 'contact' | 'deal'
  entityId: string
  entityName: string
  note: string
  dueDate: string  // ISO date string
  done: boolean
  createdAt: string
}

// ─── Automations ─────────────────────────────────────────────
export type AutoTrigger = 'contact_status_changed' | 'deal_stage_changed' | 'deal_created' | 'contact_created'
export type AutoAction = 'assign_to_me' | 'add_tag' | 'send_webhook' | 'create_reminder'

export interface AutomationRule {
  id: string
  name: string
  enabled: boolean
  trigger: AutoTrigger
  triggerValue?: string   // e.g. specific status or stage
  action: AutoAction
  actionValue?: string    // e.g. tag name, webhook url, reminder note
  createdAt: string
  runCount: number
}

// ─── Webhooks / API ──────────────────────────────────────────
export interface WebhookConfig {
  id: string
  url: string
  events: string[]
  enabled: boolean
  createdAt: string
}

export interface ApiKey {
  id: string
  name: string
  key: string           // shown once on creation
  maskedKey: string     // pk_live_••••••••xxxx
  createdAt: string
  lastUsed?: string
}

// ─── Themes ───────────────────────────────────────────────────
export type ThemeId = 'default' | 'midnight' | 'forest' | 'rose' | 'slate' | 'amber'

export interface Theme {
  id: ThemeId
  name: string
  surface0: string
  surface1: string
  surface2: string
  border: string
  borderSubtle: string
  ink: string
  ink2: string
  ink3: string
  accent: string
  accentFg: string
}
