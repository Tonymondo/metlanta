import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getServiceClient } from '@/lib/supabase'

// POST /api/events/[id]/save
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

    const { error } = await db
      .from('event_saves')
      .upsert({ event_id: eventId, user_id: userId }, { onConflict: 'event_id,user_id' })

    if (error) {
      console.error('Save insert error:', error)
      return NextResponse.json({ error: 'Failed to save event' }, { status: 500 })
    }

    await db.rpc('increment_save_count', { event_id: eventId, delta: 1 })

    return NextResponse.json({ saved: true })
  } catch (err: unknown) {
    console.error('POST save error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/events/[id]/save
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
      .from('event_saves')
      .delete()
      .eq('event_id', eventId)
      .eq('user_id', userId)

    if (error) {
      console.error('Save delete error:', error)
      return NextResponse.json({ error: 'Failed to unsave event' }, { status: 500 })
    }

    await db.rpc('increment_save_count', { event_id: eventId, delta: -1 })

    return NextResponse.json({ saved: false })
  } catch (err: unknown) {
    console.error('DELETE save error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
