import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { getServiceClient } from '@/lib/supabase'
import { sendTicketConfirmationSMS } from '@/lib/sms'
import { calculateFee } from '@/lib/fees'
import Stripe from 'stripe'

interface CartItem {
  tierId: string
  tierName: string
  price: number
  qty: number
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Webhook error'
    console.error('Webhook verification failed:', message)
    return NextResponse.json({ error: message }, { status: 400 })
  }

  const db = getServiceClient()

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const meta = session.metadata ?? {}

    const phone = session.customer_details?.phone ?? null
    const amountTotal = session.amount_total ? session.amount_total / 100 : 0
    const { fee: totalFee } = calculateFee(amountTotal)

    // Parse cart items from metadata
    let cartItems: CartItem[] = []
    try {
      cartItems = JSON.parse(meta.cartJson ?? '[]')
    } catch {
      console.error('Failed to parse cartJson:', meta.cartJson)
    }

    const totalGross = cartItems.reduce((s, t) => s + t.price * t.qty, 0)

    let firstTicketId = ''

    for (const item of cartItems) {
      // Proportionally split fee across line items
      const itemGross = item.price * item.qty
      const itemFeeTotal = totalGross > 0 ? (itemGross / totalGross) * totalFee : 0
      const feePerTicket = item.qty > 0 ? itemFeeTotal / item.qty : 0
      const payoutPerTicket = item.price - feePerTicket

      for (let i = 0; i < item.qty; i++) {
        const { data: ticket } = await db.from('tickets').insert({
          event_id: meta.eventId,
          tier_id: item.tierId,
          buyer_email: session.customer_details?.email ?? '',
          buyer_name: session.customer_details?.name ?? '',
          stripe_session_id: session.id,
          stripe_payment_intent: session.payment_intent as string,
          amount_paid: item.price,
          platform_fee: feePerTicket,
          host_payout: payoutPerTicket,
          status: 'confirmed',
          phone_number: phone,
          ...(meta.userId ? { user_id: meta.userId } : {}),
        }).select('id').single()

        if (ticket?.id && !firstTicketId) firstTicketId = ticket.id

        // Increment sold count per ticket
        await db.rpc('increment_sold_count', { tier_id: item.tierId, qty: 1 })
      }
    }

    // Send SMS confirmation for first ticket
    if (phone && cartItems.length > 0) {
      await sendTicketConfirmationSMS({
        to: phone,
        eventTitle: meta.eventTitle ?? 'your event',
        eventDate: meta.eventDate ?? '',
        eventLocation: meta.eventLocation ?? '',
        tierName: cartItems[0].tierName ?? 'General',
        ticketId: firstTicketId,
      })
    }
  }

  if (event.type === 'payment_intent.payment_failed') {
    const intent = event.data.object as Stripe.PaymentIntent
    console.error('Payment failed:', intent.id)
  }

  return NextResponse.json({ received: true })
}
