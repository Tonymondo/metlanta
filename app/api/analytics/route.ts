import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getServiceClient } from '@/lib/supabase'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const db = getServiceClient()

    // Get host profile
    const { data: profile } = await db
      .from('host_profiles')
      .select('id')
      .eq('user_id', session.user.id)
      .single()

    // Get all host events
    const { data: events } = await db
      .from('events')
      .select('id, title, status, date, capacity')
      .eq('host_id', session.user.id)

    const eventIds = (events ?? []).map((e: { id: string }) => e.id)

    if (!eventIds.length) {
      return NextResponse.json({
        dailyRevenue: [],
        topEvents: [],
        summary: { totalRevenue: 0, totalTickets: 0, avgTicket: 0, conversionRate: 0 },
      })
    }

    // Get all confirmed tickets for these events
    const { data: tickets } = await db
      .from('tickets')
      .select('event_id, amount_paid, host_payout, platform_fee, created_at')
      .in('event_id', eventIds)
      .eq('status', 'confirmed')
      .order('created_at', { ascending: true })

    const allTickets = tickets ?? []

    // Daily revenue (last 30 days)
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const dailyMap: Record<string, { revenue: number; tickets: number }> = {}

    for (let i = 0; i < 30; i++) {
      const d = new Date(thirtyDaysAgo.getTime() + i * 24 * 60 * 60 * 1000)
      const key = d.toISOString().split('T')[0]
      dailyMap[key] = { revenue: 0, tickets: 0 }
    }

    for (const t of allTickets) {
      const day = t.created_at.split('T')[0]
      if (dailyMap[day]) {
        dailyMap[day].revenue += Number(t.host_payout)
        dailyMap[day].tickets += 1
      }
    }

    const dailyRevenue = Object.entries(dailyMap).map(([day, v]) => ({ day, ...v }))

    // Revenue by event
    const eventRevenueMap: Record<string, { revenue: number; tickets: number; title: string }> = {}
    for (const e of events ?? []) {
      eventRevenueMap[e.id] = { revenue: 0, tickets: 0, title: e.title }
    }
    for (const t of allTickets) {
      if (eventRevenueMap[t.event_id]) {
        eventRevenueMap[t.event_id].revenue += Number(t.host_payout)
        eventRevenueMap[t.event_id].tickets += 1
      }
    }

    const topEvents = Object.entries(eventRevenueMap)
      .map(([id, v]) => ({ id, ...v }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    // Summary
    const totalRevenue = allTickets.reduce((s: number, t: { host_payout: number }) => s + Number(t.host_payout), 0)
    const totalTickets = allTickets.length
    const avgTicket = totalTickets > 0 ? totalRevenue / totalTickets : 0
    const totalCap = (events ?? []).reduce((s: number, e: { capacity: number }) => s + (e.capacity ?? 0), 0)
    const conversionRate = totalCap > 0 ? Math.min((totalTickets / totalCap) * 100, 100) : 0

    return NextResponse.json({ dailyRevenue, topEvents, summary: { totalRevenue, totalTickets, avgTicket, conversionRate } })
  } catch (err) {
    console.error('analytics error:', err)
    return NextResponse.json({ dailyRevenue: [], topEvents: [], summary: { totalRevenue: 0, totalTickets: 0, avgTicket: 0, conversionRate: 0 } })
  }
}
