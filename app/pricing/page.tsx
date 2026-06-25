'use client'
export const dynamic = 'force-dynamic'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Loader2 } from 'lucide-react'
import Link from 'next/link'

const PLANS = [
  {
    name: 'Solo',
    price: '$9',
    desc: 'For founders and solo sales people',
    variantEnv: 'NEXT_PUBLIC_LS_SOLO_VARIANT_ID',
    features: [
      '1 user', 'Unlimited contacts', 'Unlimited deals',
      'AI email drafting', 'Pipeline & forecast',
      'CSV import/export', 'Reminders & automations', '6 premium themes',
    ],
    highlight: false,
  },
  {
    name: 'Team',
    price: '$29',
    desc: 'For small sales teams up to 5 people',
    variantEnv: 'NEXT_PUBLIC_LS_TEAM_VARIANT_ID',
    features: [
      'Up to 5 users', 'Everything in Solo',
      'Team performance dashboard', 'Deal ownership & assignment',
      'Shared pipeline view', 'Webhook integrations',
      'API access', 'Priority support',
    ],
    highlight: true,
  },
]

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const router = useRouter()

  const checkout = async (variantEnv: string, planName: string) => {
    const variantId = process.env[variantEnv as keyof typeof process.env]
    if (!variantId) {
      alert('Billing not configured yet. Check back soon!')
      return
    }
    setLoading(planName)
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variantId }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else alert('Could not create checkout. Please try again.')
    } catch {
      alert('Something went wrong. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a14] text-white flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 max-w-5xl mx-auto w-full">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#7c6af7] flex items-center justify-center text-white text-[13px] font-bold">P</div>
          <span className="text-[16px] font-semibold">Pulse CRM</span>
        </Link>
        <Link href="/dashboard" className="text-[13px] text-white/40 hover:text-white transition-colors">← Back</Link>
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center px-8 py-16">
        <h1 className="text-[40px] font-bold text-center mb-3">Choose your plan</h1>
        <p className="text-[15px] text-white/50 text-center mb-12">14-day free trial on all plans. No credit card required.</p>

        <div className="grid grid-cols-2 gap-4 w-full max-w-2xl">
          {PLANS.map(plan => (
            <div key={plan.name}
              className={`rounded-2xl p-7 flex flex-col border ${
                plan.highlight
                  ? 'bg-[#7c6af7]/10 border-[#7c6af7]/40'
                  : 'bg-white/3 border-white/10'
              }`}>
              {plan.highlight && (
                <div className="text-[10px] font-bold bg-[#7c6af7] text-white px-2.5 py-1 rounded-full uppercase tracking-wide self-start mb-3">
                  Most popular
                </div>
              )}
              <div className="text-[13px] text-white/50 mb-1">{plan.name}</div>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-[40px] font-bold">{plan.price}</span>
                <span className="text-white/40 mb-2">/mo</span>
              </div>
              <p className="text-[12px] text-white/30 mb-6">{plan.desc}</p>
              <ul className="flex flex-col gap-2.5 mb-8 flex-1">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-[13px] text-white/60">
                    <Check size={13} className="text-[#7c6af7] flex-shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => checkout(plan.variantEnv, plan.name)}
                disabled={loading === plan.name}
                className={`h-10 flex items-center justify-center rounded-xl text-[13px] font-medium transition-all gap-2 disabled:opacity-60 ${
                  plan.highlight
                    ? 'bg-[#7c6af7] text-white hover:opacity-85'
                    : 'bg-white/8 border border-white/10 text-white hover:bg-white/12'
                }`}
              >
                {loading === plan.name && <Loader2 size={14} className="animate-spin" />}
                {loading === plan.name ? 'Loading…' : 'Start free trial'}
              </button>
            </div>
          ))}
        </div>

        <p className="text-[12px] text-white/20 mt-8">Cancel anytime · Secure payments via Lemon Squeezy</p>
      </div>
    </div>
  )
}
