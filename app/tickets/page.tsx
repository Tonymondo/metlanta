'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface Ticket {
  id: string
  amount_paid: number
  created_at: string
  status: string
  events: {
    id: string
    title: string
    date: string
    time: string | null
    location: string
    image_url: string | null
    event_type: string | null
  } | null
  ticket_tiers: {
    name: string
    price: number
  } | null
}

const EVENT_GRADIENTS: Record<string, string> = {
  after_prom: 'linear-gradient(160deg, #2d0808 0%, #0d0000 100%)',
  day_party: 'linear-gradient(160deg, #1a0a1e 0%, #050008 100%)',
  nightlife: 'linear-gradient(160deg, #1a1400 0%, #060500 100%)',
  kickback: 'linear-gradient(160deg, #050d05 0%, #030808 100%)',
  pop_up: 'linear-gradient(160deg, #1e1000 0%, #070400 100%)',
  school_event: 'linear-gradient(160deg, #070010 0%, #10001a 100%)',
}

export default function TicketsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  useEffect(() => {
    if (status !== 'authenticated') return
    fetch('/api/tickets')
      .then((r) => r.json())
      .then((d) => setTickets(d.tickets ?? []))
      .finally(() => setLoading(false))
  }, [status])

  return (
    <div className="acc-page">
      <div className="acc-header">
        <button className="acc-back" onClick={() => router.back()}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
        </button>
        <h1 className="acc-title">My Tickets</h1>
      </div>

      <div className="acc-content">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
            <div className="dash-spinner" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="tickets-empty">
            <div className="tickets-empty-icon">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z" />
              </svg>
            </div>
            <h2 className="tickets-empty-title">No tickets yet</h2>
            <p className="tickets-empty-sub">Browse events and grab your first tickets!</p>
            <a href="/#events" className="btn-primary" style={{ marginTop: 24 }}>Explore Events</a>
          </div>
        ) : (
          <div className="tickets-list">
            {tickets.map((ticket) => {
              const event = ticket.events
              const tier = ticket.ticket_tiers
              const bg = EVENT_GRADIENTS[event?.event_type ?? ''] ?? 'linear-gradient(160deg, #141414 0%, #0a0a0a 100%)'
              const dateStr = event?.date
                ? new Date(event.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                : '—'

              return (
                <div key={ticket.id} className="ticket-card">
                  {/* Event visual */}
                  <div className="ticket-img">
                    {event?.image_url
                      ? <Image src={event.image_url} alt={event.title ?? ''} fill className="ticket-img-photo" />
                      : <div className="ticket-img-bg" style={{ background: bg }} />
                    }
                    <div className="ticket-img-overlay" />
                    {event?.event_type && (
                      <span className="ticket-type-badge">{event.event_type.replace('_', ' ')}</span>
                    )}
                  </div>

                  {/* Ticket info */}
                  <div className="ticket-body">
                    <div className="ticket-main">
                      <div>
                        <p className="ticket-event-name">{event?.title ?? 'Event'}</p>
                        <div className="ticket-meta">
                          <span>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                            {dateStr}{event?.time ? ` · ${event.time}` : ''}
                          </span>
                          <span>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                            {event?.location ?? '—'}
                          </span>
                        </div>
                      </div>
                      <div className="ticket-right">
                        <span className="ticket-tier">{tier?.name ?? 'Ticket'}</span>
                        <span className="ticket-price">${ticket.amount_paid.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Divider + QR */}
                    <div className="ticket-divider">
                      <div className="ticket-notch left" />
                      <div className="ticket-dash-line" />
                      <div className="ticket-notch right" />
                    </div>

                    <div className="ticket-footer">
                      <div className="ticket-status">
                        <span className="ticket-status-dot" />
                        Confirmed
                      </div>
                      <div className="ticket-qr-placeholder">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
                          <rect x="14" y="14" width="3" height="3" /><rect x="18" y="18" width="3" height="3" />
                        </svg>
                        <span>Show at door</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
