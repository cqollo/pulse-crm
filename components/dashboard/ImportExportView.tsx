'use client'
import { useCRM } from '@/store'
import { Upload, Download, FileText } from 'lucide-react'

export function ImportExportView() {
  const { contacts, deals, openImportModal, showToast } = useCRM()

  const exportContacts = () => {
    const cols = ['first_name', 'last_name', 'email', 'role', 'company', 'status', 'value', 'phone', 'linkedin', 'tags']
    const rows = contacts.map(c => [c.fname, c.lname, c.email, c.role, c.company, c.status, c.value, c.phone, c.linkedin, (c.tags||[]).join('; ')].map(v => `"${(v||'').replace(/"/g,'""')}"`).join(','))
    const csv = [cols.join(','), ...rows].join('\n')
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = `pulse-contacts-${Date.now()}.csv`; a.click()
    showToast(`${contacts.length} contacts exported`, 'download')
  }

  const exportDeals = () => {
    const cols = ['title', 'company', 'value', 'stage', 'probability', 'created', 'updated']
    const rows = deals.map(d => [d.title, d.company, d.value, d.stage, d.prob, d.createdAt, d.updatedAt].map(v => `"${(v||'').replace(/"/g,'""')}"`).join(','))
    const csv = [cols.join(','), ...rows].join('\n')
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = `pulse-deals-${Date.now()}.csv`; a.click()
    showToast(`${deals.length} deals exported`, 'download')
  }

  const downloadTemplate = () => {
    const csv = 'first_name,last_name,email,role,company,status,value,phone,linkedin,tags\nJane,Smith,jane@acme.com,VP of Sales,Acme Corp,hot,$50000,+1 555 000 0000,linkedin.com/in/janesmith,"VIP, Decision Maker"'
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = 'pulse-template.csv'; a.click()
    showToast('Template downloaded', 'download')
  }

  const Card = ({ icon, title, desc, action, actionLabel, secondary, secondaryLabel }: {
    icon: React.ReactNode; title: string; desc: string
    action: () => void; actionLabel: string
    secondary?: () => void; secondaryLabel?: string
  }) => (
    <div className="bg-[var(--surface-0)] border border-[var(--border-subtle)] rounded-xl p-5 flex flex-col gap-4">
      <div className="w-10 h-10 rounded-xl bg-[var(--surface-1)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--ink-2)]">
        {icon}
      </div>
      <div>
        <div className="text-[14px] font-medium mb-1">{title}</div>
        <div className="text-[12px] text-[var(--ink-3)] leading-relaxed">{desc}</div>
      </div>
      <div className="flex gap-2 mt-auto">
        <button onClick={action} className="flex items-center gap-1.5 h-8 px-4 bg-accent text-accent-fg rounded-lg text-[12px] font-medium hover:opacity-85">
          {actionLabel}
        </button>
        {secondary && (
          <button onClick={secondary} className="flex items-center gap-1.5 h-8 px-3 border border-[var(--border)] rounded-lg text-[12px] text-[var(--ink-2)] hover:border-[var(--ink-3)]">
            {secondaryLabel}
          </button>
        )}
      </div>
    </div>
  )

  return (
    <div className="max-w-2xl flex flex-col gap-6">
      <div>
        <h2 className="text-[15px] font-semibold mb-1">Import & Export</h2>
        <p className="text-[13px] text-[var(--ink-3)]">Move data in and out of Pulse. All exports are CSV files compatible with Excel and Google Sheets.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[var(--surface-1)] rounded-xl p-4 text-center">
          <div className="text-[26px] font-mono font-semibold">{contacts.length}</div>
          <div className="text-[12px] text-[var(--ink-3)]">contacts in workspace</div>
        </div>
        <div className="bg-[var(--surface-1)] rounded-xl p-4 text-center">
          <div className="text-[26px] font-mono font-semibold">{deals.length}</div>
          <div className="text-[12px] text-[var(--ink-3)]">deals in pipeline</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card
          icon={<Upload size={18} />}
          title="Import contacts"
          desc="Upload a CSV file to bulk-import contacts. Supported columns: first_name, last_name, email, role, company, status, value, phone, linkedin, tags."
          action={openImportModal}
          actionLabel="Import CSV"
          secondary={downloadTemplate}
          secondaryLabel="Template"
        />
        <Card
          icon={<Download size={18} />}
          title="Export contacts"
          desc={`Download all ${contacts.length} contacts as a CSV file. Includes all fields and tags.`}
          action={exportContacts}
          actionLabel="Export contacts"
        />
        <Card
          icon={<FileText size={18} />}
          title="Export deals"
          desc={`Download all ${deals.length} pipeline deals as a CSV file. Includes stage, value, and probability.`}
          action={exportDeals}
          actionLabel="Export deals"
        />
        <Card
          icon={<FileText size={18} />}
          title="CSV template"
          desc="Download a blank template with all supported columns pre-filled with an example row."
          action={downloadTemplate}
          actionLabel="Download template"
        />
      </div>
    </div>
  )
}
