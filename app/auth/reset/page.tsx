'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { inputCls } from '@/components/shared/Modal'
import { Loader2, CheckCircle } from 'lucide-react'

export default function ResetPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const supabase = createClient()

  const submit = async () => {
    if (!email) { setError('Please enter your email'); return }
    setLoading(true); setError('')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/auth/update-password`,
    })
    if (error) { setError(error.message); setLoading(false); return }
    setDone(true)
  }

  if (done) {
    return (
      <div className="bg-[var(--surface-0)] border border-[var(--border-subtle)] rounded-2xl p-8 flex flex-col items-center gap-4 text-center shadow-sm">
        <CheckCircle size={40} className="text-green-500" />
        <div>
          <h2 className="text-[18px] font-semibold mb-1">Check your email</h2>
          <p className="text-[13px] text-[var(--ink-3)]">
            We sent a password reset link to <strong>{email}</strong>.
          </p>
        </div>
        <Link href="/auth/login" className="text-[13px] text-[var(--ink-3)] hover:text-[var(--ink)]">
          Back to login
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-[var(--surface-0)] border border-[var(--border-subtle)] rounded-2xl p-8 flex flex-col gap-5 shadow-sm">
      <div>
        <h1 className="text-[20px] font-semibold mb-1">Reset your password</h1>
        <p className="text-[13px] text-[var(--ink-3)]">Enter your email and we&apos;ll send a reset link</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-[12px] font-medium text-[var(--ink-2)]">Email</label>
        <input
          className={inputCls}
          type="email"
          placeholder="you@company.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          autoFocus
        />
      </div>

      {error && (
        <p className="text-[12px] text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2" role="alert">{error}</p>
      )}

      <button
        onClick={submit}
        disabled={loading}
        className="h-10 bg-accent text-accent-fg rounded-xl text-[14px] font-medium hover:opacity-85 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading && <Loader2 size={15} className="animate-spin" />}
        {loading ? 'Sending…' : 'Send reset link'}
      </button>

      <Link href="/auth/login" className="text-[12px] text-center text-[var(--ink-3)] hover:text-[var(--ink)]">
        ← Back to login
      </Link>
    </div>
  )
}
