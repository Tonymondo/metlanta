'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Image from 'next/image'
import { useSession, signOut } from 'next-auth/react'
import type { DbEvent, DbTicketTier } from '@/lib/supabase'

/* ── Checkout ─────────────────────────────────────────────────────────────── */

async function buyTicket(eventId: string, tierId: string, tierName: string, price: number) {
  const res = await fetch('/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ eventId, tierId, tierName, price }),
  })
  const data = await res.json()
  if (data.url) window.location.href = data.url
  else alert(data.error ?? 'Something went wrong.')
}

/* ── Scroll reveal ────────────────────────────────────────────────────────── */

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal')
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target) } }),
      { threshold: 0.08 }
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
}

/* ── Animated counter ─────────────────────────────────────────────────────── */

function AnimCounter({ target, prefix = '', suffix = '' }: { target: number; prefix?: string; suffix?: string }) {
  const [val, setVal] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return; io.disconnect()
      const dur = 1800; const start = performance.now()
      const tick = (now: number) => {
        const t = Math.min((now - start) / dur, 1)
        setVal(Math.round((1 - Math.pow(1 - t, 3)) * target))
        if (t < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }, { threshold: 0.5 })
    io.observe(el)
    return () => io.disconnect()
  }, [target])
  return <span ref={ref}>{prefix}{val.toLocaleString()}{suffix}</span>
}

/* ── Navbar ───────────────────────────────────────────────────────────────── */

function Navbar() {
  const { data: session } = useSession()
  const [scrolled, setScrolled] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [drawerOpen])

  const close = () => setDrawerOpen(false)

  return (
    <>
      <header className={`nav${scrolled ? ' scrolled' : ''}`}>
        <div className="nav-inner">
          <a href="/" className="nav-brand">
            <img src="/metlantalogo.png" alt="Metlanta" className="nav-logo-img" />
          </a>
          <div className="nav-right">
            {!session && (
              <>
                <a href="/login" className="nav-login-link">Log in</a>
                <a href="/login" className="nav-cta">Get Started</a>
              </>
            )}
            <button className="nav-menu-btn" onClick={() => setDrawerOpen(true)} aria-label="Menu">
              {session?.user?.image ? (
                <Image src={session.user.image} alt="" width={28} height={28} className="nav-avatar" />
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="7" x2="21" y2="7"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="17" x2="21" y2="17"/>
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Drawer overlay */}
      <div className={`drawer-overlay${drawerOpen ? ' open' : ''}`} onClick={close} />

      {/* Side drawer */}
      <div className={`drawer${drawerOpen ? ' open' : ''}`}>
        <div className="drawer-top">
          {session ? (
            <div className="drawer-user">
              {session.user?.image
                ? <Image src={session.user.image} alt="" width={38} height={38} className="drawer-avatar" />
                : <div className="drawer-avatar-fallback">{session.user?.name?.[0] ?? 'M'}</div>
              }
              <div style={{ minWidth: 0 }}>
                <p className="drawer-user-name">{session.user?.name ?? 'User'}</p>
                <p className="drawer-user-email">{session.user?.email}</p>
              </div>
            </div>
          ) : (
            <img src="/metlantalogo.png" alt="Metlanta" className="drawer-logo-img" />
          )}
          <button className="drawer-close" onClick={close} aria-label="Close">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <nav className="drawer-nav">
          <a href="/#events" className="drawer-link" onClick={close}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            Find Events
          </a>
          {session && <>
            <a href="/tickets" className="drawer-link" onClick={close}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z"/></svg>
              My Tickets
            </a>
            <a href="/account" className="drawer-link" onClick={close}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              Account
            </a>
            <a href="/dashboard" className="drawer-link" onClick={close}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
              Host Dashboard
            </a>
          </>}
          <div className="drawer-divider" />
          <a href="/help" className="drawer-link" onClick={close}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            Help Center
          </a>
          {!session ? (
            <>
              <div className="drawer-divider" />
              <a href="/login" className="drawer-link" onClick={close}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                Log In
              </a>
            </>
          ) : (
            <>
              <div className="drawer-divider" />
              <button className="drawer-link danger" onClick={() => { close(); signOut({ callbackUrl: '/' }) }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                Sign Out
              </button>
            </>
          )}
        </nav>
        <div className="drawer-bottom">
          <p className="drawer-version">Metlanta · Atlanta, GA</p>
        </div>
      </div>
    </>
  )
}

/* ── Hero ─────────────────────────────────────────────────────────────────── */

function Hero() {
  return (
    <section className="hero">
      <div className="hero-glow hero-glow-1" aria-hidden />
      <div className="hero-glow hero-glow-2" aria-hidden />
      <div className="hero-noise" aria-hidden />
      <div className="hero-scrim" aria-hidden />
      <div className="hero-content">
        {/* Default headline: "Let the night find you."
            Alternates (swap in if needed):
              - "Every great night starts here."
              - "Find your night."
            Supporting-line alternate:
              "Discover what's moving in your city, grab tickets in seconds, and host your own." */}
        <h1 className="hero-headline">
          Let the night <em className="hero-headline-accent">find you.</em>
        </h1>
        <p className="hero-sub">
          The events worth pulling up to — tickets in seconds, hosted by the city.
          Built for nights you&apos;ll actually remember.
        </p>
        <div className="hero-actions">
          <a href="/explore" className="btn-primary">
            Find your night
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
          <a href="/login" className="btn-ghost">Host an event</a>
        </div>
      </div>
      <div className="hero-scroll" aria-hidden>
        <div className="hero-scroll-line" />
      </div>
    </section>
  )
}

/* ── Event card ───────────────────────────────────────────────────────────── */

const EVENT_GRADIENTS: Record<string, string> = {
  after_prom:   'linear-gradient(135deg,#2d0808,#0d0000)',
  day_party:    'linear-gradient(135deg,#1a0a1e,#050008)',
  nightlife:    'linear-gradient(135deg,#1a1400,#060500)',
  kickback:     'linear-gradient(135deg,#050d05,#030808)',
  pop_up:       'linear-gradient(135deg,#1e1000,#070400)',
  school_event: 'linear-gradient(135deg,#070010,#10001a)',
}

function EventCard({ event }: { event: DbEvent }) {
  const [loading, setLoading] = useState(false)
  const [selectedTier, setSelectedTier] = useState<DbTicketTier | null>(event.ticket_tiers?.[0] ?? null)

  const minPrice = event.ticket_tiers?.length ? Math.min(...event.ticket_tiers.map(t => t.price)) : 0
  const isFree = minPrice === 0
  const available = selectedTier ? selectedTier.capacity === null || selectedTier.sold_count < selectedTier.capacity : false
  const soldPct = selectedTier?.capacity ? Math.round((selectedTier.sold_count / selectedTier.capacity) * 100) : 0
  const bg = EVENT_GRADIENTS[event.event_type ?? ''] ?? 'linear-gradient(135deg,#141414,#0a0a0a)'

  const dateStr = event.date
    ? new Date(event.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    : '—'

  async function handleBuy() {
    if (!selectedTier || !available) return
    setLoading(true)
    await buyTicket(event.id, selectedTier.id, selectedTier.name, selectedTier.price)
    setLoading(false)
  }

  return (
    <div className="event-card">
      <a href={`/events/${event.id}`} className="event-img" style={{ background: bg }}>
        {(event.flyer_url || event.image_url) && (
          <Image src={event.flyer_url ?? event.image_url!} alt={event.title} fill className="event-img-photo" />
        )}
        <div className="event-img-overlay" />
        {event.event_type && (
          <span className="event-type-badge">{event.event_type.replace(/_/g, ' ')}</span>
        )}
      </a>

      <div className="event-body">
        <h3 className="event-title">{event.title}</h3>
        <div className="event-meta">
          <span>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            {dateStr}{event.time ? ` · ${event.time}` : ''}
          </span>
          <span>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            {event.location}
          </span>
        </div>

        {event.ticket_tiers && event.ticket_tiers.length > 1 && (
          <div className="tier-selector">
            {event.ticket_tiers.map(t => (
              <button
                key={t.id}
                className={`tier-btn${selectedTier?.id === t.id ? ' active' : ''}`}
                onClick={() => setSelectedTier(t)}
              >
                {t.name}
              </button>
            ))}
          </div>
        )}

        {selectedTier?.capacity && (
          <div className="cap-bar">
            <div className="cap-fill" style={{ width: `${soldPct}%`, background: soldPct > 80 ? 'var(--red)' : 'rgba(255,255,255,0.5)' }} />
          </div>
        )}

        <div className="event-footer">
          <span className="event-price">
            {isFree ? 'Free' : `$${selectedTier ? selectedTier.price.toFixed(2) : minPrice.toFixed(2)}`}
          </span>
          <button
            className={`btn-primary event-buy-btn${!available ? ' disabled' : ''}`}
            onClick={handleBuy}
            disabled={!available || loading}
          >
            {loading ? (
              <span className="btn-spinner" />
            ) : !available ? 'Sold Out' : isFree ? 'RSVP Free' : 'Get Tickets'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Events section ───────────────────────────────────────────────────────── */

function EventsSection() {
  const [events, setEvents] = useState<DbEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/events')
      .then(r => r.json())
      .then(d => setEvents(d.events ?? []))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="events-section" id="events">
      <div className="wrap">
        <div className="section-hd reveal">
          <p className="eyebrow-label">Discover</p>
          <h2 className="section-title">Events Near You</h2>
        </div>

        {loading ? (
          <div className="events-grid">
            {[1, 2, 3].map(i => <div key={i} className="event-skeleton" />)}
          </div>
        ) : events.length === 0 ? (
          <div className="events-empty reveal">
            <div className="empty-icon-wrap">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <p className="empty-title">No events live in Atlanta yet.</p>
            <p className="empty-sub">Be the first to host something.</p>
            <a href="/login" className="btn-primary" style={{ marginTop: 24 }}>Create an Event</a>
          </div>
        ) : (
          <div className="events-grid">
            {events.map((e, i) => (
              <div key={e.id} className={`reveal${i < 3 ? ` d${i + 1}` : ''}`}>
                <EventCard event={e} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

/* ── Host section ─────────────────────────────────────────────────────────── */

function HostSection() {
  const features = [
    { icon: '⚡', title: 'Go live in minutes', body: 'Set your event details, upload a flyer, set ticket prices. You\'re live.' },
    { icon: '💳', title: 'Get paid instantly', body: 'Stripe powers every transaction. 85% goes to you. Same-night payouts.' },
    { icon: '📊', title: 'Real-time dashboard', body: 'Track ticket sales, check in guests, manage your event from anywhere.' },
  ]

  return (
    <section className="host-section" id="host">
      <div className="wrap">
        <div className="host-inner">
          <div className="host-left reveal">
            <p className="eyebrow-label">For Hosts</p>
            <h2 className="section-title">Your event.<br />Your money.</h2>
            <p className="host-sub">Metlanta handles the ticketing, you keep 85%. No monthly fees, no upfront cost.</p>
            <div className="host-features">
              {features.map(f => (
                <div key={f.title} className="host-feature">
                  <span className="host-feature-icon">{f.icon}</span>
                  <div>
                    <p className="host-feature-title">{f.title}</p>
                    <p className="host-feature-body">{f.body}</p>
                  </div>
                </div>
              ))}
            </div>
            <a href="/login" className="btn-primary" style={{ marginTop: 8 }}>
              Start Hosting — Free
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>
          </div>

          <div className="host-right reveal d2">
            <div className="calc-card">
              <p className="calc-label">Example payout</p>
              <div className="calc-row"><span>Ticket price</span><strong>$20</strong></div>
              <div className="calc-row"><span>Tickets sold</span><strong><AnimCounter target={800} /></strong></div>
              <div className="calc-row"><span>Gross revenue</span><strong>$<AnimCounter target={16000} /></strong></div>
              <div className="calc-row muted"><span>Metlanta fee (15%)</span><span className="red-text">−$<AnimCounter target={2400} /></span></div>
              <div className="calc-payout"><span>You take home</span><span className="payout-val">$<AnimCounter target={13600} /></span></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── How it works ─────────────────────────────────────────────────────────── */

function HowSection() {
  const steps = [
    { n: '01', title: 'Create your event', body: 'Set date, location, and ticket tiers. Upload a flyer. Go live in under 5 minutes.' },
    { n: '02', title: 'Share one link', body: 'Post it in your bio, stories, and group chats. Watch ticket sales roll in.' },
    { n: '03', title: 'Get paid', body: 'Stripe handles every payment. 85% goes directly to you. Same-night payout.' },
  ]

  return (
    <section className="how-section">
      <div className="wrap">
        <div className="section-hd reveal" style={{ textAlign: 'center' }}>
          <p className="eyebrow-label">How It Works</p>
          <h2 className="section-title">Three steps to sold out.</h2>
        </div>
        <div className="how-grid">
          {steps.map((s, i) => (
            <div key={s.n} className={`how-card reveal d${i + 1}`}>
              <span className="how-num">{s.n}</span>
              <h3 className="how-title">{s.title}</h3>
              <p className="how-body">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── CTA ──────────────────────────────────────────────────────────────────── */

function CTASection() {
  return (
    <section className="cta-section">
      <div className="wrap">
        <div className="cta-inner reveal">
          <h2 className="cta-title">Your first event<br />starts tonight.</h2>
          <p className="cta-sub">No experience. No upfront cost. Free to list.</p>
          <div className="cta-actions">
            <a href="/login" className="btn-primary">Create Your Event — Free</a>
            <a href="#events" className="btn-ghost">Explore Events</a>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── Footer ───────────────────────────────────────────────────────────────── */

function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-inner">
          <div className="footer-brand">
            <img src="/metlantalogo.png" alt="Metlanta" className="footer-logo-img" />
            <p className="footer-tag">Atlanta&apos;s social event marketplace.</p>
          </div>
          <div className="footer-links">
            <a href="#events">Explore Events</a>
            <a href="/login">Host an Event</a>
            <a href="/help">Help</a>
            <a href="mailto:support@metlanta.app">Contact</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 Metlanta, Inc. · Built in Atlanta, GA</p>
          <p>15% platform fee on paid tickets · Free to list</p>
        </div>
      </div>
    </footer>
  )
}

/* ── Page ─────────────────────────────────────────────────────────────────── */

export default function Page() {
  useReveal()
  return (
    <>
      <Navbar />
      <Hero />
      <EventsSection />
      <HostSection />
      <HowSection />
      <CTASection />
      <Footer />
    </>
  )
}
