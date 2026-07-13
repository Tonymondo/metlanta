import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getServiceClient } from '@/lib/supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-04-22.dahlia' })

// POST — create Connect account + onboarding link
export async function POST(req: NextRequest) {
  try {
    // Read body FIRST before any other async ops (Next.js stream can only be read once)
    const body = await req.json().catch(() => ({}))

    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated. Please sign in and try again.' }, { status: 401 })
    }
    if (!session.user.email) {
      return NextResponse.json({ error: 'Account email is missing. Please sign out and sign back in.' }, { status: 400 })
    }

    const db = getServiceClient()

    // Safely look up existing stripe account — don't throw if column/table missing
    let accountId: string | null = null
    try {
      const { data: profile } = await db
        .from('host_profiles')
        .select('stripe_account_id')
        .eq('user_id', session.user.id)
        .single()
      accountId = profile?.stripe_account_id ?? null
    } catch {
      // Table or column may not exist yet — proceed to create account
    }

    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        email: session.user.email,
        capabilities: { card_payments: { requested: true }, transfers: { requested: true } },
        business_type: 'individual',
        metadata: { metlanta_user_id: session.user.id },
      })
      accountId = account.id

      // Upsert — best effort, don't fail if it errors
      try {
        await db.from('host_profiles').upsert({
          user_id: session.user.id,
          stripe_account_id: accountId,
          display_name: session.user.name ?? '',
        }, { onConflict: 'user_id' })
      } catch (dbErr) {
        console.error('host_profiles upsert error (non-fatal):', dbErr)
      }
    }

    const returnPath  = body.return_url  ?? '/dashboard?stripe=success'
    const refreshPath = body.refresh_url ?? '/dashboard?stripe=refresh'
    const origin = (process.env.NEXTAUTH_URL ?? 'https://www.metlanta.app').replace(/\/$/, '')

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${origin}${refreshPath}`,
      return_url:  `${origin}${returnPath}`,
      type: 'account_onboarding',
    })

    return NextResponse.json({ url: accountLink.url })
  } catch (err: unknown) {
    console.error('Stripe Connect POST error:', err)
    const msg = err instanceof Error ? err.message : 'Failed to create Stripe account'
    const needsSignup = msg.includes('signed up for Connect') || msg.includes('connect.stripe.com')
    return NextResponse.json({
      error: needsSignup
        ? 'Your Stripe account needs Connect enabled. This takes 2 minutes to activate.'
        : msg,
      needs_connect_signup: needsSignup
    }, { status: 500 })
  }
}

// GET — check Connect account status
export async function GET(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ connected: false, status: 'none' })

    const db = getServiceClient()

    let stripeAccountId: string | null = null
    try {
      const { data: profile } = await db
        .from('host_profiles')
        .select('stripe_account_id')
        .eq('user_id', session.user.id)
        .single()
      stripeAccountId = profile?.stripe_account_id ?? null
    } catch {
      return NextResponse.json({ connected: false, status: 'none' })
    }

    if (!stripeAccountId) return NextResponse.json({ connected: false, status: 'none' })

    const account = await stripe.accounts.retrieve(stripeAccountId)
    const fullyOnboarded = account.charges_enabled && account.payouts_enabled

    return NextResponse.json({
      connected: fullyOnboarded,
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
      status: fullyOnboarded ? 'active' : 'pending',
      account_id: stripeAccountId,
    })
  } catch (err: unknown) {
    console.error('Stripe Connect GET error:', err)
    return NextResponse.json({ connected: false, status: 'error' })
  }
}
