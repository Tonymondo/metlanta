import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getServiceClient, getHostProfile } from '@/lib/supabase'

// GET /api/profile/[username]
export async function GET(
  _req: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const profile = await getHostProfile(params.username)
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const db = getServiceClient()

    // Fetch recent live events by this host
    const { data: events } = await db
      .from('events')
      .select('*, ticket_tiers(*)')
      .eq('host_id', profile.user_id)
      .eq('status', 'live')
      .gte('date', new Date().toISOString().split('T')[0])
      .order('date', { ascending: true })
      .limit(6)

    // Check if the authenticated user is following this profile
    const session = await getServerSession(authOptions)
    const viewerId = session?.user?.id ?? null

    let is_following = false
    if (viewerId && viewerId !== profile.user_id) {
      const { data: follow } = await db
        .from('follows')
        .select('id')
        .eq('follower_id', viewerId)
        .eq('following_id', profile.user_id)
        .maybeSingle()
      is_following = !!follow
    }

    return NextResponse.json({
      profile: {
        ...profile,
        follower_count: profile.follower_count ?? 0,
      },
      events: events ?? [],
      is_following,
    })
  } catch (err: unknown) {
    console.error('GET profile error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
