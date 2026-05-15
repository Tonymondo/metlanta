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
  } catch (err) {
    console.error('SMS send failed:', err)
  }
}

/**
 * Send a bulk SMS blast to a list of phone numbers.
 * Returns the count of successfully sent messages.
 * Gracefully skips if Twilio is not configured.
 */
export async function sendBlastSMS({
  phones,
  eventTitle,
  message,
}: {
  phones: string[]
  eventTitle: string
  message: string
}): Promise<number> {
  const sid = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  const from = process.env.TWILIO_PHONE_NUMBER

  if (!sid || !token || !from) {
    console.warn('Twilio not configured — skipping blast SMS')
    return 0
  }

  if (!phones.length) return 0

  const client = twilio(sid, token)
  const body = `Metlanta | ${eventTitle}\n${message}\n\nReply STOP to unsubscribe.`

  let successCount = 0

  await Promise.allSettled(
    phones.map(async (to) => {
      try {
        await client.messages.create({ body, from, to })
        successCount++
      } catch (err) {
        console.error(`Blast SMS failed for ${to}:`, err)
      }
    })
  )

  return successCount
}
