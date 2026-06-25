'use client'
import { useState } from 'react'
import { useCRM } from '@/store'
import { Avatar } from '../shared/Avatar'
import { TeamAvatar } from '../shared/Avatar'
import { StatusBadge, Tag } from '../shared/Badge'
import { EmailModal } from '../modals/EmailModal'
import { EntityNote } from '../notepad/Notepad'
import { X, Mail, Trash2, Edit, Sparkles, Phone, Linkedin, Plus } from 'lucide-react'
import { cn, SUGGESTED_TAGS } from '@/lib/utils'

export function ContactPanel() {
  const { contactPanelId, closeContactPanel, contacts, team, openContactModal, deleteContact } = useCRM()
  const contact = contacts.find(c => c.id === contactPanelId)
  const [emailOpen, setEmailOpen] = useState(false)
  const [aiInsight, setAiInsight] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const { updateContact, showToast } = useCRM()
  const [tagInput, setTagInput] = useState('')
  const [showTagInput, setShowTagInput] = useState(false)

  if (!contactPanelId) return null

  const owner = contact ? team.find(m => m.id === contact.ownerId) : null

  const generateInsight = async () => {
    if (!contact) return
    setAiLoading(true); setAiInsight('')
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 300,
          messages: [{
            role: 'user',
            content: `Give a 2-sentence sales insight for ${contact.fname} ${contact.lname}, ${contact.role} at ${contact.company}. Status: ${contact.status}. Tags: ${(contact.tags||[]).join(', ')||'none'}. Value: ${contact.value||'unknown'}. Be specific and actionable. No preamble.`,
          }],
        }),
      })
      const data = await res.json()
      setAiInsight(data.content?.find((b: { type: string }) => b.type === 'text')?.text || 'No insight available.')
    } catch { setAiInsight('Unable to generate insight.') }
    finally { setAiLoading(false) }
  }

  const addTag = (tag: string) => {
    if (!contact || !tag.trim()) return
    const t = tag.trim()
    if ((contact.tags || []).includes(t)) return
    updateContact(contact.id, { tags: [...(contact.tags || []), t] })
    setTagInput(''); setShowTagInput(false)
    showToast(`Tag "${t}" added`, 'check')
  }

  const removeTag = (tag: string) => {
    if (!contact) return
    updateContact(contact.id, { tags: (contact.tags || []).filter(t => t !== tag) })
  }

  const confirmDelete = () => {
    if (!contact) return
    if (confirm(`Delete ${contact.fname} ${contact.lname}?`)) deleteContact(contact.id)
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-30 bg-black/20 animate-fade-in" onClick={closeContactPanel} aria-hidden />

      {/* Panel */}
      <aside
        aria-label={contact ? `${contact.fname} ${contact.lname} details` : 'Contact details'}
        className="fixed right-0 top-0 h-full w-full max-w-sm z-40 bg-[var(--surface-0)] border-l border-[var(--border-subtle)] shadow-2xl flex flex-col animate-slide-in overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-subtle)]">
          <span className="text-[13px] font-medium text-[var(--ink-2)]">Contact</span>
          <div className="flex items-center gap-1">
            {contact && (
              <>
                <button onClick={() => openContactModal(contact.id)} aria-label="Edit contact"
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--ink-3)] hover:text-[var(--ink)] hover:bg-[var(--surface-1)] transition-all">
                  <Edit size={15} />
                </button>
                <button onClick={confirmDelete} aria-label="Delete contact"
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--ink-3)] hover:text-red-600 hover:bg-red-50 transition-all">
                  <Trash2 size={15} />
                </button>
              </>
            )}
            <button onClick={closeContactPanel} aria-label="Close panel"
              className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--ink-3)] hover:text-[var(--ink)] hover:bg-[var(--surface-1)] transition-all">
              <X size={16} />
            </button>
          </div>
        </div>

        {!contact ? (
          <div className="flex-1 flex items-center justify-center text-[13px] text-[var(--ink-3)]">Contact not found</div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {/* Identity */}
            <div className="px-5 py-5 border-b border-[var(--border-subtle)] flex flex-col items-center text-center gap-2">
              <Avatar fname={contact.fname} lname={contact.lname} colorIdx={contact.colorIdx} size="lg" />
              <div>
                <div className="text-[17px] font-semibold">{contact.fname} {contact.lname}</div>
                <div className="text-[12px] text-[var(--ink-3)] mt-0.5">{contact.role} · {contact.company}</div>
              </div>
              <StatusBadge status={contact.status} />
              <div className="flex gap-2 mt-1">
                <button onClick={() => setEmailOpen(true)}
                  className="flex items-center gap-1.5 h-8 px-3 bg-accent text-accent-fg rounded-lg text-[12px] font-medium hover:opacity-85 transition-opacity">
                  <Mail size={13} /> Draft email
                </button>
                <button onClick={generateInsight}
                  className="flex items-center gap-1.5 h-8 px-3 border border-[var(--border)] rounded-lg text-[12px] text-[var(--ink-2)] hover:border-[var(--ink-3)] transition-all">
                  <Sparkles size={13} /> AI insight
                </button>
              </div>
            </div>

            {/* AI Insight */}
            {(aiInsight || aiLoading) && (
              <div className="mx-5 mt-4 p-3 bg-[var(--surface-1)] border border-[var(--border-subtle)] rounded-xl text-[13px] text-[var(--ink-2)] leading-relaxed">
                {aiLoading ? (
                  <div className="flex items-center gap-2 text-[var(--ink-3)]">
                    <div className="w-4 h-4 border-2 border-[var(--border)] border-t-accent rounded-full animate-spin" />
                    Generating insight…
                  </div>
                ) : aiInsight}
              </div>
            )}

            {/* Details */}
            <div className="px-5 py-4 flex flex-col gap-3">
              {contact.value && <Row label="Deal value" value={contact.value} mono />}
              <Row label="Email">
                <a href={`mailto:${contact.email}`} className="text-[13px] text-[var(--text-info,#1d4ed8)] hover:underline">{contact.email}</a>
              </Row>
              {contact.phone && (
                <Row label="Phone">
                  <a href={`tel:${contact.phone}`} className="flex items-center gap-1.5 text-[13px] text-[var(--ink-2)]"><Phone size={12} />{contact.phone}</a>
                </Row>
              )}
              {contact.linkedin && (
                <Row label="LinkedIn">
                  <a href={contact.linkedin.startsWith('http') ? contact.linkedin : `https://${contact.linkedin}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[13px] text-[var(--text-info,#1d4ed8)] hover:underline truncate">
                    <Linkedin size={12} />{contact.linkedin}
                  </a>
                </Row>
              )}
              {owner && (
                <Row label="Owner">
                  <div className="flex items-center gap-2"><TeamAvatar {...owner} size="sm" /><span className="text-[13px]">{owner.name}</span>{owner.isMe && <span className="text-[10px] bg-accent/10 text-accent px-1.5 py-0.5 rounded">you</span>}</div>
                </Row>
              )}
              <Row label="Added" value={contact.createdAt} />
            </div>

            {/* Tags */}
            <div className="px-5 pb-4 border-t border-[var(--border-subtle)] pt-4">
              <div className="text-[11px] font-medium uppercase tracking-wide text-[var(--ink-3)] mb-2">Tags</div>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {(contact.tags || []).map(t => <Tag key={t} label={t} onRemove={() => removeTag(t)} />)}
                {(contact.tags || []).length === 0 && <span className="text-[12px] text-[var(--ink-3)]">No tags</span>}
              </div>

              {/* Suggested tags */}
              <div className="flex flex-wrap gap-1 mb-2">
                {SUGGESTED_TAGS.filter(t => !(contact.tags || []).includes(t)).slice(0, 4).map(t => (
                  <button key={t} onClick={() => addTag(t)}
                    className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border border-dashed border-[var(--border)] text-[var(--ink-3)] hover:border-[var(--ink)] hover:text-[var(--ink)] transition-all">
                    <Plus size={10} />{t}
                  </button>
                ))}
              </div>

              {showTagInput ? (
                <div className="flex gap-1">
                  <input
                    autoFocus
                    className="flex-1 h-7 px-2 text-[12px] rounded-lg border border-[var(--border)] bg-[var(--surface-1)] outline-none focus:border-accent"
                    placeholder="Custom tag…"
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') addTag(tagInput); if (e.key === 'Escape') setShowTagInput(false) }}
                  />
                  <button onClick={() => addTag(tagInput)} className="h-7 px-2 bg-accent text-accent-fg rounded-lg text-[12px]">Add</button>
                  <button onClick={() => setShowTagInput(false)} className="h-7 px-2 text-[12px] text-[var(--ink-3)]">×</button>
                </div>
              ) : (
                <button onClick={() => setShowTagInput(true)} className="flex items-center gap-1 text-[12px] text-[var(--ink-3)] hover:text-[var(--ink)] transition-colors">
                  <Plus size={12} /> Add custom tag
                </button>
              )}
            </div>
            {/* Notes */}
            <div className="px-5 pb-5 border-t border-[var(--border-subtle)] pt-4">
              <EntityNote
                note={contact.notes || ''}
                onChange={val => updateContact(contact.id, { notes: val })}
              />
            </div>
          </div>
        )}
      </aside>

      {emailOpen && contact && (
        <EmailModal contactId={contact.id} onClose={() => setEmailOpen(false)} />
      )}
    </>
  )
}

function Row({ label, value, mono, children }: { label: string; value?: string; mono?: boolean; children?: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-[11px] font-medium uppercase tracking-wide text-[var(--ink-3)] w-20 flex-shrink-0 pt-0.5">{label}</span>
      {children ?? <span className={cn('text-[13px] text-[var(--ink-2)]', mono && 'font-mono font-medium')}>{value}</span>}
    </div>
  )
}
