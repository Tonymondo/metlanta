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

  const [{ data: user }, { count: ticketCount }] = await Promise.all([
    db.from('users').select('*').eq('email', session.user.email).single(),
    db.from('tickets').select('*', { count: 'exact', head: true }).eq('buyer_email', session.user.email).eq('status', 'confirmed'),
  ])

  const attended = ticketCount ?? 0
  const discount = attended >= 10 ? 10 : attended >= 5 ? 5 : 0
  const nextMilestone = attended >= 10 ? 10 : 10
  const progressLabel = attended >= 10 ? 'Max discount reached!' : `${10 - attended} more event${10 - attended === 1 ? '' : 's'} to reach 10% off`

  return NextResponse.json({
    user,
    stats: { attended, discount, progressLabel, nextMilestone, memberSince: user?.created_at ?? null },
  })
}
