import Link from 'next/link'
import { Check, Zap, Users, BarChart3, Bell, Mail, ArrowRight, Star } from 'lucide-react'

const FEATURES = [
  { icon: <Users size={20} />, title: 'Contact management', desc: 'Organize every lead, prospect and customer in one clean workspace.' },
  { icon: <BarChart3 size={20} />, title: 'Visual pipeline', desc: 'Drag and drop deals across stages. See your entire pipeline at a glance.' },
  { icon: <Mail size={20} />, title: 'AI email drafting', desc: 'Claude writes personalized sales emails in seconds. Professional, friendly or direct.' },
  { icon: <Zap size={20} />, title: 'Automations', desc: 'Build rules that trigger automatically — assign leads, add tags, fire webhooks.' },
  { icon: <Bell size={20} />, title: 'Follow-up reminders', desc: 'Never miss a follow-up. Set reminders on any contact or deal.' },
  { icon: <BarChart3 size={20} />, title: 'Revenue forecast', desc: 'Weighted pipeline projections based on deal probability and stage.' },
]

const TESTIMONIALS = [
  { name: 'Sarah K.', role: 'Founder, Studio Nairobi', text: 'Switched from HubSpot. Pulse does everything I actually need at a fraction of the price.' },
  { name: 'Marcus R.', role: 'Sales Lead, TechCo', text: 'The AI email drafting alone saves me an hour a day. Clean, fast, no bloat.' },
  { name: 'Amina T.', role: 'Consultant', text: 'Finally a CRM that feels like it was built for people who actually sell, not for IT teams.' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a14] text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 max-w-6xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#7c6af7] flex items-center justify-center text-white text-[13px] font-bold">P</div>
          <span className="text-[16px] font-semibold tracking-tight">Pulse CRM</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="#features" className="text-[13px] text-white/60 hover:text-white transition-colors">Features</Link>
          <Link href="#pricing" className="text-[13px] text-white/60 hover:text-white transition-colors">Pricing</Link>
          <Link href="/auth/login" className="text-[13px] text-white/60 hover:text-white transition-colors">Sign in</Link>
          <Link href="/auth/signup" className="h-8 px-4 bg-[#7c6af7] text-white rounded-lg text-[13px] font-medium hover:opacity-85 transition-opacity flex items-center">
            Get started free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto text-center px-8 pt-24 pb-20">
        <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-[12px] text-white/60 mb-8">
          <Star size={11} className="text-[#7c6af7]" /> AI-powered sales workspace
        </div>
        <h1 className="text-[56px] font-bold leading-[1.1] tracking-tight mb-6">
          The CRM that works<br />
          <span className="text-[#7c6af7]">as fast as you do</span>
        </h1>
        <p className="text-[18px] text-white/50 leading-relaxed max-w-2xl mx-auto mb-10">
          Pulse is a lightweight, AI-native CRM for founders and small sales teams.
          Manage contacts, close deals, and draft emails with AI — without the complexity of Salesforce or HubSpot.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/auth/signup"
            className="h-11 px-6 bg-[#7c6af7] text-white rounded-xl text-[14px] font-medium hover:opacity-85 transition-opacity flex items-center gap-2">
            Start for free <ArrowRight size={15} />
          </Link>
          <Link href="#pricing"
            className="h-11 px-6 bg-white/5 border border-white/10 text-white rounded-xl text-[14px] hover:bg-white/10 transition-colors flex items-center">
            See pricing
          </Link>
        </div>
        <p className="text-[12px] text-white/30 mt-4">No credit card required · 14-day free trial</p>
      </section>

      {/* App screenshot placeholder */}
      <section className="max-w-5xl mx-auto px-8 mb-24">
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 bg-white/5 border-b border-white/10">
            <div className="w-3 h-3 rounded-full bg-red-500/60" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
            <div className="w-3 h-3 rounded-full bg-green-500/60" />
            <div className="flex-1 mx-4 h-5 bg-white/5 rounded-md" />
          </div>
          <div className="p-6 grid grid-cols-4 gap-3 min-h-[280px]">
            {['Lead', 'Qualified', 'Proposal', 'Negotiation'].map((stage, i) => (
              <div key={stage} className="bg-white/5 rounded-xl p-3">
                <div className="text-[11px] font-medium uppercase tracking-wide text-white/40 mb-3">{stage}</div>
                {Array.from({ length: i === 0 ? 3 : i === 1 ? 2 : i === 2 ? 2 : 1 }).map((_, j) => (
                  <div key={j} className="bg-white/8 border border-white/10 rounded-lg p-2.5 mb-2">
                    <div className="h-2 bg-white/20 rounded mb-1.5 w-3/4" />
                    <div className="h-1.5 bg-white/10 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-5xl mx-auto px-8 pb-24">
        <div className="text-center mb-14">
          <h2 className="text-[36px] font-bold mb-4">Everything you need to close more deals</h2>
          <p className="text-[16px] text-white/50">Built for speed. Designed to get out of your way.</p>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {FEATURES.map(f => (
            <div key={f.title} className="bg-white/3 border border-white/8 rounded-2xl p-6 hover:bg-white/5 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-[#7c6af7]/15 flex items-center justify-center text-[#7c6af7] mb-4">
                {f.icon}
              </div>
              <h3 className="text-[14px] font-semibold mb-2">{f.title}</h3>
              <p className="text-[13px] text-white/40 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-5xl mx-auto px-8 pb-24">
        <div className="grid grid-cols-3 gap-4">
          {TESTIMONIALS.map(t => (
            <div key={t.name} className="bg-white/3 border border-white/8 rounded-2xl p-6">
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={12} className="text-[#7c6af7] fill-[#7c6af7]" />
                ))}
              </div>
              <p className="text-[13px] text-white/60 leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>
              <div>
                <div className="text-[13px] font-medium">{t.name}</div>
                <div className="text-[11px] text-white/30">{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-4xl mx-auto px-8 pb-24">
        <div className="text-center mb-14">
          <h2 className="text-[36px] font-bold mb-4">Simple, honest pricing</h2>
          <p className="text-[16px] text-white/50">Start free. Upgrade when you&apos;re ready.</p>
        </div>
        <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
          {/* Solo */}
          <div className="bg-white/3 border border-white/10 rounded-2xl p-7 flex flex-col">
            <div className="text-[13px] text-white/50 mb-1">Solo</div>
            <div className="flex items-end gap-1 mb-1">
              <span className="text-[40px] font-bold">$9</span>
              <span className="text-white/40 mb-2">/mo</span>
            </div>
            <p className="text-[12px] text-white/30 mb-6">For founders and solo sales people</p>
            <ul className="flex flex-col gap-2.5 mb-8 flex-1">
              {['1 user', 'Unlimited contacts', 'Unlimited deals', 'AI email drafting', 'Pipeline & forecast', 'CSV import/export', 'Reminders & automations', '6 premium themes'].map(f => (
                <li key={f} className="flex items-center gap-2 text-[13px] text-white/60">
                  <Check size={13} className="text-[#7c6af7] flex-shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <Link href="/auth/signup"
              className="h-10 flex items-center justify-center bg-white/8 border border-white/10 text-white rounded-xl text-[13px] font-medium hover:bg-white/12 transition-colors">
              Start free trial
            </Link>
          </div>

          {/* Team */}
          <div className="bg-[#7c6af7]/10 border border-[#7c6af7]/30 rounded-2xl p-7 flex flex-col relative overflow-hidden">
            <div className="absolute top-4 right-4 text-[10px] font-bold bg-[#7c6af7] text-white px-2.5 py-1 rounded-full uppercase tracking-wide">
              Popular
            </div>
            <div className="text-[13px] text-white/50 mb-1">Team</div>
            <div className="flex items-end gap-1 mb-1">
              <span className="text-[40px] font-bold">$29</span>
              <span className="text-white/40 mb-2">/mo</span>
            </div>
            <p className="text-[12px] text-white/30 mb-6">For small sales teams up to 5 people</p>
            <ul className="flex flex-col gap-2.5 mb-8 flex-1">
              {['Up to 5 users', 'Everything in Solo', 'Team performance dashboard', 'Deal ownership & assignment', 'Shared pipeline view', 'Webhook integrations', 'API access', 'Priority support'].map(f => (
                <li key={f} className="flex items-center gap-2 text-[13px] text-white/60">
                  <Check size={13} className="text-[#7c6af7] flex-shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <Link href="/auth/signup"
              className="h-10 flex items-center justify-center bg-[#7c6af7] text-white rounded-xl text-[13px] font-medium hover:opacity-85 transition-opacity">
              Start free trial
            </Link>
          </div>
        </div>
        <p className="text-center text-[12px] text-white/25 mt-6">14-day free trial · No credit card required · Cancel anytime</p>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-8 pb-24 text-center">
        <div className="bg-[#7c6af7]/10 border border-[#7c6af7]/20 rounded-3xl p-12">
          <h2 className="text-[36px] font-bold mb-4">Ready to close more deals?</h2>
          <p className="text-[16px] text-white/50 mb-8">Join teams using Pulse to manage their pipeline smarter.</p>
          <Link href="/auth/signup"
            className="inline-flex items-center gap-2 h-11 px-8 bg-[#7c6af7] text-white rounded-xl text-[14px] font-medium hover:opacity-85 transition-opacity">
            Get started free <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/8 py-8 px-8 max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#7c6af7] flex items-center justify-center text-white text-[10px] font-bold">P</div>
          <span className="text-[13px] text-white/30">Pulse CRM</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="#features" className="text-[12px] text-white/30 hover:text-white/60 transition-colors">Features</Link>
          <Link href="#pricing" className="text-[12px] text-white/30 hover:text-white/60 transition-colors">Pricing</Link>
          <Link href="/auth/login" className="text-[12px] text-white/30 hover:text-white/60 transition-colors">Sign in</Link>
        </div>
        <p className="text-[12px] text-white/20">© 2026 Pulse CRM. All rights reserved.</p>
      </footer>
    </div>
  )
}
