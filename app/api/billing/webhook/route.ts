import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

// Use service role key so we can write outside RLS
const adminSupabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET
  if (!secret) return NextResponse.json({ error: 'No webhook secret' }, { status: 500 })

  const rawBody = await req.text()
  const signature = req.headers.get('x-signature') ?? ''

  // Verify signature
  const hmac = crypto.createHmac('sha256', secret).update(rawBody).digest('hex')
  if (hmac !== signature) return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })

  const payload = JSON.parse(rawBody)
  const eventName = payload.meta?.event_name
  const attrs = payload.data?.attributes
  const userId = payload.meta?.custom_data?.user_id

  if (!userId) return NextResponse.json({ ok: true })

  const supabase = adminSupabase()

  // Determine plan from variant
  const soloVariantId = process.env.LEMONSQUEEZY_SOLO_VARIANT_ID
  const teamVariantId = process.env.LEMONSQUEEZY_TEAM_VARIANT_ID
  const variantId = String(attrs?.variant_id ?? '')
  const plan = variantId === teamVariantId ? 'team' : variantId === soloVariantId ? 'solo' : 'free'

  if (eventName === 'subscription_created' || eventName === 'subscription_updated') {
    const status = attrs?.status === 'active' ? plan : 'free'
    await supabase.from('subscriptions').upsert({
      user_id: userId,
      plan: status,
      ls_subscription_id: String(payload.data?.id ?? ''),
      ls_variant_id: variantId,
      status: attrs?.status,
      renews_at: attrs?.renews_at,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })
  }

  if (eventName === 'subscription_cancelled' || eventName === 'subscription_expired') {
    await supabase.from('subscriptions').upsert({
      user_id: userId,
      plan: 'free',
      status: 'cancelled',
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })
  }

  return NextResponse.json({ ok: true })
}
