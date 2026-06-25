'use client'
import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useCRM } from '@/store'
import { Loader2 } from 'lucide-react'

type State = 'loading' | 'error' | 'ready'

export function CRMProvider({ children }: { children: React.ReactNode }) {
  const { init } = useCRM()
  const [state, setState] = useState<State>('loading')
  const [errorMsg, setErrorMsg] = useState('')
  const initCalledRef = useRef(false)

  useEffect(() => {
    // Prevent double-init from React StrictMode
    if (initCalledRef.current) return
    initCalledRef.current = true

    const supabase = createClient()

    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      if (!session || error) {
        window.location.replace('/auth/login')
        return
      }

      const user = session.user
      const name = user.user_metadata?.full_name
        || user.email?.split('@')[0]
        || 'You'

      try {
        await init(user.id, name)
        setState('ready')
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e)
        if (msg.includes('relation') || msg.includes('does not exist')) {
          setErrorMsg('Database tables not found. Please run supabase/schema.sql in your Supabase SQL editor, then refresh.')
        } else {
          setErrorMsg('Failed to load workspace: ' + msg)
        }
        setState('error')
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        window.location.replace('/auth/login')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  if (state === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--surface-2)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-accent-fg text-[15px] font-bold">P</div>
          <Loader2 size={18} className="animate-spin text-[var(--ink-3)]" />
        </div>
      </div>
    )
  }

  if (state === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--surface-2)] p-4">
        <div className="max-w-md w-full bg-white border border-red-200 rounded-2xl p-6 flex flex-col gap-4">
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-accent-fg text-[15px] font-bold">P</div>
          <div>
            <h2 className="text-[15px] font-semibold text-red-700 mb-1">Setup required</h2>
            <p className="text-[13px] text-red-600 leading-relaxed">{errorMsg}</p>
          </div>
          <button onClick={() => window.location.reload()}
            className="h-9 px-4 bg-accent text-accent-fg rounded-lg text-[13px] font-medium hover:opacity-85 self-start">
            Retry
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
