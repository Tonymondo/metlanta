import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getServiceClient, getEventWithSocial } from '@/lib/supabase'

// GET /api/events/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    const event = await getEventWithSocial(params.id, userId)
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    return NextResponse.json({ event })
  } catch (err: unknown) {
    console.error('GET event error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/events/[id]
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = getServiceClient()

    // Verify ownership
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

    const body = await req.json()
    const {
      title,
      description,
      date,
      time,
      location,
      capacity,
      status,
      flyer_url,
      event_type,
      age_policy,
      tiers,
    } = body

    const updateData: Record<string, unknown> = {}
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (date !== undefined) updateData.date = date
    if (time !== undefined) updateData.time = time
    if (location !== undefined) updateData.location = location
    if (capacity !== undefined) updateData.capacity = Number(capacity)
    if (status !== undefined) updateData.status = status
    if (flyer_url !== undefined) updateData.flyer_url = flyer_url
    if (event_type !== undefined) updateData.event_type = event_type
    if (age_policy !== undefined) updateData.age_policy = age_policy

    const { data: updated, error: updateError } = await db
      .from('events')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (updateError) {
      console.error('Event update error:', updateError)
      return NextResponse.json({ error: 'Failed to update event' }, { status: 500 })
    }

    // Upsert ticket tiers if provided
    if (Array.isArray(tiers) && tiers.length > 0) {
      for (const tier of tiers) {
        if (!tier.name) continue
        const tierData = {
          event_id: params.id,
          name: tier.name,
          price: Number(tier.price) || 0,
          capacity: tier.capacity ? Number(tier.capacity) : null,
          sort_order: tier.sort_order ?? 0,
        }

        if (tier.id) {
          await db.from('ticket_tiers').update(tierData).eq('id', tier.id)
        } else {
          await db.from('ticket_tiers').insert(tierData)
        }
      }
    }

    return NextResponse.json({ event: updated })
  } catch (err: unknown) {
    console.error('PATCH event error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/events/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = getServiceClient()

    // Verify ownership
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

    const { error } = await db
      .from('events')
      .update({ status: 'cancelled' })
      .eq('id', params.id)

    if (error) {
      console.error('Event cancel error:', error)
      return NextResponse.json({ error: 'Failed to cancel event' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    console.error('DELETE event error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
