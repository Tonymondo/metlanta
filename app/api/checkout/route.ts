import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getStripe } from '@/lib/stripe'
import { getServiceClient, getEventById } from '@/lib/supabase'
import { calculateFee } from '@/lib/fees'

export async function POST(req: NextRequest) {
  try {
    const { eventId, tierId, tierName, price, quantity = 1 } = await req.json()

    if (!eventId || !tierId || price === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify event + tier exist
    const event = await getEventById(eventId)
    if (!event || event.status !== 'live') {
      return NextResponse.json({ error: 'Event not available' }, { status: 404 })
    }

    const tier = event.ticket_tiers?.find((t) => t.id === tierId)
    if (!tier) {
      return NextResponse.json({ error: 'Ticket tier not found' }, { status: 404 })
    }

    // Check availability
    if (tier.capacity !== null && tier.sold_count >= tier.capacity) {
      return NextResponse.json({ error: 'This tier is sold out' }, { status: 409 })
    }

    // Get session for user_id if logged in
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id ?? null

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const unitAmount = Math.round(price * 100) // cents

    // Use tiered fee engine
    const { fee, payout } = calculateFee(price)
    const platformFeeCents = Math.round(fee * 100)

    const stripeSession = await getStripe().checkout.sessions.create({
      payment_method_types: ['card'],
      phone_number_collection: { enabled: true },
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${event.title} — ${tierName ?? tier.name}`,
              description: `${event.date} · ${event.location}`,
            },
            unit_amount: unitAmount,
          },
          quantity,
        },
      ],
      mode: 'payment',
      success_url: `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}&event=${encodeURIComponent(event.title)}&tier=${encodeURIComponent(tier.name)}`,
      cancel_url: `${appUrl}/#events`,
      metadata: {
        eventId,
        tierId,
        eventTitle: event.title,
        eventDate: event.date,
        eventLocation: event.location,
        tierName: tier.name,
        platformFee: platformFeeCents.toString(),
        hostPayout: (unitAmount - platformFeeCents).toString(),
        ...(userId ? { userId } : {}),
      },
      payment_intent_data: {
        description: `Metlanta — ${event.title} (${tier.name})`,
      },
    })

    // Save pending ticket to DB
    const db = getServiceClient()
    await db.from('tickets').insert({
      event_id: eventId,
      tier_id: tierId,
      buyer_email: '',        // filled in by webhook once payment is confirmed
      stripe_session_id: stripeSession.id,
      amount_paid: price * quantity,
      platform_fee: fee * quantity,
      host_payout: payout * quantity,
      status: 'pending',
      ...(userId ? { user_id: userId } : {}),
    })

    return NextResponse.json({ url: stripeSession.url })
  } catch (err: unknown) {
    console.error('Stripe checkout error:', err)
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
