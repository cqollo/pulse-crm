'use client'
import { useState, useRef } from 'react'
import { useCRM } from '@/store'
import { Modal, Btn } from '../shared/Modal'
import { Upload, Info } from 'lucide-react'
import type { Contact, Status } from '@/lib/types'

type Row = Omit<Contact, 'id' | 'createdAt' | 'colorIdx'> & { colorIdx: number }

function parseCsv(text: string): Row[] {
  const lines = text.trim().split(/\r?\n/)
  if (!lines.length) return []
  const parseRow = (line: string) => {
    const vals: string[] = []; let cur = '', inQ = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (ch === '"' && !inQ) inQ = true
      else if (ch === '"' && inQ && line[i + 1] === '"') { cur += '"'; i++ }
      else if (ch === '"' && inQ) inQ = false
      else if (ch === ',' && !inQ) { vals.push(cur.trim()); cur = '' }
      else cur += ch
    }
    vals.push(cur.trim()); return vals
  }
  const headers = parseRow(lines[0]).map(h => h.toLowerCase().replace(/[^a-z0-9_]/g, '_'))
  const mapCol = (obj: Record<string, string>, ...keys: string[]) => {
    for (const k of keys) { const m = Object.keys(obj).find(x => x === k || x.includes(k)); if (m) return obj[m] || '' }
    return ''
  }
  const valid: Status[] = ['hot', 'warm', 'cold', 'customer']
  return lines.slice(1).filter(l => l.trim()).map(l => {
    const vals = parseRow(l)
    const obj: Record<string, string> = {}
    headers.forEach((h, i) => obj[h] = vals[i] || '')
    const statusRaw = mapCol(obj, 'status', 'lead_status').toLowerCase()
    const status: Status = valid.includes(statusRaw as Status) ? statusRaw as Status : 'warm'
    const tagsRaw = mapCol(obj, 'tags', 'tag', 'labels')
    return {
      fname: mapCol(obj, 'first_name', 'firstname', 'fname'),
      lname: mapCol(obj, 'last_name', 'lastname', 'lname', 'surname'),
      email: mapCol(obj, 'email', 'email_address'),
      role: mapCol(obj, 'role', 'title', 'job_title', 'position'),
      company: mapCol(obj, 'company', 'organization', 'org'),
      status,
      value: mapCol(obj, 'value', 'deal_value', 'amount'),
      phone: mapCol(obj, 'phone', 'phone_number', 'tel'),
      linkedin: mapCol(obj, 'linkedin', 'linkedin_url'),
      tags: tagsRaw ? tagsRaw.split(/[,;]+/).map(t => t.trim()).filter(Boolean) : [],
      ownerId: null, colorIdx: 0,
    }
  }).filter(r => r.fname || r.lname || r.email)
}

export function ImportModal() {
  const { importModalOpen, closeImportModal, importContacts, showToast } = useCRM()
  const [rows, setRows] = useState<Row[]>([])
  const [step, setStep] = useState<1 | 2>(1)
  const [dragging, setDragging] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File) => {
    if (!file.name.endsWith('.csv')) { showToast('Please upload a .csv file', 'alert-circle', true); return }
    const reader = new FileReader()
    reader.onload = e => {
      const parsed = parseCsv(e.target?.result as string)
      if (!parsed.length) { showToast('No valid rows found', 'alert-circle', true); return }
      setRows(parsed); setStep(2)
    }
    reader.readAsText(file)
  }

  const downloadTemplate = () => {
    const csv = 'first_name,last_name,email,role,company,status,value,phone,linkedin,tags\nJane,Smith,jane@acme.com,VP of Sales,Acme Corp,hot,$50000,+1 555 000 0000,linkedin.com/in/janesmith,"VIP, Decision Maker"'
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = 'pulse-template.csv'; a.click()
    showToast('Template downloaded', 'download')
  }

  const confirm = () => {
    importContacts(rows)
    closeImportModal(); setStep(1); setRows([])
  }

  const noEmail = rows.filter(r => !r.email).length

  return (
    <Modal open={importModalOpen} onClose={() => { closeImportModal(); setStep(1); setRows([]) }} title="Import contacts" wide
      footer={
        step === 1
          ? <Btn variant="ghost" onClick={closeImportModal}>Cancel</Btn>
          : <><Btn variant="ghost" onClick={() => setStep(1)}>← Back</Btn><Btn onClick={confirm}>Import {rows.length} contacts</Btn></>
      }
    >
      {step === 1 && (
        <>
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${dragging ? 'border-accent bg-[var(--surface-1)]' : 'border-[var(--border)] hover:border-[var(--ink-3)]'}`}
          >
            <Upload size={28} className="mx-auto mb-3 text-[var(--ink-3)]" />
            <p className="text-[13px] text-[var(--ink-2)] mb-1">Drop a CSV file here or <span className="text-accent underline">browse</span></p>
            <p className="text-[11px] text-[var(--ink-3)]">Columns: first_name, last_name, email, role, company, status, value…</p>
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
          </div>
          <button type="button" onClick={downloadTemplate} className="text-[12px] text-[var(--ink-3)] hover:text-[var(--ink)] underline mx-auto block">
            Download template CSV
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <p className="text-[13px] text-[var(--ink-2)]"><strong>{rows.length}</strong> contacts ready to import</p>
          {noEmail > 0 && (
            <div className="flex items-start gap-2 text-[12px] text-amber-700 bg-amber-50 rounded-lg p-3">
              <Info size={14} className="mt-0.5 flex-shrink-0" />
              {noEmail} row{noEmail !== 1 ? 's' : ''} missing email — will still be imported
            </div>
          )}
          <div className="max-h-48 overflow-y-auto border border-[var(--border-subtle)] rounded-lg">
            <table className="w-full text-[12px]">
              <thead className="bg-[var(--surface-1)] sticky top-0">
                <tr>{['First', 'Last', 'Email', 'Role', 'Company', 'Status'].map(h => (
                  <th key={h} className="text-left px-3 py-2 font-medium text-[var(--ink-2)] border-b border-[var(--border-subtle)]">{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {rows.slice(0, 10).map((r, i) => (
                  <tr key={i} className="border-b border-[var(--border-subtle)] last:border-0">
                    <td className="px-3 py-2">{r.fname || '—'}</td>
                    <td className="px-3 py-2">{r.lname || '—'}</td>
                    <td className="px-3 py-2 text-[var(--ink-3)]">{r.email || '—'}</td>
                    <td className="px-3 py-2">{r.role || '—'}</td>
                    <td className="px-3 py-2">{r.company || '—'}</td>
                    <td className="px-3 py-2 capitalize">{r.status}</td>
                  </tr>
                ))}
                {rows.length > 10 && <tr><td colSpan={6} className="px-3 py-2 text-[var(--ink-3)] italic">…and {rows.length - 10} more</td></tr>}
              </tbody>
            </table>
          </div>
        </>
      )}
    </Modal>
  )
}
