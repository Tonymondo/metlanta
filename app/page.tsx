'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

async function buyTicket(eventName: string, tierName: string, price: number) {
  const res = await fetch('/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ eventName, tierName, price }),
  })
  const data = await res.json()
  if (data.url) window.location.href = data.url
  else alert('Something went wrong. Please try again.')
}

/* ── Data ──────────────────────────────────────────────────────────────────── */

const EVENTS = [
  {
    name: 'Senior After Prom 2026',
    host: '@cre8tive.events',
    date: 'MAY 22',
    time: '10PM – 4AM',
    location: 'Atlanta, GA',
    price: 'From $25',
    ticketPrice: 25,
    tierName: 'General',
    going: '1.2k going',
    hot: true,
    bg: 'linear-gradient(160deg, #2d0808 0%, #0d0000 100%)',
  },
  {
    name: 'Sunday Kickback',
    host: '@jaxon.host',
    date: 'MAY 25',
    time: '4PM – 10PM',
    location: 'Decatur, GA',
    price: 'Free',
    ticketPrice: 0,
    tierName: 'RSVP',
    going: '340 going',
    hot: false,
    bg: 'linear-gradient(160deg, #050d05 0%, #030808 100%)',
  },
  {
    name: 'Buckhead Saturday',
    host: '@nightout_atl',
    date: 'MAY 24',
    time: '9PM – 3AM',
    location: 'Buckhead, GA',
    price: 'From $20',
    ticketPrice: 20,
    tierName: 'General',
    going: '870 going',
    hot: true,
    bg: 'linear-gradient(160deg, #1a0a1e 0%, #050008 100%)',
  },
  {
    name: 'Junior Day Function',
    host: '@stonewall.juniors',
    date: 'MAY 17',
    time: '2PM – 8PM',
    location: 'Stone Mountain, GA',
    price: 'From $20',
    ticketPrice: 20,
    tierName: 'General',
    going: '580 going',
    hot: false,
    bg: 'linear-gradient(160deg, #070010 0%, #10001a 100%)',
  },
  {
    name: 'Summer Cookout Pop-Up',
    host: '@atl.good.times',
    date: 'JUN 7',
    time: '3PM – 9PM',
    location: 'East Atlanta, GA',
    price: 'From $15',
    ticketPrice: 15,
    tierName: 'General',
    going: '720 going',
    hot: false,
    bg: 'linear-gradient(160deg, #1e1000 0%, #070400 100%)',
  },
  {
    name: 'The Golden Standard Func',
    host: '@az.events',
    date: 'JUN 14',
    time: '8PM – 2AM',
    location: 'Midtown, GA',
    price: 'From $35',
    ticketPrice: 35,
    tierName: 'General',
    going: '990 going',
    hot: true,
    bg: 'linear-gradient(160deg, #1a1400 0%, #060500 100%)',
  },
]

/* ── Hooks ─────────────────────────────────────────────────────────────────── */

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal')
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('visible')
            io.unobserve(e.target)
          }
        })
      },
      { threshold: 0.12 }
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
}

function useCounter(target: number, duration = 1800) {
  const [value, setValue] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        io.disconnect()
        const start = performance.now()
        const tick = (now: number) => {
          const t = Math.min((now - start) / duration, 1)
          const ease = 1 - Math.pow(1 - t, 3)
          setValue(Math.round(ease * target))
          if (t < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      },
      { threshold: 0.5 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [target, duration])

  return { value, ref }
}

/* ── Canvas particles ──────────────────────────────────────────────────────── */

function useHeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf: number
    const particles: { x: number; y: number; vx: number; vy: number; r: number; o: number }[] = []

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -Math.random() * 0.4 - 0.1,
        r: Math.random() * 1.5 + 0.3,
        o: Math.random() * 0.5 + 0.1,
      })
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach((p) => {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${p.o})`
        ctx.fill()
        p.x += p.vx
        p.y += p.vy
        if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width }
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
      })
      raf = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return canvasRef
}

/* ── Navbar ────────────────────────────────────────────────────────────────── */

function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const links = [
    { label: 'Events', href: '#events' },
    { label: 'Host', href: '#host' },
    { label: 'Pricing', href: '#pricing' },
  ]

  return (
    <>
      <header className={`nav${scrolled ? ' scrolled' : ''}`}>
        <div className="nav-inner">
          <a href="/" className="nav-logo" aria-label="Metlanta">
            <div className="nav-logo-wrap">
              <Image
                src="/logo.png"
                alt="Metlanta logo"
                height={28}
                width={62}
                className="nav-logo-img"
                priority
              />
            </div>
            <span className="nav-wordmark">Metlanta</span>
          </a>

          <ul className="nav-links">
            {links.map((l) => (
              <li key={l.label}><a href={l.href}>{l.label}</a></li>
            ))}
          </ul>

          <div className="nav-actions">
            <a href="#login" className="nav-login">Log In</a>
            <a href="#host" className="btn-nav">
              Start Hosting
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          </div>

          <button
            className={`nav-burger${open ? ' open' : ''}`}
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </header>

      <div className={`mobile-menu${open ? ' open' : ''}`}>
        {links.map((l) => (
          <a key={l.label} href={l.href} onClick={() => setOpen(false)}>{l.label}</a>
        ))}
        <div className="mobile-ctas">
          <a href="#host" className="btn-primary" style={{ justifyContent: 'center' }} onClick={() => setOpen(false)}>
            Start Hosting Free
          </a>
          <a href="#login" className="btn-ghost" style={{ justifyContent: 'center' }} onClick={() => setOpen(false)}>
            Log In
          </a>
        </div>
      </div>
    </>
  )
}

/* ── Hero ──────────────────────────────────────────────────────────────────── */

function Hero() {
  const canvasRef = useHeroCanvas()

  return (
    <section className="hero">
      {/* Ambient orbs */}
      <div className="hero-orb hero-orb-1" aria-hidden />
      <div className="hero-orb hero-orb-2" aria-hidden />
      <div className="hero-orb hero-orb-3" aria-hidden />

      {/* Background image (renders if file exists) */}
      <div className="hero-bg-img" aria-hidden />

      {/* Gradient overlay */}
      <div className="hero-overlay" aria-hidden />

      {/* Particle canvas */}
      <canvas id="hero-canvas" ref={canvasRef} aria-hidden />

      {/* Content */}
      <div className="hero-content">
        <div className="hero-eyebrow">
          <span className="eyebrow-dot" />
          Atlanta&apos;s Social Event Marketplace
        </div>

        <h1 className="hero-title">METLANTA</h1>
        <p className="hero-title-sub">Discover · Host · Get Paid</p>

        <p className="hero-tagline">
          After proms, day parties, kickbacks, school events — find them all or
          host your own and sell out in hours.
        </p>

        <div className="hero-ctas">
          <a href="#host" className="btn-primary">
            Start Hosting Free
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
          <a href="#events" className="btn-ghost">Explore Events</a>
        </div>

        <div className="hero-scroll">
          <span className="hero-scroll-text">Scroll</span>
          <div className="hero-scroll-line" />
        </div>
      </div>
    </section>
  )
}

/* ── Events ────────────────────────────────────────────────────────────────── */

function EventCard({ e, i }: { e: typeof EVENTS[number]; i: number }) {
  const [loading, setLoading] = useState(false)
  const delay = ['', 'd1', 'd2', 'd3', 'd4'][Math.min(i, 4)]

  async function handleBuy() {
    if (e.ticketPrice === 0) return
    setLoading(true)
    await buyTicket(e.name, e.tierName, e.ticketPrice)
    setLoading(false)
  }

  return (
    <div className={`event-card reveal${delay ? ` ${delay}` : ''}`}>
      <div className="event-img">
        <div className="event-img-bg" style={{ background: e.bg }} />
        <div className="event-img-overlay" />
        {e.hot && (
          <div className="event-badge">
            <span className="badge-dot" />
            Trending
          </div>
        )}
        <div className="event-price-badge">{e.price}</div>
      </div>

      <div className="event-body">
        <p className="event-name">{e.name}</p>
        <div className="event-meta">
          <div className="event-meta-row">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            {e.date} · {e.time}
          </div>
          <div className="event-meta-row">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
            </svg>
            {e.location}
          </div>
        </div>
        <div className="event-divider" />
        <div className="event-footer">
          <div className="event-going">
            <span className="going-dot" />
            {e.going}
          </div>
          <span className="event-host">{e.host}</span>
        </div>

        <button
          onClick={handleBuy}
          disabled={loading}
          className={`event-buy-btn ${e.ticketPrice === 0 ? 'free' : 'paid'}`}
        >
          {loading ? 'Redirecting…' : e.ticketPrice === 0 ? 'RSVP Free' : `Get Tickets · ${e.price}`}
        </button>
      </div>
    </div>
  )
}

function EventsSection() {
  const [tab, setTab] = useState('Trending')

  return (
    <section className="events" id="events">
      <div className="wrap">
        <div className="events-top reveal">
          <div>
            <p className="section-eyebrow">Discover</p>
            <h2 className="section-title">Trending in Atlanta</h2>
          </div>
          <a href="#events" className="see-all">
            View all
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </a>
        </div>

        <div className="events-tabs reveal d1">
          {['Trending', 'Soon', 'New'].map((t) => (
            <button key={t} className={`tab${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>
              {t}
            </button>
          ))}
        </div>

        <div className="events-grid">
          {EVENTS.map((e, i) => <EventCard key={e.name} e={e} i={i} />)}
        </div>
      </div>
    </section>
  )
}

/* ── How It Works ──────────────────────────────────────────────────────────── */

function HowSection() {
  const steps = [
    {
      title: 'Discover Events',
      body: 'Browse after proms, kickbacks, day parties, and more happening right now in Atlanta.',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E03030" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
      ),
    },
    {
      title: 'Join or Host',
      body: 'Buy a ticket in seconds or create your own event page, set ticket tiers, and go live in under 5 minutes.',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E03030" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      title: 'Get Paid / Go Out',
      body: 'Hosts collect same-night payouts via Stripe. Attendees get QR tickets and show up. Everyone wins.',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E03030" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
    },
  ]

  return (
    <section className="how" id="how-it-works">
      <div className="wrap">
        <div className="how-header reveal">
          <p className="section-eyebrow">How It Works</p>
          <h2 className="section-title">Three steps. One platform.</h2>
          <p>No experience needed. If you can share a story, you can run an event.</p>
        </div>

        <div className="how-steps">
          {steps.map((s, i) => (
            <div key={s.title} className={`how-step reveal d${i + 1}`}>
              <div className="how-icon">{s.icon}</div>
              <div className="how-num">0{i + 1}</div>
              <h3 className="how-title">{s.title}</h3>
              <p className="how-body">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── Revenue Section ───────────────────────────────────────────────────────── */

function RevenueCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const { value, ref } = useCounter(target)
  return <span ref={ref} className="counter">{value.toLocaleString()}{suffix}</span>
}

function RevenueSection() {
  return (
    <section className="revenue" id="host">
      <div className="wrap">
        <div className="revenue-grid">
          <div className="revenue-copy reveal">
            <p className="section-eyebrow">For Hosts</p>
            <h2 className="section-title">
              Turn your event into<br />
              <span className="gradient-text">real income.</span>
            </h2>
            <p>
              One ticket link. Multiple tiers. Live sales dashboard. Same-night
              payout to your bank. Every function you throw builds your reputation.
            </p>

            <div className="revenue-features">
              {[
                'Live in 5 minutes — no experience needed',
                'General, VIP, Early Bird, and Free tiers',
                'Real-time sales dashboard and guest list',
                'Same-night Stripe payouts',
              ].map((f) => (
                <div key={f} className="revenue-feature">
                  <div className="feature-check">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#E03030" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  {f}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <a href="#host" className="btn-primary">
                Start Hosting Free
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
              <a href="#pricing" className="btn-ghost">See Pricing</a>
            </div>
          </div>

          {/* Calculator visual */}
          <div className="reveal d2">
            <div className="revenue-calc">
              <p className="calc-title">Revenue Calculator</p>

              <div className="calc-row">
                <span className="calc-label">Ticket price</span>
                <span className="calc-val">$20</span>
              </div>
              <div className="calc-row">
                <span className="calc-label">Attendees</span>
                <span className="calc-val"><RevenueCounter target={800} /></span>
              </div>
              <div className="calc-row">
                <span className="calc-label">Gross revenue</span>
                <span className="calc-val">$<RevenueCounter target={16000} /></span>
              </div>
              <div className="calc-row">
                <span className="calc-label">Metlanta fee (5%)</span>
                <span className="calc-val red-text">−$<RevenueCounter target={800} /></span>
              </div>

              <div className="calc-total">
                <span className="calc-total-label">You take home</span>
                <span className="calc-total-val">$<RevenueCounter target={15200} /></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── Social Proof ──────────────────────────────────────────────────────────── */

function ProofSection() {
  return (
    <section className="proof">
      <div className="wrap">
        <div className="proof-grid reveal">
          <div className="proof-item">
            <p className="proof-num">ATL</p>
            <p className="proof-label">Live in Atlanta</p>
            <p className="proof-sublabel">More cities coming soon</p>
          </div>
          <div className="proof-item">
            <p className="proof-num">DAILY</p>
            <p className="proof-label">New events added</p>
            <p className="proof-sublabel">After proms, kickbacks, pop-ups</p>
          </div>
          <div className="proof-item">
            <p className="proof-num">FREE</p>
            <p className="proof-label">To list your event</p>
            <p className="proof-sublabel">5% only on paid tickets</p>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── Pricing ───────────────────────────────────────────────────────────────── */

const PRICING_FEATURES = [
  'Unlimited event pages',
  'Custom ticket tiers — General, VIP, Early Bird, Free',
  'Live sales dashboard',
  'QR code check-in',
  'Same-night payouts via Stripe',
  'Share link + embed anywhere',
  'Guest list management',
  'Event analytics',
]

function PricingSection() {
  return (
    <section className="events" id="pricing" style={{ paddingTop: 96, paddingBottom: 100, background: '#0D0D0D', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="wrap">
        <div className="events-top reveal">
          <div>
            <p className="section-eyebrow">Pricing</p>
            <h2 className="section-title">Simple. No surprises.</h2>
          </div>
        </div>
        <div className="reveal d1" style={{ maxWidth: 560 }}>
          <div className="revenue-calc" style={{ padding: '32px' }}>
            <div style={{ marginBottom: 24 }}>
              <p className="section-eyebrow" style={{ marginBottom: 8 }}>All hosts</p>
              <p style={{ fontSize: 'clamp(36px, 6vw, 56px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1 }}>Free</p>
              <p style={{ fontSize: 14, color: 'var(--gray)', marginTop: 6 }}>to create events and list on Metlanta</p>
              <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 28, fontWeight: 900, color: 'var(--red)' }}>5%</span>
                <span style={{ fontSize: 14, color: 'var(--gray)' }}>+ payment processing on paid tickets only</span>
              </div>
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 24, marginBottom: 20 }}>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 16 }}>Everything included</p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {PRICING_FEATURES.map((f) => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'rgba(255,255,255,0.75)' }}>
                    <span style={{ color: 'var(--green)', flexShrink: 0 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            <a href="#host" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              Create Your First Event
            </a>
            <p style={{ textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.2)', marginTop: 12 }}>
              No credit card needed to start
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── Final CTA ─────────────────────────────────────────────────────────────── */

function CTASection() {
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setDone(true)
    setEmail('')
  }

  return (
    <section className="cta-section" id="download">
      <div className="wrap">
        <div className="reveal">
          <p className="section-eyebrow" style={{ marginBottom: 20 }}>Ready?</p>
          <h2 className="section-title">
            Your first event<br />starts tonight.
          </h2>
          <p>
            No experience. No upfront cost. Just your idea, a date, and the
            drive to throw something Atlanta won&apos;t forget.
          </p>

          <div className="cta-buttons">
            <a href="#host" className="btn-primary">
              Create Your Event — It&apos;s Free
            </a>
            <a href="#events" className="btn-ghost">
              Explore Events
            </a>
          </div>
          <p className="cta-note">Free to list · 5% on ticket sales only · No monthly costs</p>

          <div className="cta-or">
            <div className="or-line" />
            <span className="or-text">or</span>
            <div className="or-line" />
          </div>

          {!done ? (
            <form className="waitlist-form" onSubmit={submit}>
              <input
                type="email"
                className="waitlist-input"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit" className="waitlist-submit">Join Waitlist</button>
            </form>
          ) : (
            <div className="waitlist-success">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              You&apos;re on the list — we&apos;ll hit you when we launch!
            </div>
          )}
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', marginTop: 12 }}>
            No spam. Launch updates and early host access only.
          </p>
        </div>
      </div>
    </section>
  )
}

/* ── Footer ────────────────────────────────────────────────────────────────── */

function Footer() {
  const cols = {
    Platform: ['Explore Events', 'Host an Event', 'Pricing', 'How It Works'],
    Company: ['About', 'Blog', 'Careers', 'Contact'],
    Legal: ['Privacy Policy', 'Terms of Service', 'Cookies'],
    Cities: ['Atlanta', 'Miami', 'Houston', 'NYC', 'LA'],
  }

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="footer-logo">
              <div className="footer-logo-wrap">
                <Image src="/logo.png" alt="Metlanta" height={24} width={53} className="footer-logo-img" />
              </div>
              <span className="footer-logo-text">Metlanta</span>
            </div>
            <p className="footer-tagline">
              The social event marketplace for Atlanta&apos;s party generation.
            </p>
            <div className="footer-socials">
              {[
                {
                  label: 'Instagram',
                  icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>,
                },
                {
                  label: 'TikTok',
                  icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.72a8.16 8.16 0 004.77 1.52V6.79a4.85 4.85 0 01-1.01-.1z" /></svg>,
                },
                {
                  label: 'X',
                  icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.213 5.567zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>,
                },
              ].map((s) => (
                <a key={s.label} href="#" className="social-btn" aria-label={s.label}>{s.icon}</a>
              ))}
            </div>
          </div>

          {Object.entries(cols).map(([title, links]) => (
            <div key={title} className="footer-col">
              <p className="footer-col-title">{title}</p>
              <ul>
                {links.map((l) => (
                  <li key={l}><a href="#">{l}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="footer-bottom">
          <p className="footer-copy">© 2026 Metlanta, Inc. All rights reserved. Built in Atlanta, GA.</p>
          <div className="footer-legal">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Cookies</a>
          </div>
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
      <RevenueSection />
      <ProofSection />
      <PricingSection />
      <CTASection />
      <Footer />
    </main>
  )
}
