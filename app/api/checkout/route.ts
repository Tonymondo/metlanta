import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  try {
    const { eventName, tierName, price, quantity = 1 } = await req.json()

    if (!eventName || !tierName || !price) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const session = await getStripe().checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${eventName} — ${tierName}`,
              description: `Ticket for ${eventName}`,
              metadata: { event: eventName, tier: tierName },
            },
            unit_amount: Math.round(price * 100), // cents
          },
          quantity,
        },
      ],
      mode: 'payment',
      success_url: `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}&event=${encodeURIComponent(eventName)}&tier=${encodeURIComponent(tierName)}`,
      cancel_url: `${appUrl}/#events`,
      metadata: { eventName, tierName },
      payment_intent_data: {
        description: `Metlanta ticket — ${eventName} (${tierName})`,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (err: unknown) {
    console.error('Stripe checkout error:', err)
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
