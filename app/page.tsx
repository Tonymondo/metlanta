'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Image from 'next/image'
import { useSession, signOut } from 'next-auth/react'
import type { DbEvent, DbTicketTier } from '@/lib/supabase'


/* ── Checkout ──────────────────────────────────────────────────────────────── */

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

/* ── Canvas particle hero ──────────────────────────────────────────────────── */

function useHeroCanvas() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    let raf: number
    type P = { x: number; y: number; vx: number; vy: number; r: number; o: number }
    const particles: P[] = []

    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight }
    resize()
    window.addEventListener('resize', resize)

    for (let i = 0; i < 100; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: -(Math.random() * 0.35 + 0.05),
        r: Math.random() * 1.2 + 0.2,
        o: Math.random() * 0.4 + 0.05,
      })
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach((p) => {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${p.o})`
        ctx.fill()
        p.x += p.vx; p.y += p.vy
        if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width }
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
      })
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])
  return ref
}

/* ── Scroll reveal ─────────────────────────────────────────────────────────── */

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal')
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target) } })
    }, { threshold: 0.1 })
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
}

/* ── Animated counter ──────────────────────────────────────────────────────── */

function AnimCounter({ target, prefix = '', suffix = '' }: { target: number; prefix?: string; suffix?: string }) {
  const [val, setVal] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return; io.disconnect()
      const dur = 1600; const start = performance.now()
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

/* ── Navbar ────────────────────────────────────────────────────────────────── */

function Navbar() {
  const { data: session } = useSession()
  const [scrolled, setScrolled] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 48)
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
          <a href="/" className="nav-brand">METLANTA</a>
          <div className="nav-right">
            {!session && (
              <>
                <a href="/login" className="nav-login-link">Log in</a>
                <a href="/login" className="nav-cta">Get Started</a>
              </>
            )}
            <button className="nav-avatar-btn" onClick={() => setDrawerOpen((v) => !v)} aria-label="Menu">
              {session?.user?.image
                ? <Image src={session.user.image} alt="" width={30} height={30} className="nav-avatar" />
                : session
                  ? <div className="nav-avatar-fallback">{session.user?.name?.[0] ?? '?'}</div>
                  : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
                    </svg>
                  )
              }
            </button>
          </div>
        </div>
      </header>

      {/* Side drawer overlay */}
      <div className={`drawer-overlay${drawerOpen ? ' open' : ''}`} onClick={close} />

      {/* Side drawer */}
      <div className={`drawer${drawerOpen ? ' open' : ''}`}>
        <div className="drawer-top">
          {session ? (
            <div className="drawer-user">
              {session.user?.image
                ? <Image src={session.user.image} alt="" width={40} height={40} className="drawer-avatar" />
                : <div className="drawer-avatar-fallback">{session.user?.name?.[0] ?? '?'}</div>
              }
              <div style={{ minWidth: 0 }}>
                <p className="drawer-user-name">{session.user?.name ?? 'User'}</p>
                <p className="drawer-user-email">{session.user?.email}</p>
              </div>
            </div>
          ) : (
            <p style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Menu</p>
          )}
          <button className="drawer-close" onClick={close} aria-label="Close">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        <nav className="drawer-nav">
          <a href="/#events" className="drawer-link" onClick={close}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
            Find Events
          </a>
          {session && (
            <>
              <a href="/tickets" className="drawer-link" onClick={close}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z" /></svg>
                My Tickets
              </a>
              <a href="/account" className="drawer-link" onClick={close}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                Account
              </a>
              <a href="/dashboard" className="drawer-link" onClick={close}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>
                Host Dashboard
              </a>
            </>
          )}
          <div className="drawer-divider" />
          <a href="/help" className="drawer-link" onClick={close}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
            Help Center
          </a>
          <a href="mailto:support@metlanta.com" className="drawer-link" onClick={close}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
            Support
          </a>
          {!session && (
            <>
              <div className="drawer-divider" />
              <a href="/login" className="drawer-link" onClick={close}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10 17 15 12 10 7" /><line x1="15" y1="12" x2="3" y2="12" /></svg>
                Log In
              </a>
            </>
          )}
          {session && (
            <>
              <div className="drawer-divider" />
              <button className="drawer-link danger" onClick={() => { close(); signOut({ callbackUrl: '/' }) }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                Sign Out
              </button>
            </>
          )}
        </nav>

        <div className="drawer-bottom">
          <p className="drawer-version">Metlanta © 2025</p>
        </div>
      </div>
    </>
  )
}

/* ── Hero ──────────────────────────────────────────────────────────────────── */

function Hero() {
  return (
    <section className="hero-spline-full">
      <iframe
        src="https://my.spline.design/windherocopycopy-c5x0ja0qNocO0lWsZ0Rva0jA-Kr6/"
        frameBorder="0"
        allowFullScreen
        title="Metlanta 3D"
        className="spline-iframe"
      />
      {/* Cover Spline's built-in watermark bottom-right */}
      <div className="spline-wm-cover" aria-hidden />
      {/* Fade bottom into page */}
      <div className="spline-bottom-fade" aria-hidden />
      {/* Scroll cue */}
      <div className="spline-scroll-hint" aria-hidden>
        <div className="hero-scroll-line" />
      </div>
    </section>
  )
}

/* ── Event card ────────────────────────────────────────────────────────────── */

function EventCard({ event }: { event: DbEvent }) {
  const [loading, setLoading] = useState(false)
  const [selectedTier, setSelectedTier] = useState<DbTicketTier | null>(
    event.ticket_tiers?.[0] ?? null
  )

  const minPrice = event.ticket_tiers?.length
    ? Math.min(...event.ticket_tiers.map((t) => t.price))
    : 0

  const isFree = minPrice === 0
  const available = selectedTier
    ? selectedTier.capacity === null || selectedTier.sold_count < selectedTier.capacity
    : false

  const soldPct = selectedTier?.capacity
    ? Math.round((selectedTier.sold_count / selectedTier.capacity) * 100)
    : 0

  async function handleBuy() {
    if (!selectedTier || !available) return
    setLoading(true)
    await buyTicket(event.id, selectedTier.id, selectedTier.name, selectedTier.price)
    setLoading(false)
  }

  // Generate a gradient for events without images
  const GRADIENTS: Record<string, string> = {
    after_prom: 'linear-gradient(160deg, #2d0808 0%, #0d0000 100%)',
    day_party: 'linear-gradient(160deg, #1a0a1e 0%, #050008 100%)',
    nightlife: 'linear-gradient(160deg, #1a1400 0%, #060500 100%)',
    kickback: 'linear-gradient(160deg, #050d05 0%, #030808 100%)',
    pop_up: 'linear-gradient(160deg, #1e1000 0%, #070400 100%)',
    school_event: 'linear-gradient(160deg, #070010 0%, #10001a 100%)',
  }
  const bg = GRADIENTS[event.event_type ?? ''] ?? 'linear-gradient(160deg, #141414 0%, #0a0a0a 100%)'

  return (
    <div className="event-card">
      {/* Image area */}
      <div className="event-img">
        {event.image_url
          ? <Image src={event.image_url} alt={event.title} fill className="event-img-photo" />
          : <div className="event-img-bg" style={{ background: bg }} />
        }
        <div className="event-img-overlay" />

        {event.event_type && (
          <span className="event-type-badge">{event.event_type.replace('_', ' ')}</span>
        )}

        <div className="event-price-badge">
          {isFree ? 'Free' : `From $${minPrice}`}
        </div>
      </div>

      {/* Body */}
      <div className="event-body">
        <p className="event-name">{event.title}</p>

        <div className="event-meta">
          <div className="event-meta-row">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
            {new Date(event.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            {event.time ? ` · ${event.time}` : ''}
          </div>
          <div className="event-meta-row">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
            {event.location}
          </div>
        </div>

        {/* Tier selector */}
        {event.ticket_tiers && event.ticket_tiers.length > 1 && (
          <div className="tier-selector">
            {event.ticket_tiers.map((t) => (
              <button
                key={t.id}
                className={`tier-btn${selectedTier?.id === t.id ? ' active' : ''}`}
                onClick={() => setSelectedTier(t)}
                disabled={t.capacity !== null && t.sold_count >= t.capacity}
              >
                {t.name}
                <span className="tier-price">{t.price === 0 ? 'Free' : `$${t.price}`}</span>
              </button>
            ))}
          </div>
        )}

        {/* Capacity bar */}
        {selectedTier?.capacity && (
          <div className="capacity-bar">
            <div className="capacity-fill" style={{ width: `${Math.min(soldPct, 100)}%` }} />
          </div>
        )}

        <div className="event-footer-row">
          <span className="event-going">
            {selectedTier?.sold_count ?? 0} going
          </span>
          <span className="event-cap">
            {selectedTier?.capacity ? `${selectedTier.capacity} cap` : 'Open'}
          </span>
        </div>

        <button
          className={`event-buy-btn${isFree ? ' free' : ' paid'}`}
          onClick={handleBuy}
          disabled={loading || !available}
        >
          {loading
            ? 'Redirecting…'
            : !available
            ? 'Sold Out'
            : isFree
            ? 'RSVP Free'
            : `Get Tickets${selectedTier ? ` · $${selectedTier.price}` : ''}`
          }
        </button>
      </div>
    </div>
  )
}

/* ── Events section ────────────────────────────────────────────────────────── */

function EventsSection() {
  const [events, setEvents] = useState<DbEvent[]>([])
  const [loading, setLoading] = useState(true)

  const loadEvents = useCallback(async () => {
    try {
      const res = await fetch('/api/events')
      const data = await res.json()
      setEvents(data.events ?? [])
    } catch {
      setEvents([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadEvents() }, [loadEvents])

  return (
    <section className="events-section" id="events">
      <div className="wrap">
        <div className="section-header reveal">
          <div>
            <p className="eyebrow-label">Discover</p>
            <h2 className="section-heading">Happening in Atlanta</h2>
          </div>
        </div>

        {loading ? (
          <div className="events-loading">
            {[1, 2, 3].map((i) => <div key={i} className="event-skeleton" />)}
          </div>
        ) : events.length === 0 ? (
          <div className="events-empty">
            <div className="empty-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <p className="empty-title">No events yet.</p>
            <p className="empty-sub">Be the first to host something in Atlanta.</p>
            <a href="/login" className="btn-primary" style={{ marginTop: 20 }}>Create an Event</a>
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

/* ── Host section ──────────────────────────────────────────────────────────── */

function HostSection() {
  return (
    <section className="host-section" id="host">
      <div className="wrap">
        <div className="host-grid">
          <div className="host-copy reveal">
            <p className="eyebrow-label">For Hosts</p>
            <h2 className="section-heading">
              Turn your event into<br />
              <span className="text-red">real income.</span>
            </h2>
            <p className="host-body">
              Create your event, set ticket tiers, and go live in under 5 minutes.
              Same-night payouts. Real-time sales dashboard. One link for everything.
            </p>

            <div className="host-stats">
              <div className="host-stat">
                <p className="host-stat-val">85<span>%</span></p>
                <p className="host-stat-label">You keep</p>
              </div>
              <div className="host-stat">
                <p className="host-stat-val">5<span>min</span></p>
                <p className="host-stat-label">To go live</p>
              </div>
              <div className="host-stat">
                <p className="host-stat-val">$0</p>
                <p className="host-stat-label">Upfront cost</p>
              </div>
            </div>

            <a href="/login" className="btn-primary">
              Start Hosting
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </a>
          </div>

          {/* Revenue calc */}
          <div className="reveal d2">
            <div className="calc-card">
              <p className="calc-label-top">Example payout</p>

              <div className="calc-row">
                <span>Ticket price</span>
                <strong>$20</strong>
              </div>
              <div className="calc-row">
                <span>Tickets sold</span>
                <strong><AnimCounter target={800} /></strong>
              </div>
              <div className="calc-row">
                <span>Gross revenue</span>
                <strong>$<AnimCounter target={16000} /></strong>
              </div>
              <div className="calc-row muted">
                <span>Metlanta fee (15%)</span>
                <span className="red-text">−$<AnimCounter target={2400} /></span>
              </div>
              <div className="calc-payout">
                <span>You take home</span>
                <span className="payout-val">$<AnimCounter target={13600} /></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── How it works ──────────────────────────────────────────────────────────── */

function HowSection() {
  const steps = [
    {
      n: '01', title: 'Create your event',
      body: 'Set a date, location, and ticket tiers. Upload a flyer. Go live in under 5 minutes.',
    },
    {
      n: '02', title: 'Share one link',
      body: 'Post it in your bio, stories, and group chats. Watch real-time ticket sales roll in.',
    },
    {
      n: '03', title: 'Get paid',
      body: 'Stripe powers every transaction. 85% goes directly to you. Same-night payout.',
    },
  ]

  return (
    <section className="how-section">
      <div className="wrap">
        <div className="how-header reveal">
          <p className="eyebrow-label">How It Works</p>
          <h2 className="section-heading">Three steps to sold out.</h2>
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

/* ── CTA ───────────────────────────────────────────────────────────────────── */

function CTASection() {
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)

  return (
    <section className="cta-section">
      <div className="wrap">
        <div className="cta-inner reveal">
          <h2 className="cta-title">Your first event<br />starts tonight.</h2>
          <p className="cta-sub">No experience. No upfront cost. Just show up.</p>
          <div className="cta-actions">
            <a href="/login" className="btn-primary">Create Your Event — Free</a>
            <a href="#events" className="btn-ghost">Explore Events</a>
          </div>

          <div className="cta-divider"><div className="or-line" /><span>or join the waitlist</span><div className="or-line" /></div>

          {!done ? (
            <form className="waitlist-row" onSubmit={(e) => { e.preventDefault(); if (email) setDone(true) }}>
              <input
                type="email" placeholder="your@email.com"
                value={email} onChange={(e) => setEmail(e.target.value)} required
                className="waitlist-input"
              />
              <button type="submit" className="waitlist-btn">Notify Me</button>
            </form>
          ) : (
            <p className="waitlist-done">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              You&apos;re on the list.
            </p>
          )}
        </div>
      </div>
    </section>
  )
}

/* ── Footer ────────────────────────────────────────────────────────────────── */

function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer-inner">
          <div className="footer-brand-col">
            <span className="footer-wordmark">METLANTA</span>
            <p className="footer-tag">Atlanta&apos;s social event marketplace.</p>
            <div className="footer-socials">
              <a href="#" aria-label="Instagram" className="social-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
              </a>
              <a href="#" aria-label="TikTok" className="social-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.72a8.16 8.16 0 004.77 1.52V6.79a4.85 4.85 0 01-1.01-.1z" /></svg>
              </a>
            </div>
          </div>

          <div className="footer-links-col">
            <p className="footer-col-title">Platform</p>
            <a href="#events">Explore Events</a>
            <a href="/login">Host an Event</a>
            <a href="/dashboard">Dashboard</a>
          </div>

          <div className="footer-links-col">
            <p className="footer-col-title">Company</p>
            <a href="#">About</a>
            <a href="#">Contact</a>
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 Metlanta, Inc. Built in Atlanta, GA.</p>
          <p>15% platform fee on paid tickets only · Free to list</p>
        </div>
      </div>
    </footer>
  )
}

/* ── Page ──────────────────────────────────────────────────────────────────── */

export default function Home() {
  useReveal()
  return (
    <main>
      <Navbar />
      <Hero />
      <EventsSection />
      <HowSection />
      <HostSection />
      <CTASection />
      <Footer />
    </main>
  )
}
