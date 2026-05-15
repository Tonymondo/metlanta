import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { getServiceClient } from '@/lib/supabase'
import { sendTicketConfirmationSMS } from '@/lib/sms'
import Stripe from 'stripe'

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

    // Confirm ticket + update sold_count
    const { data: ticket } = await db
      .from('tickets')
      .update({
        status: 'confirmed',
        buyer_email: session.customer_details?.email ?? '',
        buyer_name: session.customer_details?.name ?? '',
        stripe_payment_intent: session.payment_intent as string,
        phone_number: phone,
      })
      .eq('stripe_session_id', session.id)
      .select()
      .single()

    // Increment sold_count on the tier
    if (ticket?.tier_id) {
      await db.rpc('increment_sold_count', { tier_id: ticket.tier_id, qty: 1 })
    }

    // Send SMS confirmation
    if (phone) {
      await sendTicketConfirmationSMS({
        to: phone,
        eventTitle: meta.eventTitle ?? 'your event',
        eventDate: meta.eventDate ?? '',
        eventLocation: meta.eventLocation ?? '',
        tierName: meta.tierName ?? 'General',
        ticketId: ticket?.id ?? '',
      })
    }

    console.log('✅ Ticket confirmed:', {
      session: session.id,
      event: meta.eventTitle,
      tier: meta.tierName,
      amount: session.amount_total,
      buyer: session.customer_details?.email,
      sms: phone ? 'sent' : 'no phone',
    })
  }

  if (event.type === 'payment_intent.payment_failed') {
    const intent = event.data.object as Stripe.PaymentIntent
    console.error('❌ Payment failed:', intent.id)
  }

  return NextResponse.json({ received: true })
}
