import twilio from 'twilio'

export async function sendTicketConfirmationSMS({
  to,
  eventTitle,
  eventDate,
  eventLocation,
  tierName,
  ticketId,
}: {
  to: string
  eventTitle: string
  eventDate: string
  eventLocation: string
  tierName: string
  ticketId: string
}) {
  const sid = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  const from = process.env.TWILIO_PHONE_NUMBER

  if (!sid || !token || !from) {
    console.warn('Twilio not configured — skipping SMS')
    return
  }

  const client = twilio(sid, token)
  const ref = ticketId.slice(0, 8).toUpperCase()

  const body =
    `🎟 Metlanta: You're in!\n` +
    `${eventTitle}\n` +
    `📅 ${eventDate} · 📍 ${eventLocation}\n` +
    `Tier: ${tierName} · Ref: ${ref}\n` +
    `Show your ticket at the door: https://metlanta.app/tickets`

  try {
    await client.messages.create({ body, from, to })
    console.log('✅ SMS sent:', to)
  } catch (err) {
    console.error('SMS send failed:', err)
  }
}
