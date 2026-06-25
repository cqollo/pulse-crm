'use client'
export const dynamic = 'force-dynamic'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { inputCls } from '@/components/shared/Modal'
import { Loader2, CheckCircle } from 'lucide-react'

export default function SignupPage() {
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [done, setDone]         = useState(false)

  const submit = async () => {
    if (!name || !email || !password) { setError('Please fill in all fields'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true); setError('')

    const supabase = createClient()
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    })

    if (authError) { setError(authError.message); setLoading(false); return }

    // If email confirm is OFF, session exists immediately — go straight in
    if (data.session) {
      window.location.href = '/dashboard'
      return
    }

    // Email confirm is ON — show check email screen
    setDone(true)
    setLoading(false)
  }

  if (done) {
    return (
      <div className="bg-[var(--surface-0)] border border-[var(--border-subtle)] rounded-2xl p-8 flex flex-col items-center gap-4 text-center shadow-sm">
        <CheckCircle size={40} className="text-green-500" />
        <div>
          <h2 className="text-[18px] font-semibold mb-1">Check your email</h2>
          <p className="text-[13px] text-[var(--ink-3)]">
            We sent a confirmation link to <strong>{email}</strong>.<br />
            Click it to activate your account and get started.
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
        <h1 className="text-[20px] font-semibold mb-1">Create your account</h1>
        <p className="text-[13px] text-[var(--ink-3)]">Start your free workspace</p>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-medium text-[var(--ink-2)]">Full name</label>
          <input className={inputCls} placeholder="Jane Smith" value={name}
            onChange={e => setName(e.target.value)} autoComplete="name" autoFocus />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-medium text-[var(--ink-2)]">Email</label>
          <input className={inputCls} type="email" placeholder="you@company.com" value={email}
            onChange={e => setEmail(e.target.value)} autoComplete="email" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-medium text-[var(--ink-2)]">Password</label>
          <input className={inputCls} type="password" placeholder="At least 6 characters" value={password}
            onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} autoComplete="new-password" />
        </div>
      </div>

      {error && (
        <p className="text-[12px] text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2.5" role="alert">
          {error}
        </p>
      )}

      <button onClick={submit} disabled={loading}
        className="h-10 bg-accent text-accent-fg rounded-xl text-[14px] font-medium hover:opacity-85 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">
        {loading && <Loader2 size={15} className="animate-spin" />}
        {loading ? 'Creating account…' : 'Create account'}
      </button>

      <p className="text-[12px] text-center text-[var(--ink-3)]">
        Already have an account?{' '}
        <Link href="/auth/login" className="text-[var(--ink)] font-medium hover:underline">Sign in</Link>
      </p>
    </div>
  )
}
