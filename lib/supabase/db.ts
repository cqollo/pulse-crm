import { createClient } from './client'
import type { Contact, Deal, TeamMember, ActivityItem } from '@/lib/types'

const db = () => createClient()

// ─── Contacts ─────────────────────────────────────────────────────────────────

export async function fetchContacts(workspaceId: string): Promise<Contact[]> {
  const { data, error } = await db()
    .from('contacts')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })
  if (error) { console.error(error); return [] }
  return (data ?? []).map(rowToContact)
}

export async function insertContact(workspaceId: string, c: Omit<Contact, 'id' | 'createdAt'>): Promise<Contact | null> {
  const { data, error } = await db().from('contacts').insert({
    workspace_id: workspaceId,
    fname: c.fname, lname: c.lname, email: c.email,
    role: c.role, company: c.company, status: c.status,
    value: c.value, phone: c.phone, linkedin: c.linkedin,
    tags: c.tags ?? [], owner_id: c.ownerId ?? null,
    color_idx: c.colorIdx, notes: c.notes ?? '',
    custom_fields: c.customFields ?? {},
  }).select().single()
  if (error) { console.error('insertContact error:', error); throw new Error(error.message) }
  return rowToContact(data)
}

export async function upsertContact(workspaceId: string, id: string, patch: Partial<Contact>): Promise<void> {
  const row: Record<string, unknown> = { workspace_id: workspaceId }
  if (patch.fname !== undefined) row.fname = patch.fname
  if (patch.lname !== undefined) row.lname = patch.lname
  if (patch.email !== undefined) row.email = patch.email
  if (patch.role !== undefined) row.role = patch.role
  if (patch.company !== undefined) row.company = patch.company
  if (patch.status !== undefined) row.status = patch.status
  if (patch.value !== undefined) row.value = patch.value
  if (patch.phone !== undefined) row.phone = patch.phone
  if (patch.linkedin !== undefined) row.linkedin = patch.linkedin
  if (patch.tags !== undefined) row.tags = patch.tags
  if (patch.ownerId !== undefined) row.owner_id = patch.ownerId
  if (patch.notes !== undefined) row.notes = patch.notes
  if (patch.customFields !== undefined) row.custom_fields = patch.customFields
  const { error } = await db().from('contacts').update(row).eq('id', id).eq('workspace_id', workspaceId)
  if (error) console.error(error)
}

export async function removeContact(workspaceId: string, id: string): Promise<void> {
  const { error } = await db().from('contacts').delete().eq('id', id).eq('workspace_id', workspaceId)
  if (error) console.error(error)
}

// ─── Deals ────────────────────────────────────────────────────────────────────

export async function fetchDeals(workspaceId: string): Promise<Deal[]> {
  const { data, error } = await db()
    .from('deals')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: true })
  if (error) { console.error(error); return [] }
  return (data ?? []).map(rowToDeal)
}

export async function insertDeal(workspaceId: string, d: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>): Promise<Deal | null> {
  const { data, error } = await db().from('deals').insert({
    workspace_id: workspaceId,
    title: d.title, company: d.company, value: d.value,
    prob: d.prob, stage: d.stage, owner_id: d.ownerId ?? null,
    color_idx: d.colorIdx, history: d.history ?? [],
    notes: d.notes ?? '', custom_fields: d.customFields ?? {},
  }).select().single()
  if (error) { console.error('insertDeal error:', error); throw new Error(error.message) }
  return rowToDeal(data)
}

export async function upsertDeal(workspaceId: string, id: string, patch: Partial<Deal>): Promise<void> {
  const row: Record<string, unknown> = { workspace_id: workspaceId, updated_at: new Date().toISOString() }
  if (patch.title !== undefined) row.title = patch.title
  if (patch.company !== undefined) row.company = patch.company
  if (patch.value !== undefined) row.value = patch.value
  if (patch.prob !== undefined) row.prob = patch.prob
  if (patch.stage !== undefined) row.stage = patch.stage
  if (patch.ownerId !== undefined) row.owner_id = patch.ownerId
  if (patch.history !== undefined) row.history = patch.history
  if (patch.notes !== undefined) row.notes = patch.notes
  if (patch.customFields !== undefined) row.custom_fields = patch.customFields
  if (patch.closeDate !== undefined) row.close_date = patch.closeDate
  const { error } = await db().from('deals').update(row).eq('id', id).eq('workspace_id', workspaceId)
  if (error) console.error(error)
}

export async function removeDeal(workspaceId: string, id: string): Promise<void> {
  const { error } = await db().from('deals').delete().eq('id', id).eq('workspace_id', workspaceId)
  if (error) console.error(error)
}

// ─── Team ─────────────────────────────────────────────────────────────────────

export async function fetchTeam(workspaceId: string): Promise<TeamMember[]> {
  const { data, error } = await db()
    .from('team_members')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: true })
  if (error) { console.error(error); return [] }
  return (data ?? []).map(rowToMember)
}

export async function insertTeamMember(workspaceId: string, m: Omit<TeamMember, 'id'>): Promise<TeamMember | null> {
  const { data, error } = await db().from('team_members').insert({
    workspace_id: workspaceId,
    name: m.name, initials: m.initials, role: m.role,
    color: m.color, bg: m.bg, is_me: m.isMe,
  }).select().single()
  if (error) { console.error(error); return null }
  return rowToMember(data)
}

export async function removeTeamMember(workspaceId: string, id: string): Promise<void> {
  const { error } = await db().from('team_members').delete().eq('id', id).eq('workspace_id', workspaceId)
  if (error) console.error(error)
}

// ─── Activity ─────────────────────────────────────────────────────────────────

export async function fetchActivity(workspaceId: string): Promise<ActivityItem[]> {
  const { data, error } = await db()
    .from('activity')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })
    .limit(20)
  if (error) { console.error(error); return [] }
  return (data ?? []).map(r => ({ id: r.id, color: r.color, text: r.text, time: r.time }))
}

export async function insertActivity(workspaceId: string, color: string, text: string, time: string): Promise<void> {
  const { error } = await db().from('activity').insert({ workspace_id: workspaceId, color, text, time })
  if (error) console.error(error)
}

// ─── Workspace ────────────────────────────────────────────────────────────────

export async function fetchOrCreateWorkspace(userId: string, userName: string): Promise<string> {
  console.log('[DB] fetchOrCreateWorkspace — userId:', userId)

  const { data: existing, error: fetchError } = await db()
    .from('workspaces')
    .select('id')
    .eq('owner_id', userId)
    .maybeSingle()

  console.log('[DB] workspace fetch result:', { existing, fetchError })

  if (fetchError) console.error('fetchWorkspace error:', fetchError)
  if (existing) {
    console.log('[DB] found existing workspace:', existing.id)
    return existing.id
  }

  console.log('[DB] no workspace found — creating one')
  const { data: ws, error: createError } = await db()
    .from('workspaces')
    .insert({ owner_id: userId, name: `${userName}'s Workspace` })
    .select()
    .single()

  if (createError || !ws) {
    console.error('[DB] createWorkspace error:', createError)
    return ''
  }

  console.log('[DB] created workspace:', ws.id)
  await db().from('team_members').insert({
    workspace_id: ws.id,
    name: userName || 'You',
    initials: getInitials(userName),
    role: 'Account Executive',
    color: '#534AB7',
    bg: '#EEEDFE',
    is_me: true,
  })

  return ws.id
}

// ─── Row mappers ──────────────────────────────────────────────────────────────

function rowToContact(r: Record<string, unknown>): Contact {
  return {
    id: r.id as string,
    fname: r.fname as string,
    lname: r.lname as string,
    email: r.email as string,
    role: r.role as string,
    company: r.company as string,
    status: r.status as Contact['status'],
    value: r.value as string,
    phone: r.phone as string,
    linkedin: r.linkedin as string,
    tags: (r.tags as string[]) ?? [],
    ownerId: r.owner_id as string | null,
    colorIdx: r.color_idx as number,
    notes: (r.notes as string) || '',
    customFields: (r.custom_fields as Record<string, string>) ?? {},
    createdAt: new Date(r.created_at as string).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
  }
}

function rowToDeal(r: Record<string, unknown>): Deal {
  return {
    id: r.id as string,
    title: r.title as string,
    company: r.company as string,
    value: r.value as string,
    prob: r.prob as string,
    stage: r.stage as Deal['stage'],
    ownerId: r.owner_id as string | null,
    colorIdx: r.color_idx as number,
    history: (r.history as Deal['history']) ?? [],
    notes: (r.notes as string) || '',
    customFields: (r.custom_fields as Record<string, string>) ?? {},
    closeDate: r.close_date as string | undefined,
    createdAt: new Date(r.created_at as string).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    updatedAt: new Date(r.updated_at as string).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
  }
}

function rowToMember(r: Record<string, unknown>): TeamMember {
  return {
    id: r.id as string,
    name: r.name as string,
    initials: r.initials as string,
    role: r.role as string,
    color: r.color as string,
    bg: r.bg as string,
    isMe: r.is_me as boolean,
  }
}

function getInitials(name: string): string {
  const parts = name.trim().split(' ')
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || 'ME'
}
