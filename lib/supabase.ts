import { createClient, SupabaseClient } from '@supabase/supabase-js'

function getBrowserClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('Supabase env vars not set')
  return createClient(url, key)
}

// Server-only client (bypasses RLS, used in API routes)
export function getServiceClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (!url || !key) throw new Error('Supabase service env vars not set')
  return createClient(url, key, { auth: { persistSession: false } })
}

// Public browser client — lazy singleton
let _browser: SupabaseClient | null = null
export function getSupabase(): SupabaseClient {
  if (!_browser) _browser = getBrowserClient()
  return _browser
}


// ── Types ────────────────────────────────────────────────────────────────────

export type UserRole = 'attendee' | 'host' | 'promoter' | 'admin'
export type EventStatus = 'draft' | 'live' | 'ended' | 'cancelled'
export type TicketStatus = 'pending' | 'confirmed' | 'refunded'

export interface DbUser {
  id: string
  email: string
  name: string | null
  image: string | null
  role: UserRole
  onboarding_complete: boolean
  username: string | null
  created_at: string
}

export interface DbHostProfile {
  id: string
  user_id: string
  display_name: string | null
  bio: string | null
  instagram: string | null
  verified: boolean
  stripe_account_id: string | null
  username: string | null
  avatar_url: string | null
  banner_url: string | null
  twitter: string | null
  location: string | null
  follower_count: number
  updated_at: string | null
}

export interface DbEvent {
  id: string
  host_id: string
  title: string
  description: string | null
  date: string
  time: string | null
  end_time: string | null
  location: string
  city: string
  state: string
  capacity: number
  status: EventStatus
  image_url: string | null
  event_type: string | null
  age_policy: string | null
  created_at: string
  slug: string | null
  flyer_url: string | null
  like_count: number
  save_count: number
  comment_count: number
  view_count: number
  is_featured: boolean
  ticket_tiers?: DbTicketTier[]
  host?: DbUser
}

export interface DbTicketTier {
  id: string
  event_id: string
  name: string
  price: number
  capacity: number | null
  sold_count: number
  sort_order: number
}

export interface DbTicket {
  id: string
  event_id: string
  tier_id: string
  buyer_email: string
  buyer_name: string | null
  stripe_session_id: string
  amount_paid: number
  platform_fee: number
  host_payout: number
  status: TicketStatus
  checked_in: boolean
  checked_in_at: string | null
  user_id: string | null
  created_at: string
}

export interface DbEventLike {
  id: string
  event_id: string
  user_id: string
  created_at: string
}

export interface DbEventSave {
  id: string
  event_id: string
  user_id: string
  created_at: string
}

export interface DbComment {
  id: string
  event_id: string
  user_id: string
  text: string
  created_at: string
  user?: Pick<DbUser, 'id' | 'name' | 'image'>
}

export interface DbFollow {
  id: string
  follower_id: string
  following_id: string
  created_at: string
}

export interface DbSmsBlast {
  id: string
  event_id: string
  host_id: string
  message: string
  sent_count: number
  created_at: string
}

// ── Query helpers ─────────────────────────────────────────────────────────────

export async function upsertUser(user: {
  email: string
  name?: string | null
  image?: string | null
}) {
  const db = getServiceClient()
  const { data, error } = await db
    .from('users')
    .upsert({ email: user.email, name: user.name, image: user.image }, { onConflict: 'email' })
    .select()
    .single()
  if (error) console.error('upsertUser error:', error)
  return data as DbUser | null
}

export async function getUserByEmail(email: string) {
  const db = getServiceClient()
  const { data } = await db.from('users').select('*').eq('email', email).single()
  return data as DbUser | null
}

export async function getLiveEvents() {
  const { data } = await getServiceClient()
    .from('events')
    .select('*, ticket_tiers(*)')
    .eq('status', 'live')
    .gte('date', new Date().toISOString().split('T')[0])
    .order('date', { ascending: true })
    .limit(12)
  return (data ?? []) as DbEvent[]
}

export async function getEventById(id: string) {
  const { data } = await getServiceClient()
    .from('events')
    .select('*, ticket_tiers(*), host:users(id, name, image)')
    .eq('id', id)
    .single()
  return data as DbEvent | null
}

export async function getHostEvents(hostId: string) {
  const db = getServiceClient()
  const { data } = await db
    .from('events')
    .select('*, ticket_tiers(*)')
    .eq('host_id', hostId)
    .order('created_at', { ascending: false })
  return (data ?? []) as DbEvent[]
}

export async function getHostStats(hostId: string) {
  const db = getServiceClient()
  const { data: events } = await db
    .from('events')
    .select('id, status')
    .eq('host_id', hostId)

  const eventIds = (events ?? []).map((e: { id: string }) => e.id)
  if (!eventIds.length) return { totalRevenue: 0, totalTickets: 0, liveEvents: 0 }

  const { data: tickets } = await db
    .from('tickets')
    .select('amount_paid, host_payout')
    .in('event_id', eventIds)
    .eq('status', 'confirmed')

  const totalRevenue = (tickets ?? []).reduce((s: number, t: { host_payout: number }) => s + t.host_payout, 0)
  const totalTickets = (tickets ?? []).length
  const liveEvents = (events ?? []).filter((e: { status: string }) => e.status === 'live').length

  return { totalRevenue, totalTickets, liveEvents }
}

// ── Extended query helpers ────────────────────────────────────────────────────

export async function getEventWithSocial(id: string, userId?: string) {
  const db = getServiceClient()
  const { data: event, error } = await db
    .from('events')
    .select(`
      *,
      ticket_tiers(*),
      host_profiles(
        id, user_id, display_name, bio, instagram, verified,
        username, avatar_url, banner_url, twitter, location, follower_count
      ),
      host:users!events_host_id_fkey(id, name, image, username)
    `)
    .eq('id', id)
    .single()

  if (error || !event) return null

  let has_liked = false
  let has_saved = false

  if (userId) {
    const [{ data: like }, { data: save }] = await Promise.all([
      db.from('event_likes').select('id').eq('event_id', id).eq('user_id', userId).maybeSingle(),
      db.from('event_saves').select('id').eq('event_id', id).eq('user_id', userId).maybeSingle(),
    ])
    has_liked = !!like
    has_saved = !!save
  }

  return { ...event, has_liked, has_saved }
}

export async function getLiveEventsPaginated(
  cursor?: { created_at: string; id: string },
  limit = 12,
  filters?: { type?: string; city?: string }
) {
  const db = getServiceClient()
  let query = db
    .from('events')
    .select('*, ticket_tiers(*)')
    .eq('status', 'live')
    .gte('date', new Date().toISOString().split('T')[0])
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .limit(limit)

  if (filters?.type) query = query.eq('event_type', filters.type)
  if (filters?.city) query = query.ilike('city', `%${filters.city}%`)

  if (cursor) {
    query = query.or(
      `created_at.lt.${cursor.created_at},and(created_at.eq.${cursor.created_at},id.lt.${cursor.id})`
    )
  }

  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as DbEvent[]
}

export async function getHostProfile(username: string) {
  const db = getServiceClient()
  const { data, error } = await db
    .from('host_profiles')
    .select('*, user:users(id, name, image, email, username, role)')
    .eq('username', username)
    .single()
  if (error) return null
  return data
}

export async function getEventComments(eventId: string) {
  const db = getServiceClient()
  const { data, error } = await db
    .from('event_comments')
    .select('*, user:users(id, name, image)')
    .eq('event_id', eventId)
    .order('created_at', { ascending: true })
    .limit(50)
  if (error) throw error
  return (data ?? []) as DbComment[]
}

export async function getEventAttendees(eventId: string) {
  const db = getServiceClient()
  const { data, error } = await db
    .from('tickets')
    .select(`
      id, buyer_name, buyer_email, amount_paid, checked_in, phone_number,
      tier:ticket_tiers(name)
    `)
    .eq('event_id', eventId)
    .eq('status', 'confirmed')
  if (error) throw error
  return (data ?? []).map((t: Record<string, unknown>) => ({
    id: t.id,
    buyer_name: t.buyer_name,
    buyer_email: t.buyer_email,
    tier_name: (t.tier as { name: string } | null)?.name ?? null,
    amount_paid: t.amount_paid,
    checked_in: t.checked_in,
    phone_number: t.phone_number,
  }))
}
