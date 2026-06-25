'use client'
import { useState, useEffect } from 'react'
import { useCRM } from '@/store'
import { Modal, Field, inputCls, Btn } from '../shared/Modal'
import { AssigneeSelector } from '../shared/AssigneeSelector'
import type { Status } from '@/lib/types'

export function ContactModal() {
  const { contactModalOpen, editContactId, closeContactModal, addContact, updateContact, contacts } = useCRM()
  const editing = editContactId ? contacts.find(c => c.id === editContactId) : null

  const [f, setF] = useState({ fname: '', lname: '', email: '', role: '', company: '', status: 'warm' as Status, value: '', phone: '', linkedin: '' })
  const [ownerId, setOwner] = useState<string | null>(null)
  const [errs, setErrs] = useState<Record<string, string>>({})

  useEffect(() => {
    if (editing) {
      setF({ fname: editing.fname, lname: editing.lname, email: editing.email, role: editing.role, company: editing.company, status: editing.status, value: editing.value, phone: editing.phone, linkedin: editing.linkedin })
      setOwner(editing.ownerId)
    } else {
      setF({ fname: '', lname: '', email: '', role: '', company: '', status: 'warm', value: '', phone: '', linkedin: '' })
      setOwner(null)
    }
    setErrs({})
  }, [contactModalOpen, editing])

  const up = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setF(prev => ({ ...prev, [k]: e.target.value }))

  const submit = () => {
    const e: Record<string, string> = {}
    if (!f.fname.trim()) e.fname = 'Required'
    if (!f.lname.trim()) e.lname = 'Required'
    if (!f.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = 'Valid email required'
    if (!f.role.trim()) e.role = 'Required'
    if (!f.company.trim()) e.company = 'Required'
    if (Object.keys(e).length) { setErrs(e); return }
    if (editing) {
      updateContact(editing.id, { ...f, ownerId })
    } else {
      addContact({ ...f, ownerId, tags: [], colorIdx: 0 })
    }
    closeContactModal()
  }

  return (
    <Modal
      open={contactModalOpen}
      onClose={closeContactModal}
      title={editing ? 'Edit contact' : 'New contact'}
      footer={<><Btn variant="ghost" onClick={closeContactModal}>Cancel</Btn><Btn onClick={submit}>{editing ? 'Save changes' : 'Add contact'}</Btn></>}
    >
      <div className="grid grid-cols-2 gap-3">
        <Field label="First name" error={errs.fname}>
          <input className={inputCls} value={f.fname} onChange={up('fname')} placeholder="Jane" autoComplete="given-name" />
        </Field>
        <Field label="Last name" error={errs.lname}>
          <input className={inputCls} value={f.lname} onChange={up('lname')} placeholder="Smith" autoComplete="family-name" />
        </Field>
      </div>
      <Field label="Email" error={errs.email}>
        <input className={inputCls} type="email" value={f.email} onChange={up('email')} placeholder="jane@company.com" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Job title" error={errs.role}>
          <input className={inputCls} value={f.role} onChange={up('role')} placeholder="VP of Sales" />
        </Field>
        <Field label="Company" error={errs.company}>
          <input className={inputCls} value={f.company} onChange={up('company')} placeholder="Acme Corp" />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Lead status">
          <select className={inputCls} value={f.status} onChange={up('status')}>
            <option value="warm">Warm</option>
            <option value="hot">Hot</option>
            <option value="cold">Cold</option>
            <option value="customer">Customer</option>
          </select>
        </Field>
        <Field label="Deal value" hint="Optional">
          <input className={inputCls} value={f.value} onChange={up('value')} placeholder="$50,000" />
        </Field>
      </div>
      <div className="border-t border-[var(--border-subtle)] pt-3">
        <div className="text-[11px] font-medium text-[var(--ink-3)] uppercase tracking-wide mb-3">Custom fields</div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Phone" hint="Optional">
            <input className={inputCls} value={f.phone} onChange={up('phone')} placeholder="+1 555 000 0000" />
          </Field>
          <Field label="LinkedIn" hint="Optional">
            <input className={inputCls} value={f.linkedin} onChange={up('linkedin')} placeholder="linkedin.com/in/…" />
          </Field>
        </div>
      </div>
      <AssigneeSelector value={ownerId} onChange={setOwner} label="Assign to" />
    </Modal>
  )
}
