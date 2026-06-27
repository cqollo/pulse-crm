import { NextRequest, NextResponse } from 'next/server'

const LS_API = 'https://api.lemonsqueezy.com/v1'

export async function POST(req: NextRequest) {
  const apiKey = process.env.LEMONSQUEEZY_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'Billing not configured' }, { status: 500 })

  const { variantId, email } = await req.json()

  const res = await fetch(`${LS_API}/checkouts`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/vnd.api+json',
      'Accept': 'application/vnd.api+json',
    },
    body: JSON.stringify({
      data: {
        type: 'checkouts',
        attributes: {
          checkout_data: { email: email || undefined },
          product_options: {
            redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing/success`,
            receipt_link_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing/success`,
          },
        },
        relationships: {
          store: { data: { type: 'stores', id: String(process.env.LEMONSQUEEZY_STORE_ID) } },
          variant: { data: { type: 'variants', id: String(variantId) } },
        },
      },
    }),
  })

  const data = await res.json()
  if (!res.ok) { console.error('LS error:', data); return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 }) }

  const checkoutUrl = data?.data?.attributes?.url
  if (!checkoutUrl) return NextResponse.json({ error: 'No checkout URL' }, { status: 500 })

  return NextResponse.json({ url: checkoutUrl })
}