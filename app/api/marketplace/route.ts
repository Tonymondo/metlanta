import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getServiceClient } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category')
  const search = searchParams.get('q')

  const db = getServiceClient()
  let query = db
    .from('marketplace_services')
    .select('*')
    .eq('is_approved', true)
    .order('created_at', { ascending: false })
    .limit(48)

  if (category && category !== 'all') {
    query = query.eq('category', category)
  }
  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,provider_name.ilike.%${search}%`)
  }

  const { data, error } = await query
  if (error) {
    console.error('marketplace GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 })
  }

  return NextResponse.json({ services: data ?? [] })
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Sign in to list a service' }, { status: 401 })
    }

    const body = await req.json()
    const { title, category, description, price_per_event, location, contact_info, image_url } = body

    if (!title || !category || !description || !contact_info) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const db = getServiceClient()
    const { data, error } = await db
      .from('marketplace_services')
      .insert({
        user_id: session.user.id,
        provider_name: session.user.name ?? 'Unknown',
        title,
        category,
        description,
        price_per_event: price_per_event ? Number(price_per_event) : null,
        location: location ?? null,
        contact_info,
        image_url: image_url ?? null,
        is_approved: true,
      })
      .select()
      .single()

    if (error) {
      console.error('marketplace POST error:', error)
      return NextResponse.json({ error: 'Failed to create listing' }, { status: 500 })
    }

    return NextResponse.json({ service: data }, { status: 201 })
  } catch (err) {
    console.error('marketplace POST error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
