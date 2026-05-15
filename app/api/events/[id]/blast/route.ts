import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getServiceClient } from '@/lib/supabase'
import { sendBlastSMS } from '@/lib/sms'

const BLAST_COOLDOWN_MS = 60 * 60 * 1000 // 1 hour

// POST /api/events/[id]/blast
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
    const { message } = body as { message?: string }

    if (!message || message.trim().length === 0) {
      return NextResponse.json({ error: 'message is required' }, { status: 400 })
    }

    if (message.trim().length > 300) {
      return NextResponse.json({ error: 'Message must be 300 characters or fewer' }, { status: 400 })
    }

    const db = getServiceClient()

    // Verify caller is the event host
    const { data: event } = await db
      .from('events')
      .select('id, host_id, title')
      .eq('id', params.id)
      .single()

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    if (event.host_id !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check cooldown — last blast for this event
    const { data: lastBlast } = await db
      .from('sms_blasts')
      .select('created_at')
      .eq('event_id', params.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (lastBlast) {
      const lastBlastTime = new Date(lastBlast.created_at).getTime()
      const elapsed = Date.now() - lastBlastTime
      if (elapsed < BLAST_COOLDOWN_MS) {
        const minutesLeft = Math.ceil((BLAST_COOLDOWN_MS - elapsed) / 60000)
        return NextResponse.json(
          { error: `Please wait ${minutesLeft} more minute(s) before sending another blast` },
          { status: 429 }
        )
      }
    }

    // Fetch confirmed ticket phone numbers for this event
    const { data: tickets } = await db
      .from('tickets')
      .select('phone_number')
      .eq('event_id', params.id)
      .eq('status', 'confirmed')
      .not('phone_number', 'is', null)

    const phones = (tickets ?? [])
      .map((t: { phone_number: string | null }) => t.phone_number)
      .filter((p): p is string => !!p)

    // Send blast
    const sent = await sendBlastSMS({
      phones,
      eventTitle: event.title,
      message: message.trim(),
    })

    // Record the blast
    await db.from('sms_blasts').insert({
      event_id: params.id,
      host_id: session.user.id,
      message: message.trim(),
      sent_count: sent,
    })

    return NextResponse.json({ sent })
  } catch (err: unknown) {
    console.error('POST blast error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
