'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useSession, signOut } from 'next-auth/react'
import type { DbEvent, DbTicketTier } from '@/lib/supabase'
import { Avatar, AvatarImage, AvatarFallback, AvatarBadge } from '@/components/ui/avatar'

/* ── Scroll reveal ────────────────────────────────────────────────────────── */

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal')
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target) }
      }),
      { threshold: 0.06 }
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
            <a href="#events" className="nav-link">Events</a>
            <a href="#host" className="nav-link">Host</a>
            <a href="/marketplace" className="nav-link">Marketplace</a>
            <a href="#faq" className="nav-link">FAQ</a>
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
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            Find Events
          </a>
          <a href="/explore" className="drawer-link" onClick={close}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
            Explore
          </a>
          <a href="/marketplace" className="drawer-link" onClick={close}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
            Marketplace
          </a>
          {session && <>
            <a href="/tickets" className="drawer-link" onClick={close}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 010 6v2a2 2 0 002 2h16a2 2 0 002-2v-2a3 3 0 010-6V7a2 2 0 00-2-2H4a2 2 0 00-2 2v2z"/></svg>
              My Tickets
            </a>
            <a href="/dashboard" className="drawer-link" onClick={close}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
              Dashboard
            </a>
          </>}
          <div className="drawer-divider" />
          <a href="#faq" className="drawer-link" onClick={close}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            FAQ
          </a>
          {!session ? (
            <>
              <div className="drawer-divider" />
              <a href="/login" className="drawer-link" onClick={close}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                Log In
              </a>
            </>
          ) : (
            <>
              <div className="drawer-divider" />
              <button className="drawer-link danger" onClick={() => { close(); signOut({ callbackUrl: '/' }) }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
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

function Hero({ events }: { events: DbEvent[] }) {
  const flyerItems = events.filter(e => e.flyer_url || e.image_url).slice(0, 12)
  const placeholders = ['#2d0808','#1a0a1e','#1a1400','#050d05','#1e1000','#070010','#0d1a0d','#1a0d1a']

  const tiles = flyerItems.length >= 6
    ? [...flyerItems, ...flyerItems]
    : placeholders.map((c, i) => ({ id: String(i), title: '', flyer_url: null, _color: c }))

  return (
    <section className="lp-hero">
      <div className="lp-hero-bg" aria-hidden />

      <div className="lp-hero-content">
        {/* Animated headline */}
        <h1 className="lp-headline">
          <span className="lp-line-wrap">
            <span className="lp-rise" style={{ animationDelay: '60ms' }}>Every great</span>
          </span>
          <span className="lp-line-wrap lp-center">
            <span className="lp-rise" style={{ animationDelay: '180ms' }}>night starts</span>
          </span>
          <span className="lp-line-wrap lp-right">
            <span className="lp-rise" style={{ animationDelay: '300ms' }}>
              with a <em className="lp-accent-word">vibe.</em>
            </span>
          </span>
        </h1>

        {/* Subline + CTAs */}
        <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.5)', maxWidth: 420, lineHeight: 1.65, marginBottom: 28 }}>
          Find the events worth showing up for, grab tickets in seconds, and host your own — on the platform built for Atlanta nights.
        </p>

        <div className="lp-hero-ctas">
          <a href="/login?callbackUrl=/host/onboarding" className="lp-cta-primary">
            Host an event
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
          <a href="#events" className="lp-cta-ghost">Find your night</a>
        </div>
      </div>

      {/* Marquee flyer strip */}
      <div className="marquee-wrap">
        <div className="marquee-track">
          {[...tiles, ...tiles].map((item, i) => (
            <div
              key={i}
              className="marquee-card"
              style={{ background: (item as { _color?: string })._color ?? '#1a1a1a' }}
            >
              {(item as DbEvent).flyer_url && (
                <Image
                  src={(item as DbEvent).flyer_url!}
                  alt={(item as DbEvent).title}
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="140px"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── Happening Now card ───────────────────────────────────────────────────── */

const EVENT_GRADIENTS: Record<string, string> = {
  after_prom:   '#2d0808',
  day_party:    '#1a0a1e',
  nightlife:    '#1a1400',
  kickback:     '#050d05',
  pop_up:       '#1e1000',
  school_event: '#070010',
}

function HappeningNowCard({ event }: { event: DbEvent }) {
  const flyerSrc = event.flyer_url ?? event.image_url
  const bg = EVENT_GRADIENTS[event.event_type ?? ''] ?? '#141414'
  const dateStr = event.date
    ? new Date(event.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase()
    : ''
  const timeStr = event.time ? ` · ${event.time}` : ''
  const minPrice = event.ticket_tiers?.length
    ? Math.min(...event.ticket_tiers.map(t => t.price))
    : 0

  return (
    <a href={`/events/${event.id}`} className="hn-card">
      <div className="hn-card-img" style={{ background: bg }}>
        {flyerSrc && (
          <Image src={flyerSrc} alt={event.title} fill style={{ objectFit: 'cover' }} sizes="(max-width:500px) 50vw, 25vw" />
        )}
        <span className="hn-featured-badge">Featured</span>
        <div className="hn-date-overlay">{dateStr}{timeStr}</div>
      </div>
      <div className="hn-card-body">
        <p className="hn-card-title">{event.title}</p>
        <p className="hn-card-host">
          {event.location}
          {minPrice === 0 ? ' · Free' : ` · from $${minPrice}`}
        </p>
      </div>
    </a>
  )
}

/* ── Happening Now section ────────────────────────────────────────────────── */

function HappeningNow({ events, loading }: { events: DbEvent[]; loading: boolean }) {
  return (
    <section className="hn-section" id="events">
      <div className="wrap">
        <div className="hn-header">
          <div>
            <h2 className="hn-title">Happening Now</h2>
            <p className="hn-sub">Real events, on sale right now. Handpicked and selling — tap in before the room fills up.</p>
          </div>
          <a href="/explore" className="hn-view-all">
            View all events
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
        </div>

        {loading ? (
          <div className="hn-grid">
            {[1,2,3,4].map(i => (
              <div key={i} style={{ background: '#111', borderRadius: 14, aspectRatio: '3/5', animation: 'skeletonPulse 1.8s ease-in-out infinite' }} />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.3)' }}>
            <p style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>No events live yet</p>
            <p style={{ fontSize: 14 }}>Be the first to host something in Atlanta.</p>
            <a href="/login?callbackUrl=/host/onboarding" className="btn-primary" style={{ marginTop: 24, display: 'inline-flex' }}>Create an Event</a>
          </div>
        ) : (
          <div className="hn-grid">
            {events.slice(0, 8).map(e => <HappeningNowCard key={e.id} event={e} />)}
          </div>
        )}
      </div>
    </section>
  )
}

/* ── For Hosts ────────────────────────────────────────────────────────────── */

const HOST_FEATURES = [
  {
    num: '01',
    name: 'Teams',
    desc: 'Create a team, hand out roles, and keep promoters, door staff, and partners in sync on every event.',
  },
  {
    num: '02',
    name: 'Payments & Payouts',
    desc: 'Sell tickets with Stripe-backed checkout, scan people in with QR codes, and get paid out without chasing anyone.',
  },
  {
    num: '03',
    name: 'Marketing',
    desc: 'SMS and tracking links built in — announce the event, fill the room, and see exactly which channel sold.',
  },
  {
    num: '04',
    name: 'Analytics',
    desc: 'Live sales, scans, and revenue per event and per team member, so the next event starts smarter than the last.',
  },
]

function ForHosts() {
  return (
    <section className="hf-section" id="host">
      <div className="wrap">
        <p className="hf-eyebrow">For Hosts</p>
        <h2 className="hf-headline">
          Everything you need to{' '}
          <span className="hf-accent">sell out</span>{' '}
          the room
        </h2>

        <div className="hf-list">
          {HOST_FEATURES.map(f => (
            <div key={f.num} className="hf-row reveal">
              <span className="hf-num">{f.num}</span>
              <span className="hf-name">{f.name}</span>
              <span className="hf-desc">{f.desc}</span>
            </div>
          ))}
        </div>

        {/* Free to Host */}
        <div className="free-host-band reveal">
          <div>
            <h2 className="free-host-title">Free to host.</h2>
            <p className="free-host-desc">
              Hosting costs nothing. Attendees pay a tiered platform fee per paid ticket — 22% on tickets under $25, 20% on $25–$50, 17% on $50–$100, and 15% on $100+ — RSVPs and free tickets carry no fees at all.
            </p>
          </div>
          <div className="free-host-cta-wrap">
            <a href="/login?callbackUrl=/host/onboarding" className="btn-primary" style={{ fontSize: 15, padding: '14px 28px' }}>
              Start hosting →
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── The Night, In Your Pocket ────────────────────────────────────────────── */

function ForTheCrowd() {
  return (
    <section className="np-section">
      <div className="wrap">
        <div className="np-inner">
          {/* Left text */}
          <div className="reveal">
            <p className="np-eyebrow">For the crowd</p>
            <h2 className="np-headline">The night,<br />in your pocket</h2>
            <p className="np-body">
              Browse what&apos;s on tonight, keep your QR ticket on your phone, and breeze past the line.
            </p>
            <div className="np-actions">
              <a href="/explore" className="btn-ghost" style={{ fontSize: 14, padding: '12px 22px' }}>
                Explore events →
              </a>
            </div>
          </div>

          {/* Right phone mockup */}
          <div className="np-phone-wrap reveal d2">
            <div className="np-glow" aria-hidden />
            <div className="np-phone">
              <div className="np-phone-topbar"><div className="np-phone-notch" /></div>
              <div className="np-phone-inner">
                <div className="np-phone-event">
                  <div className="np-phone-event-img" style={{ background: 'linear-gradient(160deg,#2d0808,#0a0000)' }}>
                    <div className="np-phone-event-badge">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                      Featured
                    </div>
                  </div>
                  <div className="np-phone-event-info">
                    <p className="np-phone-event-title">Summer Night in Atlanta</p>
                    <p className="np-phone-event-meta">Sat, Aug 10 · 9:00 PM - 2:00 AM</p>
                  </div>
                </div>
                <div className="np-phone-nav">
                  {[
                    { label: 'Home', icon: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z' },
                    { label: 'Tickets', icon: 'M2 9a3 3 0 010 6v2a2 2 0 002 2h16a2 2 0 002-2v-2a3 3 0 010-6V7a2 2 0 00-2-2H4a2 2 0 00-2 2v2z' },
                    { label: 'Profile', icon: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z' },
                  ].map(item => (
                    <div key={item.label} className="np-phone-nav-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d={item.icon} />
                      </svg>
                      <span className="np-phone-nav-label">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── Questions Answered FAQ ───────────────────────────────────────────────── */

const FAQ_ITEMS = [
  {
    q: 'Are there fees?',
    a: 'Hosting is free. Attendees pay a tiered platform fee per paid ticket — 22% on tickets under $25, 20% on $25–$50, 17% on $50–$100, and 15% on $100+. RSVPs and free tickets have no fees at all.',
  },
  {
    q: 'How do I host an event?',
    a: 'Sign up, complete host onboarding, and publish your event page in minutes from your dashboard. Set ticket tiers, upload your flyer, and go live — no technical experience needed.',
  },
  {
    q: 'How are payments processed?',
    a: 'All payments are securely handled through Stripe. After your event, funds are deposited directly into your connected Stripe account with a full transparent breakdown.',
  },
  {
    q: 'How can I see my balance?',
    a: 'Log into your Metlanta dashboard and go to Account Balance. You can request payouts, view your full transaction history, and connect your bank account directly.',
  },
]

function QuestionsAnswered() {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <section className="qa-section" id="faq">
      <div className="wrap">
        <div className="qa-inner">
          <div>
            <h2 className="qa-title">Questions,<br />answered.</h2>
            <p className="qa-sub">No question is a dumb question, but here are the most common ones.</p>
          </div>
          <div className="qa-list">
            {FAQ_ITEMS.map((item, i) => (
              <div key={i} className="qa-item">
                <button className="qa-q" onClick={() => setOpen(open === i ? null : i)}>
                  <span>{item.q}</span>
                  <svg
                    width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                    style={{ transform: open === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}
                  ><polyline points="6 9 12 15 18 9"/></svg>
                </button>
                {open === i && <p className="qa-a">{item.a}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── Footer CTA ───────────────────────────────────────────────────────────── */

function FooterCTA() {
  return (
    <section className="footer-cta-section">
      <div className="wrap">
        <div className="footer-cta-inner reveal">
          <h2 className="footer-cta-title">Ready to throw<br />your next event?</h2>
          <p className="footer-cta-sub">No experience needed. No upfront cost. Free to list.</p>
          <div className="cta-actions">
            <a href="/login?callbackUrl=/host/onboarding" className="btn-primary">Start hosting</a>
            <a href="#events" className="btn-ghost">View all events</a>
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
              <p className="footer-col-head">Events</p>
              <a href="#events">Browse Events</a>
              <a href="/explore">Explore</a>
              <a href="/marketplace">Marketplace</a>
            </div>
            <div className="footer-col">
              <p className="footer-col-head">Host</p>
              <a href="/login">Create Event</a>
              <a href="/dashboard">Dashboard</a>
              <a href="/help">Documentation</a>
            </div>
            <div className="footer-col">
              <p className="footer-col-head">Company</p>
              <a href="/login">Join</a>
              <a href="#faq">FAQ</a>
              <a href="mailto:support@metlanta.app">Contact</a>
            </div>
            <div className="footer-col">
              <p className="footer-col-head">Legal</p>
              <a href="/help">Terms of Service</a>
              <a href="/help">Privacy Policy</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 Metlanta, Inc. — Live experiences, everywhere.</p>
          <div className="footer-bottom-links">
            <a href="/login">Login</a>
            <a href="/explore">Events</a>
            <a href="/marketplace">Marketplace</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

/* ── Page ─────────────────────────────────────────────────────────────────── */

export default function Page() {
  useReveal()
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
    <>
      <Navbar />
      <Hero events={events} />
      <HappeningNow events={events} loading={loading} />
      <ForHosts />
      <ForTheCrowd />
      <QuestionsAnswered />
      <FooterCTA />
      <Footer />
    </>
  )
}
