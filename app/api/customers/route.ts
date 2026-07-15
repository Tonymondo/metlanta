export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getServiceClient } from '@/lib/supabase'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const db = getServiceClient()

    const { data: events } = await db
      .from('events')
      .select('id, title')
      .eq('host_id', session.user.id)

    const eventIds = (events ?? []).map((e: { id: string }) => e.id)
    if (!eventIds.length) return NextResponse.json({ customers: [] })

    const { data: tickets } = await db
      .from('tickets')
      .select('buyer_email, buyer_name, phone_number, amount_paid, event_id, created_at')
      .in('event_id', eventIds)
      .eq('status', 'confirmed')
      .order('created_at', { ascending: false })

    // Aggregate by email
    const customerMap: Record<string, {
      email: string; name: string | null; phone: string | null;
      total_spent: number; ticket_count: number; events: Set<string>; last_purchase: string
    }> = {}

    const eventTitles: Record<string, string> = {}
    for (const e of events ?? []) eventTitles[e.id] = e.title

    for (const t of tickets ?? []) {
      if (!customerMap[t.buyer_email]) {
        customerMap[t.buyer_email] = {
          email: t.buyer_email,
          name: t.buyer_name ?? null,
          phone: t.phone_number ?? null,
          total_spent: 0,
          ticket_count: 0,
          events: new Set(),
          last_purchase: t.created_at,
        }
      }
      const c = customerMap[t.buyer_email]
      c.total_spent += Number(t.amount_paid)
      c.ticket_count += 1
      c.events.add(eventTitles[t.event_id] ?? t.event_id)
      if (t.created_at > c.last_purchase) c.last_purchase = t.created_at
    }

    const customers = Object.values(customerMap)
      .map((c) => ({ ...c, events: Array.from(c.events) }))
      .sort((a, b) => b.total_spent - a.total_spent)

    return NextResponse.json({ customers })
  } catch (err) {
    console.error('customers error:', err)
    return NextResponse.json({ customers: [] })
  }
}
