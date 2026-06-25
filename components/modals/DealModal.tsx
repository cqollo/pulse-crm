'use client'
import { useState, useEffect } from 'react'
import { useCRM } from '@/store'
import { Modal, Field, inputCls, Btn } from '../shared/Modal'
import { AssigneeSelector } from '../shared/AssigneeSelector'
import type { Stage } from '@/lib/types'
import { STAGES } from '@/lib/utils'

export function DealModal() {
  const { dealModalOpen, editDealId, closeDealModal, addDeal, updateDeal, deals } = useCRM()
  const editing = editDealId ? deals.find(d => d.id === editDealId) : null

  const [f, setF] = useState({ title: '', company: '', value: '', prob: '35%', stage: 'Lead' as Stage })
  const [ownerId, setOwner] = useState<string | null>(null)
  const [errs, setErrs] = useState<Record<string, string>>({})

  useEffect(() => {
    if (editing) {
      setF({ title: editing.title, company: editing.company, value: editing.value, prob: editing.prob, stage: editing.stage })
      setOwner(editing.ownerId)
    } else {
      setF({ title: '', company: '', value: '', prob: '35%', stage: 'Lead' })
      setOwner(null)
    }
    setErrs({})
  }, [dealModalOpen, editing])

  const up = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setF(prev => ({ ...prev, [k]: e.target.value }))

  const submit = () => {
    const e: Record<string, string> = {}
    if (!f.title.trim()) e.title = 'Required'
    if (!f.company.trim()) e.company = 'Required'
    if (!f.value.trim()) e.value = 'Required'
    if (Object.keys(e).length) { setErrs(e); return }
    if (editing) {
      updateDeal(editing.id, { ...f, ownerId }, { type: 'edit', text: 'Deal details updated' })
    } else {
      addDeal({ ...f, ownerId, colorIdx: 0 })
    }
    closeDealModal()
  }

  return (
    <Modal
      open={dealModalOpen}
      onClose={closeDealModal}
      title={editing ? 'Edit deal' : 'New deal'}
      footer={<><Btn variant="ghost" onClick={closeDealModal}>Cancel</Btn><Btn onClick={submit}>{editing ? 'Save changes' : 'Add deal'}</Btn></>}
    >
      <Field label="Deal name" error={errs.title}>
        <input className={inputCls} value={f.title} onChange={up('title')} placeholder="Enterprise licence renewal" />
      </Field>
      <Field label="Company" error={errs.company}>
        <input className={inputCls} value={f.company} onChange={up('company')} placeholder="Acme Corp" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Value" error={errs.value}>
          <input className={inputCls} value={f.value} onChange={up('value')} placeholder="$120,000" />
        </Field>
        <Field label="Probability">
          <select className={inputCls} value={f.prob} onChange={up('prob')}>
            {['10%','20%','35%','50%','65%','80%','90%'].map(p => <option key={p}>{p}</option>)}
          </select>
        </Field>
      </div>
      <Field label="Stage">
        <select className={inputCls} value={f.stage} onChange={up('stage')}>
          {STAGES.map(s => <option key={s}>{s}</option>)}
        </select>
      </Field>
      <AssigneeSelector value={ownerId} onChange={setOwner} label="Assign to" />
    </Modal>
  )
}
