import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getStripe } from '@/lib/stripe'
import { getServiceClient, getEventById } from '@/lib/supabase'
import { calculateFee } from '@/lib/fees'

export interface CartTier {
  tierId: string
  tierName: string
  price: number
  quantity: number
}

export interface OrderSummary {
  eventTitle: string
  eventDate: string
  eventLocation: string
  eventImage: string | null
  tiers: { name: string; qty: number; unitPrice: number; subtotal: number }[]
  subtotal: number
  total: number
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { eventId, tiers: rawTiers, ref } = body as {
      eventId: string
      tiers: CartTier[]
      ref?: string
    }

    if (!eventId || !Array.isArray(rawTiers) || rawTiers.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const event = await getEventById(eventId)
    if (!event || event.status !== 'live') {
      return NextResponse.json({ error: 'Event not available' }, { status: 404 })
    }

    // Validate each tier and check availability
    const validatedTiers: CartTier[] = []
    for (const ct of rawTiers) {
      if (!ct.tierId || ct.quantity < 1) continue
      const tier = event.ticket_tiers?.find((t) => t.id === ct.tierId)
      if (!tier) return NextResponse.json({ error: `Tier not found: ${ct.tierId}` }, { status: 404 })
      if (tier.capacity !== null && tier.sold_count + ct.quantity > tier.capacity) {
        return NextResponse.json({ error: `Not enough tickets for ${tier.name}` }, { status: 409 })
      }
      validatedTiers.push({ tierId: tier.id, tierName: tier.name, price: tier.price, quantity: ct.quantity })
    }

    if (validatedTiers.length === 0) {
      return NextResponse.json({ error: 'No valid tickets in cart' }, { status: 400 })
    }

    const session = await getServerSession(authOptions)
    const userId = session?.user?.id ?? null
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const totalGross = validatedTiers.reduce((s, t) => s + t.price * t.quantity, 0)

    // Free-only cart — bypass Stripe
    if (totalGross === 0) {
      const db = getServiceClient()
      for (const t of validatedTiers) {
        for (let i = 0; i < t.quantity; i++) {
          await db.from('tickets').insert({
            event_id: eventId,
            tier_id: t.tierId,
            buyer_email: session?.user?.email ?? '',
            buyer_name: session?.user?.name ?? '',
            stripe_session_id: `free_${Date.now()}_${t.tierId}_${i}`,
            amount_paid: 0,
            platform_fee: 0,
            host_payout: 0,
            status: 'confirmed',
            ...(userId ? { user_id: userId } : {}),
          })
          await db.rpc('increment_sold_count', { tier_id: t.tierId, qty: 1 })
        }
      }
      return NextResponse.json({
        url: `${appUrl}/success?event=${encodeURIComponent(event.title)}&tier=${encodeURIComponent(validatedTiers[0].tierName)}`,
      })
    }

    const db = getServiceClient()

    // Look up host's Stripe Connect account
    const { data: hostProfile } = await db
      .from('host_profiles')
      .select('stripe_account_id')
      .eq('user_id', event.host_id)
      .maybeSingle()
    const hostStripeAccountId = hostProfile?.stripe_account_id ?? null

    // Track promoter click if ref provided
    if (ref) {
      await db.rpc('increment_promoter_clicks', { p_code: ref, p_event_id: eventId })
    }

    const { fee: totalFee } = calculateFee(totalGross)
    const totalFeeCents = Math.round(totalFee * 100)

    const lineItems = validatedTiers.map((t) => ({
      price_data: {
        currency: 'usd' as const,
        product_data: {
          name: `${event.title} — ${t.tierName}`,
          description: `${event.date} · ${event.location}`,
        },
        unit_amount: Math.round(t.price * 100),
      },
      quantity: t.quantity,
    }))

    const cartJson = JSON.stringify(
      validatedTiers.map((t) => ({
        tierId: t.tierId,
        tierName: t.tierName,
        price: t.price,
        qty: t.quantity,
      }))
    )

    const stripeSession = await getStripe().checkout.sessions.create({
      payment_method_types: ['card'],
      phone_number_collection: { enabled: true },
      line_items: lineItems,
      mode: 'payment',
      success_url: `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}&event=${encodeURIComponent(event.title)}&tier=${encodeURIComponent(validatedTiers[0].tierName)}`,
      cancel_url: `${appUrl}/events/${eventId}`,
      metadata: {
        eventId,
        eventTitle: event.title,
        eventDate: event.date,
        eventLocation: event.location,
        cartJson,
        platformFee: totalFeeCents.toString(),
        hostPayout: (Math.round(totalGross * 100) - totalFeeCents).toString(),
        ...(userId ? { userId } : {}),
        ...(ref ? { ref } : {}),
      },
      ...(hostStripeAccountId
        ? {
            payment_intent_data: {
              application_fee_amount: totalFeeCents,
              transfer_data: { destination: hostStripeAccountId },
            },
          }
        : {
            payment_intent_data: {
              description: `Metlanta — ${event.title}`,
            },
          }),
    })

    const orderSummary: OrderSummary = {
      eventTitle: event.title,
      eventDate: event.date,
      eventLocation: event.location,
      eventImage: event.flyer_url ?? event.image_url ?? null,
      tiers: validatedTiers.map((t) => ({
        name: t.tierName,
        qty: t.quantity,
        unitPrice: t.price,
        subtotal: t.price * t.quantity,
      })),
      subtotal: totalGross,
      total: totalGross,
    }

    return NextResponse.json({
      url: stripeSession.url,
      orderSummary,
    })
  } catch (err: unknown) {
    console.error('Stripe checkout error:', err)
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
