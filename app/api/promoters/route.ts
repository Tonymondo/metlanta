import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getServiceClient } from '@/lib/supabase'

function generateCode(length = 8): string {
  return Math.random().toString(36).substring(2, 2 + length).toUpperCase()
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const db = getServiceClient()

    const { data: profile } = await db
      .from('host_profiles')
      .select('id')
      .eq('user_id', session.user.id)
      .single()

    if (!profile) return NextResponse.json({ promoters: [] })

    const { data } = await db
      .from('promoter_links')
      .select(`
        id, code, commission_pct, clicks, conversions, revenue_generated, active, created_at,
        event:events(id, title),
        promoter:users(id, name, image, email)
      `)
      .eq('host_id', profile.id)
      .order('created_at', { ascending: false })

    return NextResponse.json({ promoters: data ?? [] })
  } catch (err) {
    console.error('promoters GET error:', err)
    return NextResponse.json({ promoters: [] })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { event_id, commission_pct, promoter_email } = await req.json()

    const db = getServiceClient()

    const { data: profile } = await db
      .from('host_profiles')
      .select('id')
      .eq('user_id', session.user.id)
      .single()

    if (!profile) return NextResponse.json({ error: 'Host profile not found' }, { status: 404 })

    // Verify host owns this event
    const { data: event } = await db
      .from('events')
      .select('id')
      .eq('id', event_id)
      .eq('host_id', session.user.id)
      .single()

    if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 })

    // Find promoter by email (optional)
    let promoter_user_id: string | null = null
    if (promoter_email) {
      const { data: promoterUser } = await db.from('users').select('id').eq('email', promoter_email).single()
      promoter_user_id = promoterUser?.id ?? null
    }

    const code = generateCode()
    const { data, error } = await db.from('promoter_links').insert({
      host_id: profile.id,
      event_id,
      promoter_user_id,
      code,
      commission_pct: commission_pct ?? 10,
    }).select().single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ promoter: data, code })
  } catch (err) {
    console.error('promoters POST error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await req.json()
    const db = getServiceClient()

    const { data: profile } = await db.from('host_profiles').select('id').eq('user_id', session.user.id).single()
    if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await db.from('promoter_links').delete().eq('id', id).eq('host_id', profile.id)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
