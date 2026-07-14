import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

function formatPhone(raw: string) {
  const digits = raw.replace(/\D/g, '')
  return digits.startsWith('1') ? digits : `1${digits}`
}

async function sendSMS(to: string, body: string) {
  const sid = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  const from = process.env.TWILIO_PHONE_NUMBER
  if (!sid || !token || !from) {
    // Dev mode — log OTP instead of sending
    console.log(`[SMS OTP] To: +${to}  Code: ${body}`)
    return
  }
  const twilio = (await import('twilio')).default
  const client = twilio(sid, token)
  await client.messages.create({ to: `+${to}`, from, body })
}

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json()
    if (!phone) return NextResponse.json({ error: 'Phone number required' }, { status: 400 })

    const normalizedPhone = formatPhone(phone)
    if (normalizedPhone.replace(/\D/g, '').length < 10) {
      return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 })
    }

    const otp = generateOTP()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

    const db = getServiceClient()

    // Delete any existing OTPs for this phone
    await db.from('phone_otps').delete().eq('phone', normalizedPhone)

    // Store new OTP
    const { error } = await db.from('phone_otps').insert({
      phone: normalizedPhone,
      otp,
      expires_at: expiresAt,
    })

    if (error) {
      console.error('OTP insert error:', error)
      return NextResponse.json({ error: 'Failed to generate code' }, { status: 500 })
    }

    await sendSMS(normalizedPhone, `Your Metlanta verification code is: ${otp}. Valid for 10 minutes.`)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('send-otp error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
