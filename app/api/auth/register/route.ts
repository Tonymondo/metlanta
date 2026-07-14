import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'
import { hashPassword } from '@/lib/password'

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json()
    if (!email || !password) return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    if (password.length < 8) return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })

    const db = getServiceClient()
    const normalizedEmail = email.toLowerCase().trim()

    // Check if email already exists
    const { data: existing } = await db
      .from('users')
      .select('id')
      .eq('email', normalizedEmail)
      .single()

    if (existing) return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 })

    const password_hash = hashPassword(password)

    const { data: user, error } = await db
      .from('users')
      .insert({
        email: normalizedEmail,
        name: name?.trim() || null,
        password_hash,
        role: 'attendee',
        onboarding_complete: false,
      })
      .select('id, email, name')
      .single()

    if (error || !user) {
      console.error('register error:', error)
      return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
    }

    return NextResponse.json({ success: true, userId: user.id })
  } catch (err) {
    console.error('register route error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
