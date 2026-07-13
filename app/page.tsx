'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { useSession, signOut } from 'next-auth/react'
import type { DbEvent, DbTicketTier } from '@/lib/supabase'
import { Avatar, AvatarImage, AvatarFallback, AvatarBadge } from '@/components/ui/avatar'

const GlobeScene = dynamic(() => import('./components/GlobeScene'), { ssr: false })
const SplineHero = dynamic(() => import('./components/SplineHero'), { ssr: false })

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
          <nav className="nav-links">
            <a href="#events" className="nav-link">Discover</a>
            <a href="#how" className="nav-link">How It Works</a>
            <a href="/explore" className="nav-link">Explore</a>
          </nav>
          <div className="nav-right">
            {!session ? (
              <>
                <a href="/login" className="nav-login-link">Log in</a>
                <a href="/login" className="nav-cta">Get Started</a>
              </>
            ) : (
              <a href="/dashboard" className="nav-cta">Dashboard</a>
            )}
            <button className="nav-menu-btn" onClick={() => setDrawerOpen(true)} aria-label="Menu">
              {session?.user?.image ? (
                <Avatar className="h-7 w-7">
                  <AvatarImage src={session.user.image} alt={session.user.name ?? ''} />
                  <AvatarFallback>{session.user.name?.[0] ?? 'M'}</AvatarFallback>
                </Avatar>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="7" x2="21" y2="7"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="17" x2="21" y2="17"/>
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      <div className={`drawer-overlay${drawerOpen ? ' open' : ''}`} onClick={close} />
      <div className={`drawer${drawerOpen ? ' open' : ''}`}>
        <div className="drawer-top">
          {session ? (
            <div className="drawer-user">
              <Avatar className="h-[38px] w-[38px] shrink-0">
                <AvatarImage src={session.user?.image ?? ''} alt={session.user?.name ?? ''} />
                <AvatarFallback>{session.user?.name?.[0] ?? 'M'}</AvatarFallback>
                <AvatarBadge />
              </Avatar>
              <div style={{ minWidth: 0 }}>
                <p className="drawer-user-name">{session.user?.name ?? 'User'}</p>
                <p className="drawer-user-email">{session.user?.email}</p>
              </div>
            </div>
          ) : (
            <a href="/" onClick={close}><img src="/metlantalogo.png" alt="Metlanta" className="drawer-logo-img" /></a>
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
          <a href="/explore" className="drawer-link" onClick={close}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
            Explore
          </a>
          {session && <>
            <a href="/tickets" className="drawer-link" onClick={close}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z"/></svg>
              My Tickets
            </a>
            <a href="/dashboard" className="drawer-link" onClick={close}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
              Dashboard
            </a>
            <a href="/account" className="drawer-link" onClick={close}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              Account
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
          <p className="drawer-version">Metlanta · Live experiences, everywhere.</p>
        </div>
      </div>
    </>
  )
}

/* ── Hero ─────────────────────────────────────────────────────────────────── */

function Hero() {
  const { data: session } = useSession()

  return (
    <section className="hero">
      <div className="hero-spline hero-spline-ready" aria-hidden>
        <SplineHero />
      </div>
      <div className="hero-overlay" aria-hidden />
      <div className="hero-fade-bottom" aria-hidden />
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
        {soldPct > 75 && <span className="event-hot-badge">🔥 Selling Fast</span>}
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
            {loading ? <span className="btn-spinner" /> : !available ? 'Sold Out' : isFree ? 'RSVP Free' : 'Get Tickets'}
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
            <p className="empty-title">No events live yet.</p>
            <p className="empty-sub">Be the first to host something in your city.</p>
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

/* ── How It Works ─────────────────────────────────────────────────────────── */

function HowSection() {
  const steps = [
    {
      n: '01',
      title: 'Create your event',
      body: 'Build a professional event page in under 5 minutes. Set ticket tiers, upload your flyer, and configure your Stripe payout.',
      items: [
        'Upload event flyer or banner',
        'Set multiple ticket tiers (Free, GA, VIP)',
        'Configure venue, date & capacity',
        'Connect Stripe to receive payouts',
      ],
    },
    {
      n: '02',
      title: 'Share everywhere',
      body: 'Your event gets its own shareable link. Post it anywhere — Instagram, TikTok, Twitter, group chats — and recruit promoters.',
      items: [
        'Unique shareable event link',
        'Share directly to Instagram & TikTok',
        'Invite promoters with referral links',
        'Track clicks and conversions in real time',
      ],
    },
    {
      n: '03',
      title: 'Sell out. Get paid.',
      body: 'Watch ticket sales roll in from your dashboard. Check guests in with QR codes. Stripe deposits land directly in your account.',
      items: [
        'Live ticket sales dashboard',
        'QR code guest check-in app',
        'Real-time revenue & analytics',
        'Stripe payout straight to your bank',
      ],
    },
  ]

  return (
    <section className="how-section" id="how">
      <div className="wrap">
        <div className="section-hd reveal" style={{ textAlign: 'center' }}>
          <p className="eyebrow-label">How It Works</p>
          <h2 className="section-title">From idea to sold out<br />in three steps.</h2>
        </div>
        <div className="how-grid">
          {steps.map((s, i) => (
            <div key={s.n} className={`how-card reveal d${i + 1}`}>
              <span className="how-num">{s.n}</span>
              <h3 className="how-title">{s.title}</h3>
              <p className="how-body">{s.body}</p>
              <ul className="how-items">
                {s.items.map(item => (
                  <li key={item}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── Roles section ────────────────────────────────────────────────────────── */

function RolesSection() {
  const roles = [
    {
      id: 'attendee',
      label: 'Attendee',
      tagline: 'Discover experiences near you.',
      color: '#5B8CF5',
      glow: 'rgba(91,140,245,0.25)',
      href: '/login',
      cta: 'Start Discovering',
      features: ['Browse events by city & vibe', 'Buy tickets in seconds', 'Follow hosts you love', 'Share events with friends'],
    },
    {
      id: 'host',
      label: 'Host',
      tagline: 'Create events. Sell tickets. Get paid.',
      color: '#E03030',
      glow: 'rgba(224,48,48,0.25)',
      href: '/login?callbackUrl=/host/onboarding',
      cta: 'Start Hosting Free',
      features: ['Publish your event in minutes', 'Sell tickets via Stripe', 'Manage your full guest list', 'Real-time sales analytics'],
    },
    {
      id: 'promoter',
      label: 'Promoter',
      tagline: 'Grow events. Build influence.',
      color: '#4ECDC4',
      glow: 'rgba(78,205,196,0.25)',
      href: '/login',
      cta: 'Become a Promoter',
      features: ['Get unique referral links', 'Share to any platform', 'Track your conversions', 'Earn on every ticket sold'],
    },
  ]

  return (
    <section className="roles-section">
      <div className="wrap">
        <div className="section-hd reveal" style={{ textAlign: 'center' }}>
          <p className="eyebrow-label">Join the Ecosystem</p>
          <h2 className="section-title">Find your role<br />in the culture.</h2>
        </div>
        <div className="roles-grid">
          {roles.map((role, i) => (
            <div
              key={role.id}
              className={`role-card reveal d${i + 1}`}
              style={{ '--rc': role.color, '--rg': role.glow } as React.CSSProperties}
            >
              <div className="role-card-accent" />
              <div className="role-card-head">
                <span className="role-card-title">{role.label}</span>
                <p className="role-card-tagline">{role.tagline}</p>
              </div>
              <ul className="role-card-list">
                {role.features.map(f => (
                  <li key={f}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    {f}
                  </li>
                ))}
              </ul>
              <a href={role.href} className="role-card-cta">
                {role.cta}
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── Host section ─────────────────────────────────────────────────────────── */

function HostSection() {
  const features = [
    { icon: '⚡', title: 'Live in minutes', body: 'Set your event details, upload a flyer, set ticket prices. You\'re live.' },
    { icon: '💳', title: 'Stripe-powered payouts', body: 'Every transaction runs through Stripe. Funds go directly to your connected account.' },
    { icon: '📊', title: 'Real-time dashboard', body: 'Track ticket sales, manage your guest list, and check in attendees from anywhere.' },
  ]

  return (
    <section className="host-section" id="host">
      <div className="wrap">
        <div className="host-inner">
          <div className="host-left reveal">
            <p className="eyebrow-label">For Hosts</p>
            <h2 className="section-title">Your event.<br />Your money.</h2>
            <p className="host-sub">Metlanta handles the ticketing infrastructure. You keep the majority of every sale with low, transparent fees.</p>
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
            <a href="/login?callbackUrl=/host/onboarding" className="btn-primary" style={{ marginTop: 8 }}>
              Start Hosting — Free
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>
          </div>

          <div className="host-right reveal d2">
            <div className="calc-card">
              <p className="calc-label">Example payout — $20 ticket</p>
              <div className="calc-row"><span>Ticket price</span><strong>$20.00</strong></div>
              <div className="calc-row"><span>Tickets sold</span><strong><AnimCounter target={400} /></strong></div>
              <div className="calc-row"><span>Gross revenue</span><strong>$<AnimCounter target={8000} /></strong></div>
              <div className="calc-row muted"><span>Platform fee (22%)</span><span className="red-text">−$<AnimCounter target={1760} /></span></div>
              <div className="calc-payout"><span>You take home</span><span className="payout-val">$<AnimCounter target={6240} /></span></div>
              <p style={{ fontSize: 11, color: 'var(--gray3)', marginTop: 14, lineHeight: 1.6 }}>
                Fee drops to 15% on tickets $100+. Always transparent, no monthly fees.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── CTA ──────────────────────────────────────────────────────────────────── */

function CTASection() {
  return (
    <section className="cta-section">
      <div className="cta-globe" aria-hidden>
        <GlobeScene />
      </div>
      <div className="cta-globe-fade-top" aria-hidden />
      <div className="cta-globe-fade-bottom" aria-hidden />
      <div className="wrap">
        <div className="cta-inner reveal">
          <p className="eyebrow-label" style={{ marginBottom: 16 }}>Ready to go live?</p>
          <h2 className="cta-title">Your first event<br />starts tonight.</h2>
          <p className="cta-sub">No experience needed. No upfront cost. Free to list.</p>
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
            <a href="/"><img src="/metlantalogo.png" alt="Metlanta" className="footer-logo-img" /></a>
            <p className="footer-tag">The social marketplace for live experiences.</p>
            <p className="footer-city">Launching in Atlanta · Expanding nationwide</p>
          </div>
          <div className="footer-cols">
            <div className="footer-col">
              <p className="footer-col-head">Discover</p>
              <a href="#events">Browse Events</a>
              <a href="/explore">Explore</a>
              <a href="/login">Sign Up</a>
            </div>
            <div className="footer-col">
              <p className="footer-col-head">Host</p>
              <a href="/login">Create Event</a>
              <a href="/dashboard">Dashboard</a>
              <a href="/help">Help Center</a>
            </div>
            <div className="footer-col">
              <p className="footer-col-head">Company</p>
              <a href="mailto:support@metlanta.app">Contact</a>
              <a href="/help">FAQ</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 Metlanta, Inc. — Social Event Marketplace</p>
          <p>Platform fee: 15–22% on paid tickets · Free to list · Free to browse</p>
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
      <HowSection />
      <RolesSection />
      <HostSection />
      <CTASection />
      <Footer />
    </>
  )
}
