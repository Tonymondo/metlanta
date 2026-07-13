import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getServiceClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { host_type, brand_name, instagram, tiktok, website, city, state, phone, email, bio } = body

    const db = getServiceClient()

    // Ensure user is a host
    await db.from('users').update({ role: 'host' }).eq('id', session.user.id)

    // Upsert host profile with extended business data
    const { error } = await db.from('host_profiles').upsert({
      user_id:    session.user.id,
      host_type,
      brand_name,
      display_name: brand_name || session.user.name || '',
      instagram:  instagram?.replace('@', ''),
      tiktok:     tiktok?.replace('@', ''),
      website,
      city,
      state,
      phone,
      bio,
      onboarding_step: 2,
    }, { onConflict: 'user_id' })

    if (error) {
      console.error('host setup error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('host/setup error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function GET(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const db = getServiceClient()
    const { data } = await db
      .from('host_profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .single()

    return NextResponse.json(data ?? {})
  } catch {
    return NextResponse.json({})
  }
}
