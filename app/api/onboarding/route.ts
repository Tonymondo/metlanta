import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getServiceClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { role, display_name, bio, instagram, username } = body as {
      role?: string
      display_name?: string
      bio?: string
      instagram?: string
      username?: string
    }

    if (!role || !['attendee', 'host', 'promoter'].includes(role)) {
      return NextResponse.json({ error: 'Invalid or missing role' }, { status: 400 })
    }

    if (!username || username.trim().length < 3) {
      return NextResponse.json({ error: 'Username must be at least 3 characters' }, { status: 400 })
    }

    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_.-]/g, '')
    if (cleanUsername !== username.trim().toLowerCase()) {
      return NextResponse.json(
        { error: 'Username may only contain letters, numbers, underscores, dots, and hyphens' },
        { status: 400 }
      )
    }

    const db = getServiceClient()

    // Check username uniqueness
    const { data: existing } = await db
      .from('users')
      .select('id')
      .eq('username', cleanUsername)
      .neq('id', session.user.id)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: 'Username is already taken' }, { status: 409 })
    }

    // Update user record
    const { error: userError } = await db
      .from('users')
      .update({
        role,
        onboarding_complete: true,
        username: cleanUsername,
      })
      .eq('id', session.user.id)

    if (userError) {
      console.error('Onboarding user update error:', userError)
      return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
    }

    // If host or promoter, upsert host_profiles
    if (role === 'host' || role === 'promoter') {
      const { error: profileError } = await db
        .from('host_profiles')
        .upsert(
          {
            user_id: session.user.id,
            username: cleanUsername,
            display_name: display_name?.trim() ?? null,
            bio: bio?.trim() ?? null,
            instagram: instagram?.trim() ?? null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        )

      if (profileError) {
        console.error('Onboarding host_profiles upsert error:', profileError)
        return NextResponse.json({ error: 'Failed to create host profile' }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    console.error('Onboarding error:', err)
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
