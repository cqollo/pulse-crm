'use client'
import { useState, useEffect } from 'react'
import { useCRM } from '@/store'
import { Modal, Field, inputCls, Btn } from '../shared/Modal'
import { Avatar } from '../shared/Avatar'
import { RefreshCw, Copy } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props { contactId: string | null; onClose: () => void }

const TONES = ['professional', 'friendly', 'direct', 'consultative'] as const
type Tone = typeof TONES[number]
const TYPES = ['intro', 'follow-up', 'proposal', 'check-in'] as const

export function EmailModal({ contactId, onClose }: Props) {
  const { contacts, deals, showToast, updateObCheck } = useCRM()
  const contact = contacts.find(c => c.id === contactId)

  const [tone, setTone] = useState<Tone>('professional')
  const [type, setType] = useState('intro')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (contact) { generate() }
  }, [contactId])

  const generate = async () => {
    if (!contact) return
    setLoading(true); setSubject(''); setBody('')
    const rd = deals.find(d => d.company === contact.company)
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: `Write a ${tone} sales ${type} email to ${contact.fname} ${contact.lname}, ${contact.role} at ${contact.company}. Status: "${contact.status}", value: ${contact.value || 'unknown'}. Tags: ${(contact.tags || []).join(', ') || 'none'}.${rd ? ` Deal: "${rd.title}" in "${rd.stage}" at ${rd.prob}.` : ''} Return ONLY valid JSON with keys "subject" and "body" (\\n for line breaks). No preamble or fences.`,
          }],
        }),
      })
      const data = await res.json()
      const text = data.content?.find((b: { type: string }) => b.type === 'text')?.text || '{}'
      const parsed = JSON.parse(text.replace(/```json|```/g, '').trim())
      setSubject(parsed.subject || ''); setBody(parsed.body || '')
      updateObCheck('e')
    } catch {
      setSubject('Error'); setBody('Please try again.')
    } finally { setLoading(false) }
  }

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => showToast(`${label} copied!`, 'copy'))
  }

  if (!contact) return null

  return (
    <Modal open={!!contactId} onClose={onClose} title="Draft email" wide
      footer={
        <>
          <Btn variant="ghost" onClick={() => copy(`Subject: ${subject}\n\n${body}`, 'Email')}>
            <Copy size={13} className="mr-1" /> Copy all
          </Btn>
          <Btn onClick={onClose}>Done</Btn>
        </>
      }
    >
      {/* Contact chip */}
      <div className="flex items-center gap-3 bg-[var(--surface-1)] rounded-lg p-3">
        <Avatar fname={contact.fname} lname={contact.lname} colorIdx={contact.colorIdx} size="sm" />
        <div>
          <div className="text-[13px] font-medium">{contact.fname} {contact.lname}</div>
          <div className="text-[11px] text-[var(--ink-3)]">{contact.role} · {contact.company} · {contact.email}</div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-2 items-center flex-wrap">
        <span className="text-[12px] text-[var(--ink-3)]">Tone:</span>
        {TONES.map(t => (
          <button key={t} type="button" aria-pressed={tone === t}
            onClick={() => setTone(t)}
            className={cn('h-7 px-3 rounded-md text-[12px] border transition-all capitalize',
              tone === t ? 'bg-accent text-accent-fg border-accent' : 'bg-[var(--surface-1)] border-[var(--border)] text-[var(--ink-2)] hover:border-[var(--ink-3)]'
            )}>
            {t}
          </button>
        ))}
        <select className={cn(inputCls, 'h-7 text-[12px] ml-auto w-auto')} value={type} onChange={e => setType(e.target.value)}>
          {TYPES.map(t => <option key={t} value={t}>{t.replace('-', ' ')}</option>)}
        </select>
        <button type="button" onClick={generate} className="flex items-center gap-1.5 h-7 px-3 rounded-md text-[12px] border border-[var(--border)] bg-[var(--surface-1)] text-[var(--ink-2)] hover:border-[var(--ink-3)] transition-all">
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Regenerate
        </button>
      </div>

      {/* Subject */}
      <Field label="Subject">
        <div className="relative">
          <input className={inputCls} value={loading ? 'Generating…' : subject} readOnly onChange={() => {}} />
          <button type="button" onClick={() => copy(subject, 'Subject')} className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--ink-3)] hover:text-[var(--ink)]">
            <Copy size={13} />
          </button>
        </div>
      </Field>

      {/* Body */}
      <Field label="Body">
        <div className="relative">
          <textarea
            className={cn(inputCls, 'h-40 resize-none py-2 leading-relaxed')}
            value={loading ? 'Generating…' : body}
            readOnly
            onChange={() => {}}
          />
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-[var(--surface-1)]/80 rounded-lg">
              <div className="w-5 h-5 border-2 border-[var(--border)] border-t-accent rounded-full animate-spin" />
            </div>
          )}
        </div>
      </Field>
    </Modal>
  )
}
