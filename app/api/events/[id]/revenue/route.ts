import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getServiceClient } from '@/lib/supabase'

interface TierRevenue {
  name: string
  sold_count: number
  gross: number
  platform_fee: number
  host_payout: number
}

// GET /api/events/[id]/revenue
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = getServiceClient()

    // Verify caller is the event host
    const { data: event } = await db
      .from('events')
      .select('id, host_id')
      .eq('id', params.id)
      .single()

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    if (event.host_id !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch confirmed tickets joined with tier names
    const { data: tickets, error } = await db
      .from('tickets')
      .select(`
        id,
        amount_paid,
        platform_fee,
        host_payout,
        tier:ticket_tiers(id, name)
      `)
      .eq('event_id', params.id)
      .eq('status', 'confirmed')

    if (error) {
      console.error('Revenue query error:', error)
      return NextResponse.json({ error: 'Failed to fetch revenue data' }, { status: 500 })
    }

    const rows = tickets ?? []

    let gross = 0
    let platform_fee = 0
    let host_payout = 0

    const tierMap = new Map<string, TierRevenue>()

    for (const t of (rows as unknown) as Array<{
      id: string
      amount_paid: number
      platform_fee: number
      host_payout: number
      tier: { id: string; name: string } | null
    }>) {
      gross += t.amount_paid
      platform_fee += t.platform_fee
      host_payout += t.host_payout

      const tierKey = t.tier?.id ?? 'unknown'
      const tierName = t.tier?.name ?? 'Unknown'

      if (!tierMap.has(tierKey)) {
        tierMap.set(tierKey, {
          name: tierName,
          sold_count: 0,
          gross: 0,
          platform_fee: 0,
          host_payout: 0,
        })
      }

      const entry = tierMap.get(tierKey)!
      entry.sold_count++
      entry.gross += t.amount_paid
      entry.platform_fee += t.platform_fee
      entry.host_payout += t.host_payout
    }

    const round2 = (n: number) => Math.round(n * 100) / 100

    return NextResponse.json({
      gross: round2(gross),
      platform_fee: round2(platform_fee),
      host_payout: round2(host_payout),
      tickets_total: rows.length,
      by_tier: Array.from(tierMap.values()).map((t) => ({
        name: t.name,
        sold_count: t.sold_count,
        gross: round2(t.gross),
        platform_fee: round2(t.platform_fee),
        host_payout: round2(t.host_payout),
      })),
    })
  } catch (err: unknown) {
    console.error('GET revenue error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
