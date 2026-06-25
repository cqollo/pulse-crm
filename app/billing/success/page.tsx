'use client'
export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'

export default function BillingSuccess() {
  return (
    <div className="min-h-screen bg-[#0a0a14] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center flex flex-col items-center gap-6">
        <CheckCircle size={56} className="text-[#7c6af7]" />
        <div>
          <h1 className="text-[28px] font-bold text-white mb-2">You&apos;re all set!</h1>
          <p className="text-[15px] text-white/50">
            Your subscription is active. Welcome to Pulse CRM.
          </p>
        </div>
        <Link href="/dashboard"
          className="h-11 px-8 bg-[#7c6af7] text-white rounded-xl text-[14px] font-medium hover:opacity-85 transition-opacity flex items-center">
          Go to your workspace
        </Link>
      </div>
    </div>
  )
}
