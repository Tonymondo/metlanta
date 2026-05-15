import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getServiceClient, getLiveEvents } from '@/lib/supabase'

export async function GET() {
  const events = await getLiveEvents()
  return NextResponse.json({ events })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (session.user.role !== 'host' && session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Host account required' }, { status: 403 })
  }

  const body = await req.json()
  const { title, description, date, time, end_time, location, city, capacity, event_type, age_policy, tiers } = body

  if (!title || !date || !location || !capacity) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const db = getServiceClient()

  const { data: event, error: eventError } = await db
    .from('events')
    .insert({
      host_id: session.user.id,
      title,
      description,
      date,
      time,
      end_time,
      location,
      city: city || 'Atlanta',
      capacity: Number(capacity),
      event_type,
      age_policy,
      status: 'live',
    })
    .select()
    .single()

  if (eventError || !event) {
    console.error('event insert error:', eventError)
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 })
  }

  if (Array.isArray(tiers) && tiers.length > 0) {
    const tierRows = tiers
      .filter((t: { name: string; price: number }) => t.name)
      .map((t: { name: string; price: number }, i: number) => ({
        event_id: event.id,
        name: t.name,
        price: Number(t.price) || 0,
        sort_order: i,
      }))

    if (tierRows.length) {
      const { error: tierError } = await db.from('ticket_tiers').insert(tierRows)
      if (tierError) console.error('tier insert error:', tierError)
    }
  }

  return NextResponse.json({ event }, { status: 201 })
}
