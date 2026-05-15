import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getServiceClient } from '@/lib/supabase'

// Upgrade current user to host
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { displayName, bio, instagram } = await req.json()
  const db = getServiceClient()

  // Upgrade role
  await db.from('users').update({ role: 'host' }).eq('id', session.user.id)

  // Upsert host profile
  const { data, error } = await db
    .from('host_profiles')
    .upsert(
      { user_id: session.user.id, display_name: displayName, bio, instagram },
      { onConflict: 'user_id' }
    )
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: 'Failed to create host profile' }, { status: 500 })
  }

  return NextResponse.json({ host: data }, { status: 201 })
}
