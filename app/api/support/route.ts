import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getServiceClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { subject, message, captchaAnswer, captchaQuestion } = body

    if (!subject?.trim() || !message?.trim()) {
      return NextResponse.json({ error: 'Subject and message are required' }, { status: 400 })
    }

    // Verify math captcha server-side
    const [a, , b] = captchaQuestion.split(' ')
    const expected = Number(a) + Number(b)
    if (Number(captchaAnswer) !== expected) {
      return NextResponse.json({ error: 'Incorrect answer — try again' }, { status: 400 })
    }

    const session = await getServerSession(authOptions)

    const db = getServiceClient()
    const { error } = await db.from('support_tickets').insert({
      user_id: session?.user?.id ?? null,
      user_email: session?.user?.email ?? null,
      subject: subject.trim(),
      message: message.trim(),
      status: 'open',
    })

    if (error) {
      console.error('support ticket error:', error)
      return NextResponse.json({ error: 'Failed to submit ticket' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('support POST error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
