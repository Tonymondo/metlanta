import { createClient, SupabaseClient } from '@supabase/supabase-js'

function getBrowserClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('Supabase env vars not set')
  return createClient(url, key)
}

// Server-only client (bypasses RLS, used in API routes)
export function getServiceClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
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

export type UserRole = 'attendee' | 'host' | 'admin'
export type EventStatus = 'draft' | 'live' | 'ended' | 'cancelled'
export type TicketStatus = 'pending' | 'confirmed' | 'refunded'

export interface DbUser {
  id: string
  email: string
  name: string | null
  image: string | null
  role: UserRole
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
