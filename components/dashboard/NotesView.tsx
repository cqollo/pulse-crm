'use client'
import { useCRM } from '@/store'
import { Activity } from 'lucide-react'

export function NotesView() {
  const { activity, contacts, deals } = useCRM()

  const recentContacts = contacts.slice(0, 5)
  const recentDeals = deals.slice(0, 5)

  return (
    <div className="max-w-2xl flex flex-col gap-6">
      <div>
        <h2 className="text-[15px] font-semibold mb-1">Activity</h2>
        <p className="text-[13px] text-[var(--ink-3)]">A log of all activity across your workspace.</p>
      </div>

      {activity.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[var(--surface-1)] border border-[var(--border-subtle)] flex items-center justify-center">
            <Activity size={20} className="text-[var(--ink-3)]" />
          </div>
          <p className="text-[14px] font-medium">No activity yet</p>
          <p className="text-[12px] text-[var(--ink-3)]">Activity will appear here as you add contacts and deals.</p>
        </div>
      ) : (
        <div className="bg-[var(--surface-0)] border border-[var(--border-subtle)] rounded-xl divide-y divide-[var(--border-subtle)]">
          {activity.map(a => (
            <div key={a.id} className="flex items-start gap-3 p-4">
              <div className="w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: a.color }} />
              <div className="flex-1">
                <p className="text-[13px] text-[var(--ink-2)]">{a.text}</p>
                <p className="text-[11px] text-[var(--ink-3)] mt-0.5">{a.time}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
