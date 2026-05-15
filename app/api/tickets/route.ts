import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getServiceClient } from '@/lib/supabase'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = getServiceClient()
  const { data: tickets } = await db
    .from('tickets')
    .select('*, events(id, title, date, time, location, image_url, event_type), ticket_tiers(name, price)')
    .eq('buyer_email', session.user.email)
    .eq('status', 'confirmed')
    .order('created_at', { ascending: false })

  return NextResponse.json({ tickets: tickets ?? [] })
}
