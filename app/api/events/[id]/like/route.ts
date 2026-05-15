import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getServiceClient } from '@/lib/supabase'

// POST /api/events/[id]/like
export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = getServiceClient()
    const eventId = params.id
    const userId = session.user.id

    // Idempotent insert
    const { error } = await db
      .from('event_likes')
      .upsert({ event_id: eventId, user_id: userId }, { onConflict: 'event_id,user_id' })

    if (error) {
      console.error('Like insert error:', error)
      return NextResponse.json({ error: 'Failed to like event' }, { status: 500 })
    }

    // Atomic increment
    await db.rpc('increment_like_count', { event_id: eventId, delta: 1 })

    const { data: event } = await db
      .from('events')
      .select('like_count')
      .eq('id', eventId)
      .single()

    return NextResponse.json({ liked: true, like_count: event?.like_count ?? 0 })
  } catch (err: unknown) {
    console.error('POST like error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/events/[id]/like
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = getServiceClient()
    const eventId = params.id
    const userId = session.user.id

    const { error } = await db
      .from('event_likes')
      .delete()
      .eq('event_id', eventId)
      .eq('user_id', userId)

    if (error) {
      console.error('Like delete error:', error)
      return NextResponse.json({ error: 'Failed to unlike event' }, { status: 500 })
    }

    // Atomic decrement (floor at 0 handled by DB)
    await db.rpc('increment_like_count', { event_id: eventId, delta: -1 })

    const { data: event } = await db
      .from('events')
      .select('like_count')
      .eq('id', eventId)
      .single()

    return NextResponse.json({ liked: false, like_count: event?.like_count ?? 0 })
  } catch (err: unknown) {
    console.error('DELETE like error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
