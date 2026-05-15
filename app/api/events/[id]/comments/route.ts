import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getServiceClient, getEventComments } from '@/lib/supabase'

const MAX_COMMENT_LENGTH = 500

// GET /api/events/[id]/comments
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const comments = await getEventComments(params.id)
    return NextResponse.json({ comments })
  } catch (err: unknown) {
    console.error('GET comments error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/events/[id]/comments
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
    const text = (body.text ?? '').trim()

    if (!text) {
      return NextResponse.json({ error: 'Comment text is required' }, { status: 400 })
    }

    if (text.length > MAX_COMMENT_LENGTH) {
      return NextResponse.json(
        { error: `Comment must be ${MAX_COMMENT_LENGTH} characters or fewer` },
        { status: 400 }
      )
    }

    const db = getServiceClient()

    const { data: comment, error } = await db
      .from('event_comments')
      .insert({
        event_id: params.id,
        user_id: session.user.id,
        text,
      })
      .select('*, user:users(id, name, image)')
      .single()

    if (error) {
      console.error('Comment insert error:', error)
      return NextResponse.json({ error: 'Failed to post comment' }, { status: 500 })
    }

    // Atomic increment on comment_count
    await db.rpc('increment_comment_count', { event_id: params.id, delta: 1 })

    return NextResponse.json({ comment }, { status: 201 })
  } catch (err: unknown) {
    console.error('POST comment error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
