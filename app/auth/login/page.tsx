'use client'
export const dynamic = 'force-dynamic'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { inputCls } from '@/components/shared/Modal'
import { Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const submit = async () => {
    if (!email || !password) { setError('Please fill in all fields'); return }
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    if (!data.session) {
      setError(
        'Login succeeded but no session was returned. ' +
        'Go to Supabase → Authentication → Providers → Email and disable "Confirm email", ' +
        'then delete and recreate your user.'
      )
      setLoading(false)
      return
    }

    // Session is good — hard navigate to app
    window.location.href = '/dashboard'
  }

  return (
    <div className="bg-[var(--surface-0)] border border-[var(--border-subtle)] rounded-2xl p-8 flex flex-col gap-5 shadow-sm">
      <div>
        <h1 className="text-[20px] font-semibold mb-1">Welcome back</h1>
        <p className="text-[13px] text-[var(--ink-3)]">Sign in to your workspace</p>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-medium text-[var(--ink-2)]">Email</label>
          <input
            className={inputCls}
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()}
            autoComplete="email"
            autoFocus
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[12px] font-medium text-[var(--ink-2)]">Password</label>
            
          </div>
          <input
            className={inputCls}
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()}
            autoComplete="current-password"
          />
          <Link href="/auth/reset" className="text-[12px] text-[var(--ink-3)] hover:text-[var(--ink)]">
              Forgot password?
            </Link>
        </div>
      </div>

      {error && (
        <p className="text-[12px] text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2.5 leading-relaxed" role="alert">
          {error}
        </p>
      )}

      <button
        onClick={submit}
        disabled={loading}
        className="h-10 bg-accent text-accent-fg rounded-xl text-[14px] font-medium hover:opacity-85 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading && <Loader2 size={15} className="animate-spin" />}
        {loading ? 'Signing in…' : 'Sign in'}
      </button>

      <p className="text-[12px] text-center text-[var(--ink-3)]">
        Don&apos;t have an account?{' '}
        <Link href="/auth/signup" className="text-[var(--ink)] font-medium hover:underline">Sign up</Link>
      </p>
    </div>
  )
}
