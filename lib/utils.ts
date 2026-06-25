import { type ClassValue, clsx as clsxBase } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsxBase(inputs)
}

export const AVATAR_COLORS: [string, string][] = [
  ['#EEEDFE', '#534AB7'],
  ['#E1F5EE', '#0F6E56'],
  ['#FAECE7', '#993C1D'],
  ['#E6F1FB', '#185FA5'],
  ['#FBEAF0', '#993556'],
  ['#FAEEDA', '#854F0B'],
  ['#EAF3DE', '#3B6D11'],
]

export const TAG_PALETTE = [
  { bg: '#F0E6FB', fg: '#7C3AED' },
  { bg: '#FDE8F0', fg: '#BE185D' },
  { bg: '#E0F2FE', fg: '#0369A1' },
  { bg: '#ECFDF5', fg: '#065F46' },
  { bg: '#FFF7ED', fg: '#9A3412' },
  { bg: '#F0FDF4', fg: '#15803D' },
  { bg: '#EFF6FF', fg: '#1D4ED8' },
]

export const TEAM_COLORS = ['#534AB7','#0F6E56','#993C1D','#185FA5','#993556','#854F0B','#3B6D11']
export const TEAM_BG    = ['#EEEDFE','#E1F5EE','#FAECE7','#E6F1FB','#FBEAF0','#FAEEDA','#EAF3DE']

export const STATUS_LABEL: Record<string, string> = {
  hot: 'Hot', warm: 'Warm', cold: 'Cold', customer: 'Customer',
}

export const STATUS_CLASS: Record<string, string> = {
  hot: 'bg-red-100 text-red-700',
  warm: 'bg-amber-100 text-amber-700',
  cold: 'bg-blue-100 text-blue-700',
  customer: 'bg-green-100 text-green-700',
}

export const STAGE_CLASS: Record<string, string> = {
  Lead: 'bg-amber-100 text-amber-700',
  Qualified: 'bg-purple-100 text-purple-700',
  Proposal: 'bg-blue-100 text-blue-700',
  Negotiation: 'bg-green-100 text-green-700',
}

export const STAGES = ['Lead', 'Qualified', 'Proposal', 'Negotiation'] as const

export const SUGGESTED_TAGS = ['VIP', 'Decision Maker', 'Champion', 'Budget Holder', 'Influencer', 'Technical Lead']

export function getInitials(fname: string, lname: string) {
  return ((fname[0] ?? '') + (lname[0] ?? '')).toUpperCase()
}

export function getAvatarColor(idx: number): [string, string] {
  return AVATAR_COLORS[idx % AVATAR_COLORS.length]
}

export function getTagColor(tag: string) {
  let h = 0
  for (let i = 0; i < tag.length; i++) h = (h * 31 + tag.charCodeAt(i)) >>> 0
  return TAG_PALETTE[h % TAG_PALETTE.length]
}

export function nowStr() {
  return new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function parseValue(v: string): number {
  const n = parseFloat((v || '0').replace(/[^0-9.]/g, ''))
  const m = (v || '').toLowerCase().includes('k') ? 1000 : 1
  return n * m
}

export function formatPipelineValue(deals: { value: string }[]): string {
  const total = deals.reduce((s, d) => s + parseValue(d.value), 0)
  if (total === 0) return '$0'
  if (total >= 1000000) return `$${(total / 1000000).toFixed(1)}M`
  if (total >= 1000) return `$${Math.round(total / 1000)}k`
  return `$${total}`
}
