import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getServiceClient } from '@/lib/supabase'

// GET /api/events/[id]/attendees
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

    const { data: tickets, error } = await db
      .from('tickets')
      .select(`
        id,
        buyer_name,
        buyer_email,
        amount_paid,
        checked_in,
        phone_number,
        tier:ticket_tiers(name)
      `)
      .eq('event_id', params.id)
      .eq('status', 'confirmed')
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Attendees query error:', error)
      return NextResponse.json({ error: 'Failed to fetch attendees' }, { status: 500 })
    }

    const attendees = (tickets ?? []).map((t: Record<string, unknown>) => ({
      id: t.id,
      buyer_name: t.buyer_name,
      buyer_email: t.buyer_email,
      tier_name: (t.tier as { name: string } | null)?.name ?? null,
      amount_paid: t.amount_paid,
      checked_in: t.checked_in,
      phone_number: t.phone_number,
    }))

    return NextResponse.json({ attendees })
  } catch (err: unknown) {
    console.error('GET attendees error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
