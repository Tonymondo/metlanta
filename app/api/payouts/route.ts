export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getServiceClient } from '@/lib/supabase'
import { getStripe } from '@/lib/stripe'

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

    const stripe = getStripe()
    const [account, balance, payouts] = await Promise.all([
      stripe.accounts.retrieve(acctId),
      stripe.balance.retrieve({}, { stripeAccount: acctId }),
      stripe.payouts.list({ limit: 25 }, { stripeAccount: acctId }),
    ])

    const available = balance.available.reduce((s, b) => s + b.amount, 0) / 100
    const pending = balance.pending.reduce((s, b) => s + b.amount, 0) / 100

    const payoutList = payouts.data.map((p) => ({
      id: p.id,
      amount: p.amount / 100,
      status: p.status,
      arrival_date: new Date(p.arrival_date * 1000).toISOString().split('T')[0],
      currency: p.currency,
    }))

    const totalPaidOut = payoutList.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0)
    const totalEarned = available + pending + totalPaidOut

    return NextResponse.json({
      connected: account.charges_enabled && account.payouts_enabled,
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
      account_id: acctId,
      balance: {
        available,
        pending,
        currency: balance.available[0]?.currency ?? 'usd',
      },
      totalEarned,
      totalPaidOut,
      payouts: payoutList,
      payout_schedule: account.settings?.payouts?.schedule,
    })
  } catch (err) {
    console.error('payouts error:', err)
    return NextResponse.json({ connected: false, balance: null, payouts: [], account: null })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { amount, method } = await req.json() as { amount: number; method: 'standard' | 'instant' }
    if (!amount || amount <= 0) return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })

    const db = getServiceClient()
    const { data: profile } = await db
      .from('host_profiles')
      .select('stripe_account_id')
      .eq('user_id', session.user.id)
      .single()

    if (!profile?.stripe_account_id) {
      return NextResponse.json({ error: 'Stripe account not connected' }, { status: 400 })
    }

    const stripe = getStripe()
    const payout = await stripe.payouts.create(
      {
        amount: Math.round(amount * 100),
        currency: 'usd',
        method: method === 'instant' ? 'instant' : 'standard',
      },
      { stripeAccount: profile.stripe_account_id }
    )

    return NextResponse.json({
      id: payout.id,
      amount: payout.amount / 100,
      status: payout.status,
      arrival_date: new Date(payout.arrival_date * 1000).toISOString().split('T')[0],
    })
  } catch (err) {
    console.error('payout create error:', err)
    const msg = err instanceof Error ? err.message : 'Failed to create payout'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
