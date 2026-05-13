'use client'

import AnimatedSection, { AnimatedGroup, itemVariants } from '@/components/ui/AnimatedSection'
import { motion } from 'framer-motion'
import Link from 'next/link'

const EVENTS = [
  {
    name: 'Senior After Prom 2026',
    host: '@cre8tive.events',
    date: 'Fri May 22',
    time: '10PM – 4AM',
    type: 'After Prom',
    city: 'Atlanta, GA',
    tickets: [
      { label: 'Early Bird', price: '$25', sold: true },
      { label: 'General', price: '$40', sold: false },
      { label: 'VIP', price: '$100', sold: false },
    ],
    going: '1.2k',
    hot: true,
  },
  {
    name: 'Sunday Kickback',
    host: '@jaxon.host',
    date: 'Sun May 25',
    time: '4PM – 10PM',
    type: 'Kickback',
    city: 'Decatur, GA',
    tickets: [
      { label: 'RSVP', price: 'Free', sold: false },
    ],
    going: '340',
    hot: false,
  },
  {
    name: 'Buckhead Saturday',
    host: '@nightout_atl',
    date: 'Sat May 24',
    time: '9PM – 3AM',
    type: 'Day / Night Party',
    city: 'Buckhead, GA',
    tickets: [
      { label: 'Early Bird', price: '$15', sold: true },
      { label: 'General', price: '$25', sold: false },
    ],
    going: '870',
    hot: true,
  },
  {
    name: 'Junior Day Function',
    host: '@stonewall.juniors',
    date: 'Sat May 17',
    time: '2PM – 8PM',
    type: 'School Event',
    city: 'Stone Mountain, GA',
    tickets: [
      { label: 'General', price: '$20', sold: false },
      { label: 'VIP Table', price: '$60', sold: false },
    ],
    going: '580',
    hot: false,
  },
]

function EventCard({ event }: { event: typeof EVENTS[number] }) {
  const firstAvail = event.tickets.find((t) => !t.sold) ?? event.tickets[0]

  return (
    <motion.div
      variants={itemVariants}
      className="card card-hover rounded-2xl overflow-hidden flex flex-col"
    >
      {/* Event banner */}
      <div
        className="h-24 relative flex items-end p-3"
        style={{ background: 'linear-gradient(135deg, #120000 0%, #200808 60%, #0d0d0d 100%)' }}
      >
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(circle at 80% 20%, rgba(224,48,48,0.14) 0%, transparent 60%)' }}
          aria-hidden
        />
        <div className="absolute top-2.5 left-2.5 right-2.5 flex justify-between items-start z-10">
          <span className="tag tag-red">{event.type}</span>
          {event.hot && (
            <span className="tag" style={{ background: 'rgba(224,48,48,0.18)', color: '#ff6060', border: '1px solid rgba(224,48,48,0.22)', fontSize: '9px' }}>
              🔥 Selling fast
            </span>
          )}
        </div>
        <div className="relative z-10">
          <div className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: 'var(--red)' }}>
            {event.date} · {event.time}
          </div>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="mb-1">
          <h3 className="text-sm font-bold mb-0.5" style={{ color: '#F0F0F0' }}>{event.name}</h3>
          <div className="text-[10px]" style={{ color: '#444' }}>{event.host} · {event.city}</div>
        </div>

        <div className="flex items-center gap-1.5 mt-2 mb-3">
          <div className="live-dot" style={{ width: '6px', height: '6px', flexShrink: 0 }} />
          <span className="text-[10px] font-semibold text-green-400">{event.going} going</span>
        </div>

        {/* Ticket tiers */}
        <div className="flex gap-1.5 mb-3">
          {event.tickets.map((t) => (
            <div
              key={t.label}
              className="flex-1 rounded-lg p-2 text-center"
              style={{
                background: t.sold ? 'rgba(255,255,255,0.02)' : 'rgba(224,48,48,0.06)',
                border: `1px solid ${t.sold ? 'rgba(255,255,255,0.05)' : 'rgba(224,48,48,0.15)'}`,
                opacity: t.sold ? 0.5 : 1,
              }}
            >
              <div className="text-[8px] text-t3 uppercase tracking-wide leading-none mb-0.5">{t.label}</div>
              <div
                className="text-[11px] font-bold"
                style={{ color: t.sold ? '#444' : 'var(--red)' }}
              >
                {t.sold ? 'Sold out' : t.price}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-auto">
          <Link
            href="#events"
            className="btn btn-sm w-full justify-center"
            style={{
              background: 'var(--red)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              borderRadius: '8px',
              padding: '9px',
              fontSize: '12px',
              fontWeight: 700,
              textDecoration: 'none',
              transition: 'all 0.15s ease',
            }}
          >
            {firstAvail.sold ? 'View Event' : `Get ${firstAvail.label} · ${firstAvail.price}`}
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

export default function EventFeed() {
  return (
    <section id="events" className="relative py-24 lg:py-32 overflow-hidden">
      <div className="section-wrapper relative z-10">
        <AnimatedSection className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="label mb-3">Discover</div>
            <h2 className="text-[clamp(28px,4.5vw,48px)] font-extrabold tracking-tight">
              Events near you
            </h2>
          </div>
          <Link
            href="#events"
            className="text-sm font-semibold transition-colors self-start sm:self-auto"
            style={{ color: 'var(--red)' }}
          >
            View all events →
          </Link>
        </AnimatedSection>

        <AnimatedGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {EVENTS.map((event) => (
            <EventCard key={event.name} event={event} />
          ))}
        </AnimatedGroup>

        <AnimatedSection className="mt-10 text-center">
          <p className="text-sm mb-4" style={{ color: '#555' }}>
            Events in Atlanta · Miami · Houston · Chicago · NYC · LA
          </p>
          <Link href="#events" className="btn btn-ghost btn-sm">
            Browse All Cities
          </Link>
        </AnimatedSection>
      </div>
    </section>
  )
}
