'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { useSession, signOut } from 'next-auth/react'
import type { DbEvent, DbTicketTier } from '@/lib/supabase'
import { Avatar, AvatarImage, AvatarFallback, AvatarBadge } from '@/components/ui/avatar'

const SplineHero = dynamic(() => import('./components/SplineHero'), { ssr: false })

/* ── Fee helpers ─────────────────────────────────────────────────────────── */

function calcFees(subtotal: number) {
  const serviceFee = parseFloat(Math.max(1.99, subtotal * 0.047).toFixed(2))
  const platformFee = parseFloat((subtotal * (subtotal >= 100 ? 0.15 : 0.22)).toFixed(2))
  return { serviceFee, platformFee, total: subtotal + serviceFee + platformFee }
}

/* ── Checkout modal ──────────────────────────────────────────────────────── */

interface CheckoutData {
  url: string
  tierName: string
  price: number
}

function CheckoutModal({
  eventTitle, tierName, price, stripeUrl, onClose,
}: {
  eventTitle: string; tierName: string; price: number; stripeUrl: string; onClose: () => void
}) {
  const [agreed, setAgreed] = useState(false)
  const { serviceFee, platformFee, total } = calcFees(price)

  return (
    <div className="co-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="co-box">
        <div className="co-header">
          <button className="co-back" onClick={onClose} aria-label="Back">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          </button>
          <div>
            <p className="co-title">Checkout</p>
            <p className="co-event">{eventTitle}</p>
          </div>
        </div>

        <div className="co-summary">
          <div className="co-summary-hd">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
            Order Summary
          </div>
          <div className="co-row"><span>1x {tierName}</span><span>${price.toFixed(2)}</span></div>
          <div className="co-sep" />
          <div className="co-row co-dim"><span>Subtotal</span><span>${price.toFixed(2)}</span></div>
          <div className="co-row co-dim"><span>Service Fee</span><span>${serviceFee.toFixed(2)}</span></div>
          <div className="co-row co-dim"><span>Platform Fee</span><span>${platformFee.toFixed(2)}</span></div>
          <div className="co-sep" />
          <div className="co-row co-total"><span>Total</span><span>${total.toFixed(2)}</span></div>
        </div>

        <div className="co-membership">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          <div>
            <p className="co-membership-title">Metlanta Membership — 7 Day Free Trial</p>
            <p className="co-membership-body">Your first purchase starts a 7-day free membership trial. After the trial ends, you&apos;ll be charged $3.49/month. Cancel anytime in your account settings.</p>
          </div>
        </div>

        <label className="co-terms-label">
          <input type="checkbox" className="co-check" checked={agreed} onChange={e => setAgreed(e.target.checked)} />
          <span>I agree to the Terms of Service and authorize the membership with a 7-day free trial, then $3.49/month.</span>
        </label>

        <button
          className={`co-cta${agreed ? '' : ' co-cta-disabled'}`}
          disabled={!agreed}
          onClick={() => { if (agreed) window.location.href = stripeUrl }}
        >
          Agree to Terms to Continue
        </button>
      </div>
    </div>
  )
}

/* ── Scroll reveal ────────────────────────────────────────────────────────── */

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal')
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target) }
      }),
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
            <a href="/account" className="drawer-link" onClick={close}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              Account
            </a>
          </>}
          <div className="drawer-divider" />
          <a href="#faq" className="drawer-link" onClick={close}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            FAQ
          </a>
          <a href="/help" className="drawer-link" onClick={close}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            Help Center
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

function Hero() {
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
        <p className="hero-eyebrow">Live experiences, everywhere.</p>
        <h1 className="hero-headline">
          Every great night<br />
          <em className="hero-headline-accent">starts here.</em>
        </h1>
        <p className="hero-sub">
          Discover events near you, buy tickets in seconds, and host your own — all in one place.
        </p>
        <div className="hero-actions">
          <a href="#events" className="btn-primary">
            Find your night
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
          <a href="/login?callbackUrl=/host/onboarding" className="btn-ghost">Host an event</a>
        </div>
        <div className="hero-trust">
          <span><strong>12k+</strong> Tickets sold</span>
          <span className="hero-trust-dot" />
          <span><strong>340+</strong> Active hosts</span>
          <span className="hero-trust-dot" />
          <span><strong>8</strong> Cities live</span>
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
  const [checkout, setCheckout] = useState<CheckoutData | null>(null)

  const minPrice = event.ticket_tiers?.length ? Math.min(...event.ticket_tiers.map(t => t.price)) : 0
  const isFree = minPrice === 0
  const available = selectedTier
    ? selectedTier.capacity === null || selectedTier.sold_count < selectedTier.capacity
    : false
  const soldPct = selectedTier?.capacity
    ? Math.round((selectedTier.sold_count / selectedTier.capacity) * 100)
    : 0
  const bg = EVENT_GRADIENTS[event.event_type ?? ''] ?? 'linear-gradient(135deg,#141414,#0a0a0a)'
  const dateStr = event.date
    ? new Date(event.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    : '—'

  async function handleBuy() {
    if (!selectedTier || !available) return
    setLoading(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: event.id,
          tiers: [{ tierId: selectedTier.id, tierName: selectedTier.name, price: selectedTier.price, quantity: 1 }],
        }),
      })
      const data = await res.json()
      if (data.url) {
        if (selectedTier.price === 0) {
          window.location.href = data.url
        } else {
          setCheckout({ url: data.url, tierName: selectedTier.name, price: selectedTier.price })
        }
      } else {
        alert(data.error ?? 'Something went wrong.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {checkout && (
        <CheckoutModal
          eventTitle={event.title}
          tierName={checkout.tierName}
          price={checkout.price}
          stripeUrl={checkout.url}
          onClose={() => setCheckout(null)}
        />
      )}
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
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
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
                >{t.name}</button>
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
    </>
  )
}

/* ── Featured Events ──────────────────────────────────────────────────────── */

function FeaturedEventsSection() {
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
        <div className="section-hd reveal" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <p className="eyebrow-label">Featured Events</p>
            <h2 className="section-title">Handpicked moments<br />lighting up the scene.</h2>
            <p className="featured-sub">Tap in before they sell out.</p>
          </div>
          <a href="/explore" className="btn-ghost" style={{ flexShrink: 0, fontSize: 13, padding: '10px 18px' }}>
            View all events
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
        </div>

        {loading ? (
          <div className="events-grid">
            {[1, 2, 3].map(i => <div key={i} className="event-skeleton" />)}
          </div>
        ) : events.length === 0 ? (
          <div className="events-empty reveal">
            <div className="empty-icon-wrap">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
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

/* ── Why Host ─────────────────────────────────────────────────────────────── */

function WhyHostSection() {
  const features = [
    {
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
      title: 'Teams',
      body: 'Coordinate your crew. Assign roles, manage your team, and delegate tasks without losing control of your event.',
    },
    {
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
      title: 'Payments & Payouts',
      body: 'Sell tickets and get paid directly. Every transaction runs through Stripe — funds land straight in your bank account.',
    },
    {
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.69A2 2 0 012.18 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.91 7.15a16 16 0 006.72 6.72l1.52-1.52a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92z"/></svg>,
      title: 'Marketing',
      body: 'Spread the word automatically. Email blasts, SMS alerts, and promoter referral links to fill every seat.',
    },
  ]

  return (
    <section className="why-host-section" id="host">
      <div className="wrap">
        <div className="section-hd reveal" style={{ textAlign: 'center' }}>
          <p className="eyebrow-label">For Hosts</p>
          <h2 className="section-title">Why host on Metlanta</h2>
          <p className="why-host-sub">Everything you need to run a sold-out event.</p>
        </div>
        <div className="why-host-grid">
          {features.map((f, i) => (
            <div key={f.title} className={`why-host-card reveal d${i + 1}`}>
              <div className="why-host-card-icon">{f.icon}</div>
              <h3 className="why-host-card-title">{f.title}</h3>
              <p className="why-host-card-body">{f.body}</p>
            </div>
          ))}
        </div>
        <div className="reveal" style={{ textAlign: 'center', marginTop: 40 }}>
          <a href="/login?callbackUrl=/host/onboarding" className="btn-primary">
            Start Hosting — Free
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
        </div>
      </div>
    </section>
  )
}

/* ── Discover ─────────────────────────────────────────────────────────────── */

const MOCK_EVENTS = [
  { title: 'Summer Rooftop Cookout', date: 'Sat, Aug 2', type: 'day party', price: 'Free', bg: 'linear-gradient(135deg,#1a0a1e,#050008)' },
  { title: 'ATL Night Vibes Vol. 4', date: 'Fri, Aug 8', type: 'nightlife',  price: '$25',  bg: 'linear-gradient(135deg,#1a1400,#060500)' },
  { title: 'R&B Under the Stars',    date: 'Sat, Aug 9', type: 'concert',    price: '$40',  bg: 'linear-gradient(135deg,#2d0808,#0d0000)' },
]

function DiscoverSection() {
  return (
    <section className="discover-section">
      <div className="wrap">
        <div className="discover-inner">
          <div className="discover-left reveal">
            <p className="eyebrow-label">For Attendees</p>
            <h2 className="section-title">Discover: The best events near you, a tap away.</h2>
            <p className="discover-body">Browse by city and vibe. Filter by date, event type, and price. Buy tickets in seconds and walk in with a QR code — no printing needed.</p>
            <ul className="check-list">
              {['Browse events by city & vibe', 'Buy tickets instantly', 'QR code entry — paperless', 'Follow your favorite hosts'].map(item => (
                <li key={item}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  {item}
                </li>
              ))}
            </ul>
            <a href="/explore" className="btn-primary">
              Explore Events
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>
          </div>
          <div className="discover-right reveal d2">
            <div className="phone-mock">
              <div className="phone-mock-bar">
                <span className="phone-dot wide" /><span className="phone-dot" /><span className="phone-dot" />
              </div>
              <p className="phone-mock-hd">Events near you</p>
              {MOCK_EVENTS.map((ev, i) => (
                <div key={i} className="phone-mock-card">
                  <div className="phone-mock-card-img" style={{ background: ev.bg }} />
                  <div className="phone-mock-card-info">
                    <p className="phone-mock-card-title">{ev.title}</p>
                    <p className="phone-mock-card-meta">{ev.date} · {ev.type}</p>
                  </div>
                  <span className="phone-mock-card-price">{ev.price}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── Analytics ────────────────────────────────────────────────────────────── */

const BAR_HEIGHTS = [40, 65, 45, 80, 55, 90, 70, 95, 60, 85, 75, 100]

function AnalyticsSection() {
  return (
    <section className="analytics-section">
      <div className="wrap">
        <div className="analytics-inner">
          <div className="analytics-left reveal">
            <div className="analytics-card">
              <p className="analytics-label">Revenue — Last 30 days</p>
              <div className="analytics-amount">
                $<AnimCounter target={248650} />
                <span className="analytics-change">+12.4%</span>
              </div>
              <div className="analytics-bars">
                {BAR_HEIGHTS.map((h, i) => (
                  <div key={i} className="analytics-bar" style={{ height: `${h}%`, opacity: i === BAR_HEIGHTS.length - 1 ? 1 : 0.55 + (i / BAR_HEIGHTS.length) * 0.35 }} />
                ))}
              </div>
              <div className="analytics-stats">
                <div>
                  <p className="analytics-stat-val"><AnimCounter target={1240} /></p>
                  <p className="analytics-stat-lbl">Tickets sold</p>
                </div>
                <div>
                  <p className="analytics-stat-val"><AnimCounter target={24} /></p>
                  <p className="analytics-stat-lbl">Events hosted</p>
                </div>
                <div>
                  <p className="analytics-stat-val"><AnimCounter target={94} suffix="%" /></p>
                  <p className="analytics-stat-lbl">Sell-through</p>
                </div>
              </div>
            </div>
          </div>
          <div className="analytics-right reveal d2">
            <p className="eyebrow-label">For Hosts</p>
            <h2 className="section-title">Analytics: Turn data into action, sell out every time.</h2>
            <p className="discover-body">Track ticket sales in real time, see who&apos;s buying, and optimize every event for maximum turnout. Know your numbers before, during, and after.</p>
            <ul className="check-list">
              {['Real-time ticket sales dashboard', 'Revenue and payout tracking', 'Attendee demographics & insights', 'QR check-in analytics'].map(item => (
                <li key={item}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  {item}
                </li>
              ))}
            </ul>
            <a href="/login?callbackUrl=/host/onboarding" className="btn-primary">
              Start Hosting Free
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── FAQ ──────────────────────────────────────────────────────────────────── */

const FAQ_ITEMS = [
  {
    q: 'What are the fees for hosting?',
    a: "It's free to host on Metlanta. A processing fee of 22% (15% on tickets $100+) is added to the ticket price for attendees. Free / RSVP tickets have no fees at all.",
  },
  {
    q: 'How do I start hosting an event?',
    a: 'Sign up, complete host onboarding, and publish your event page in minutes directly from your dashboard. Set ticket tiers, upload your flyer, and go live — no technical experience needed.',
  },
  {
    q: 'How are payments processed?',
    a: 'All payments are securely handled through Stripe. After your event, funds are deposited directly into your connected Stripe account with a full transparent breakdown.',
  },
  {
    q: 'How do I view my earnings?',
    a: 'Log into your Metlanta dashboard and navigate to the Payouts section. You can also view your full balance and transfer history directly through your Stripe account.',
  },
]

function FAQSection() {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <section className="faq-landing" id="faq">
      <div className="wrap">
        <div className="section-hd reveal" style={{ textAlign: 'center' }}>
          <p className="eyebrow-label">FAQ</p>
          <h2 className="section-title">Frequently Asked Questions</h2>
        </div>
        <div className="faq-landing-list">
          {FAQ_ITEMS.map((item, i) => (
            <div key={i} className={`faq-landing-item reveal d${Math.min(i + 1, 3)}`}>
              <button className="faq-landing-q" onClick={() => setOpen(open === i ? null : i)}>
                <span>{item.q}</span>
                <svg
                  width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  style={{ transform: open === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}
                ><polyline points="6 9 12 15 18 9"/></svg>
              </button>
              {open === i && <p className="faq-landing-a">{item.a}</p>}
            </div>
          ))}
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
          <p className="eyebrow-label" style={{ marginBottom: 16 }}>Ready to go live?</p>
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
  return (
    <>
      <Navbar />
      <Hero />
      <FeaturedEventsSection />
      <WhyHostSection />
      <DiscoverSection />
      <AnalyticsSection />
      <FAQSection />
      <FooterCTA />
      <Footer />
    </>
  )
}
