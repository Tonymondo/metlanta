import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getServiceClient } from '@/lib/supabase'

// POST /api/events/[id]/checkin
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { ticket_id } = body as { ticket_id?: string }

    if (!ticket_id) {
      return NextResponse.json({ error: 'ticket_id is required' }, { status: 400 })
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

    // Update ticket — must belong to this event and be confirmed
    const { data: ticket, error } = await db
      .from('tickets')
      .update({
        checked_in: true,
        checked_in_at: new Date().toISOString(),
      })
      .eq('id', ticket_id)
      .eq('event_id', params.id)
      .eq('status', 'confirmed')
      .select('id, buyer_name')
      .single()

    if (error || !ticket) {
      console.error('Check-in error:', error)
      return NextResponse.json(
        { error: 'Ticket not found, already checked in, or does not belong to this event' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, buyer_name: ticket.buyer_name })
  } catch (err: unknown) {
    console.error('POST checkin error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
