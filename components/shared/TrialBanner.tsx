'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { X, Zap } from 'lucide-react'

interface Sub {
  plan: string
  status: string
  trial_ends_at: string | null
}

export function TrialBanner() {
  const [sub, setSub] = useState<Sub | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      const { data } = await supabase
        .from('subscriptions')
        .select('plan, status, trial_ends_at')
        .eq('user_id', user.id)
        .maybeSingle()
      if (data) setSub(data)
    })
  }, [])

  if (dismissed || !sub) return null
  if (sub.plan !== 'free' && sub.status === 'active') return null

  const daysLeft = sub.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(sub.trial_ends_at).getTime() - Date.now()) / 86400000))
    : 14

  const expired = daysLeft === 0

  return (
    <div className={`flex items-center justify-between px-4 py-2 text-[12px] font-medium ${expired ? 'bg-red-600' : 'bg-[#7c6af7]'} text-white`}>
      <div className="flex items-center gap-2">
        <Zap size={13} />
        {expired
          ? 'Your free trial has ended. Upgrade to keep using Pulse CRM.'
          : `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left in your free trial.`
        }
      </div>
      <div className="flex items-center gap-3">
        <Link href="/pricing" className="underline underline-offset-2 hover:opacity-80">
          {expired ? 'Upgrade now' : 'See plans'}
        </Link>
        {!expired && (
          <button onClick={() => setDismissed(true)} aria-label="Dismiss">
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  )
}
