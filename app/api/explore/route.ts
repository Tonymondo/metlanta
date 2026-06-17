import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getServiceClient, getLiveEventsPaginated } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') ?? undefined
    const city = searchParams.get('city') ?? undefined
    const cursorId = searchParams.get('cursor') ?? undefined
    const limit = Math.min(Number(searchParams.get('limit') ?? 12), 50)

    // Resolve cursor: need created_at for the cursor event id
    let cursor: { created_at: string; id: string } | undefined

    if (cursorId) {
      const db = getServiceClient()
      const { data: cursorEvent } = await db
        .from('events')
        .select('id, created_at')
        .eq('id', cursorId)
        .single()

      if (cursorEvent) {
        cursor = { id: cursorEvent.id, created_at: cursorEvent.created_at }
      }
    }

    const events = await getLiveEventsPaginated(cursor, limit, { type, city })

    // Determine if authenticated to add social flags
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id ?? null

    let result: typeof events & { has_liked?: boolean; has_saved?: boolean }[] = events as typeof events & {
      has_liked?: boolean
      has_saved?: boolean
    }[]

    if (userId && events.length > 0) {
      const db = getServiceClient()
      const eventIds = events.map((e) => e.id)

      const [{ data: likes }, { data: saves }] = await Promise.all([
        db.from('event_likes').select('event_id').eq('user_id', userId).in('event_id', eventIds),
        db.from('event_saves').select('event_id').eq('user_id', userId).in('event_id', eventIds),
      ])

      const likedSet = new Set((likes ?? []).map((l: { event_id: string }) => l.event_id))
      const savedSet = new Set((saves ?? []).map((s: { event_id: string }) => s.event_id))

      result = events.map((e) => ({
        ...e,
        has_liked: likedSet.has(e.id),
        has_saved: savedSet.has(e.id),
      }))
    }

    // Build next cursor from last item
    const nextCursor =
      result.length === limit ? result[result.length - 1]?.id ?? null : null

    return NextResponse.json({ events: result, nextCursor })
  } catch (err: unknown) {
    console.error('Explore error:', err)
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
