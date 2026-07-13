import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getServiceClient } from '@/lib/supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-04-22.dahlia' })

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const db = getServiceClient()
    const { data: profile } = await db
      .from('host_profiles')
      .select('stripe_account_id')
      .eq('user_id', session.user.id)
      .single()

    if (!profile?.stripe_account_id) {
      return NextResponse.json({ connected: false, balance: null, payouts: [], account: null })
    }

    const acctId = profile.stripe_account_id

    const [account, balance, payouts] = await Promise.all([
      stripe.accounts.retrieve(acctId),
      stripe.balance.retrieve({}, { stripeAccount: acctId }),
      stripe.payouts.list({ limit: 10 }, { stripeAccount: acctId }),
    ])

    const available = balance.available.reduce((s, b) => s + b.amount, 0)
    const pending = balance.pending.reduce((s, b) => s + b.amount, 0)

    return NextResponse.json({
      connected: account.charges_enabled && account.payouts_enabled,
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
      account_id: acctId,
      balance: {
        available: available / 100,
        pending: pending / 100,
        currency: balance.available[0]?.currency ?? 'usd',
      },
      payouts: payouts.data.map((p) => ({
        id: p.id,
        amount: p.amount / 100,
        status: p.status,
        arrival_date: new Date(p.arrival_date * 1000).toISOString().split('T')[0],
        currency: p.currency,
      })),
      payout_schedule: account.settings?.payouts?.schedule,
    })
  } catch (err) {
    console.error('payouts error:', err)
    return NextResponse.json({ connected: false, balance: null, payouts: [], account: null })
  }
}
