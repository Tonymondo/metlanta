import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getServiceClient } from '@/lib/supabase'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const db = getServiceClient()

    // Get all host event IDs
    const { data: events } = await db
      .from('events')
      .select('id')
      .eq('host_id', session.user.id)

    const eventIds = (events ?? []).map((e: { id: string }) => e.id)
    if (!eventIds.length) return NextResponse.json({ chargebacks: [], summary: { total: 0, open: 0, lost: 0, won: 0, amount: 0 } })

    const { data } = await db
      .from('chargebacks')
      .select(`
        id, amount, status, evidence_submitted, buyer_email, buyer_name, reason, due_by, created_at,
        stripe_dispute_id,
        event:events(id, title),
        ticket:tickets(id, stripe_session_id, amount_paid)
      `)
      .in('event_id', eventIds)
      .order('created_at', { ascending: false })

    const chargebacks = data ?? []
    const summary = {
      total: chargebacks.length,
      open: chargebacks.filter((c: { status: string }) => c.status === 'needs_response' || c.status === 'under_review').length,
      won: chargebacks.filter((c: { status: string }) => c.status === 'won').length,
      lost: chargebacks.filter((c: { status: string }) => c.status === 'lost').length,
      amount: chargebacks.reduce((s: number, c: { amount: number }) => s + Number(c.amount), 0),
    }

    return NextResponse.json({ chargebacks, summary })
  } catch (err) {
    console.error('chargebacks error:', err)
    return NextResponse.json({ chargebacks: [], summary: { total: 0, open: 0, lost: 0, won: 0, amount: 0 } })
  }
}
