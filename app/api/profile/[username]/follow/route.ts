import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getServiceClient, getHostProfile } from '@/lib/supabase'

// POST /api/profile/[username]/follow
export async function POST(
  _req: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const profile = await getHostProfile(params.username)
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    if (profile.user_id === session.user.id) {
      return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 })
    }

    const db = getServiceClient()

    const { error } = await db
      .from('follows')
      .upsert(
        { follower_id: session.user.id, following_id: profile.user_id },
        { onConflict: 'follower_id,following_id' }
      )

    if (error) {
      console.error('Follow insert error:', error)
      return NextResponse.json({ error: 'Failed to follow' }, { status: 500 })
    }

    // Atomic increment on host follower_count
    await db.rpc('increment_follower_count', {
      profile_user_id: profile.user_id,
      delta: 1,
    })

    return NextResponse.json({ following: true })
  } catch (err: unknown) {
    console.error('POST follow error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/profile/[username]/follow
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const profile = await getHostProfile(params.username)
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const db = getServiceClient()

    const { error } = await db
      .from('follows')
      .delete()
      .eq('follower_id', session.user.id)
      .eq('following_id', profile.user_id)

    if (error) {
      console.error('Follow delete error:', error)
      return NextResponse.json({ error: 'Failed to unfollow' }, { status: 500 })
    }

    // Atomic decrement
    await db.rpc('increment_follower_count', {
      profile_user_id: profile.user_id,
      delta: -1,
    })

    return NextResponse.json({ following: false })
  } catch (err: unknown) {
    console.error('DELETE follow error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
