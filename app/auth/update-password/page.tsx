'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { inputCls } from '@/components/shared/Modal'
import { Loader2 } from 'lucide-react'

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const submit = async () => {
    if (!password || !confirm) { setError('Please fill in all fields'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }
    if (password !== confirm) { setError('Passwords do not match'); return }
    setLoading(true); setError('')
    const { error } = await supabase.auth.updateUser({ password })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/')
  }

  return (
    <div className="bg-[var(--surface-0)] border border-[var(--border-subtle)] rounded-2xl p-8 flex flex-col gap-5 shadow-sm">
      <div>
        <h1 className="text-[20px] font-semibold mb-1">Set new password</h1>
        <p className="text-[13px] text-[var(--ink-3)]">Choose a strong password for your account</p>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-medium text-[var(--ink-2)]">New password</label>
          <input className={inputCls} type="password" placeholder="At least 8 characters" value={password} onChange={e => setPassword(e.target.value)} autoFocus />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-medium text-[var(--ink-2)]">Confirm password</label>
          <input className={inputCls} type="password" placeholder="Repeat your password" value={confirm} onChange={e => setConfirm(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} />
        </div>
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
        {loading ? 'Updating…' : 'Update password'}
      </button>
    </div>
  )
}
