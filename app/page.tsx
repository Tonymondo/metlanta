'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import './landing.css'

/* ── Data ──────────────────────────────────────────────────────────────────── */

const EVENTS = [
  {
    name: 'Senior After Prom 2026',
    host: '@cre8tive.events',
    date: 'MAY 22',
    time: '10PM – 4AM',
    location: 'Atlanta, GA',
    type: 'After Prom',
    price: 'From $25',
    going: '1.2k going',
    hot: true,
    bg: 'linear-gradient(135deg, #200000 0%, #3d0808 40%, #100000 100%)',
  },
  {
    name: 'Sunday Kickback',
    host: '@jaxon.host',
    date: 'MAY 25',
    time: '4PM – 10PM',
    location: 'Decatur, GA',
    type: 'Kickback',
    price: 'Free',
    going: '340 going',
    hot: false,
    bg: 'linear-gradient(135deg, #050d05 0%, #0d1a0d 100%)',
  },
  {
    name: 'Buckhead Saturday',
    host: '@nightout_atl',
    date: 'MAY 24',
    time: '9PM – 3AM',
    location: 'Buckhead, GA',
    type: 'Day Party',
    price: 'From $20',
    going: '870 going',
    hot: true,
    bg: 'linear-gradient(135deg, #0a000a 0%, #1a0a1e 100%)',
  },
  {
    name: 'Junior Day Function',
    host: '@stonewall.juniors',
    date: 'MAY 17',
    time: '2PM – 8PM',
    location: 'Stone Mountain, GA',
    type: 'School Event',
    price: 'From $20',
    going: '580 going',
    hot: false,
    bg: 'linear-gradient(135deg, #070010 0%, #10001a 100%)',
  },
  {
    name: 'Summer Cookout Pop-Up',
    host: '@atl.good.times',
    date: 'JUN 7',
    time: '3PM – 9PM',
    location: 'East Atlanta, GA',
    type: 'Pop-Up',
    price: 'From $15',
    going: '720 going',
    hot: false,
    bg: 'linear-gradient(135deg, #100800 0%, #1e1000 100%)',
  },
  {
    name: 'The Golden Standard Func',
    host: '@az.events',
    date: 'JUN 14',
    time: '8PM – 2AM',
    location: 'Midtown, GA',
    type: 'Nightlife',
    price: 'From $35',
    going: '990 going',
    hot: true,
    bg: 'linear-gradient(135deg, #0d0a00 0%, #1a1400 100%)',
  },
]

const BENEFITS = [
  {
    title: 'Live in 5 minutes',
    body: 'Build your event page, set ticket tiers, and go live before you finish your lunch break.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E03030" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
      </svg>
    ),
  },
  {
    title: 'Stripe-powered payouts',
    body: 'Multiple ticket tiers. Real-time sales. Payout to your bank the same night your event drops.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E03030" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
      </svg>
    ),
  },
  {
    title: 'One link for everything',
    body: 'Share it in your bio, your story, the group chat. Track sales live. Guest list built-in.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E03030" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
      </svg>
    ),
  },
  {
    title: 'Build your rep',
    body: 'Every event adds to your host profile. Attendees rate the function. Your name grows.',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E03030" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
  },
]

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

const CARD_EVENTS = [
  {
    label: 'AFTER PROM', title: 'Senior After Prom 2026',
    date: 'MAY 22 · 10PM',
    bg: 'linear-gradient(160deg, #2d0808 0%, #0d0000 100%)',
  },
  {
    label: 'KICKBACK', title: 'Sunday Function ATL',
    date: 'MAY 25 · 4PM',
    bg: 'linear-gradient(160deg, #0d1a0d 0%, #030808 100%)',
  },
  {
    label: 'DAY PARTY', title: 'Buckhead Saturday',
    date: 'MAY 24 · 9PM',
    bg: 'linear-gradient(160deg, #1a0a1e 0%, #050008 100%)',
  },
  {
    label: 'NIGHTLIFE', title: 'The Golden Standard',
    date: 'JUN 14 · 8PM',
    bg: 'linear-gradient(160deg, #1a1400 0%, #060500 100%)',
  },
  {
    label: 'POP-UP', title: 'East ATL Cookout',
    date: 'JUN 7 · 3PM',
    bg: 'linear-gradient(160deg, #1e1000 0%, #070400 100%)',
  },
]

/* ── Scroll reveal hook ────────────────────────────────────────────────────── */
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

  return (
    <>
      <header className={`nav${scrolled ? ' scrolled' : ''}`}>
        <div className="nav-inner">
          <a href="/" className="nav-logo" aria-label="Metlanta">
            <div className="nav-logo-wrap">
              <Image
                src="/logo.png"
                alt="Metlanta logo mark"
                height={30}
                width={66}
                className="nav-logo-img"
                priority
              />
            </div>
            <span className="nav-wordmark">Metlanta</span>
          </a>

          <ul className="nav-links">
            {[
              { label: 'Events', href: '#events' },
              { label: 'Host', href: '#host' },
              { label: 'Pricing', href: '#pricing' },
            ].map((l) => (
              <li key={l.label}><a href={l.href}>{l.label}</a></li>
            ))}
          </ul>

          <div className="nav-actions">
            <a href="#login" className="nav-login">Log In</a>
            <a href="#host" className="btn-host">
              Start Hosting
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M5 12h14M12 5l7 7-7 7"/>
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
        {[
          { label: 'Events', href: '#events' },
          { label: 'Host', href: '#host' },
          { label: 'Pricing', href: '#pricing' },
        ].map((l) => (
          <a key={l.label} href={l.href} onClick={() => setOpen(false)}>{l.label}</a>
        ))}
        <div className="mobile-menu-ctas">
          <a href="#host" className="btn-primary" style={{ justifyContent: 'center' }} onClick={() => setOpen(false)}>
            Start Hosting Free
          </a>
          <a href="#login" className="btn-secondary" style={{ justifyContent: 'center' }} onClick={() => setOpen(false)}>
            Log In
          </a>
        </div>
      </div>
    </>
  )
}

/* ── Hero ──────────────────────────────────────────────────────────────────── */
function Hero() {
  return (
    <section className="hero">
      {/* Scattered 3D cards */}
      <div className="cards-stage" aria-hidden>
        {CARD_EVENTS.map((c, i) => (
          <div key={i} className={`photo-card card-${i + 1}`}>
            <div
              className="photo-card-inner"
              style={{ background: c.bg, width: '100%', height: '100%' }}
            >
              <span className="photo-card-badge">{c.label}</span>
              <p className="photo-card-title">{c.title}</p>
              <p className="photo-card-date">{c.date}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Copy */}
      <div className="hero-copy">
        <div className="hero-badge">
          <span className="hero-badge-dot" />
          Social Ticketing for the Party Generation
        </div>

        <h1 className="hero-title">
          <span className="u">Throw</span> parties near you<br />
          or <span className="u">host</span> them.
        </h1>

        <p className="hero-sub">
          After proms. Day parties. Kickbacks. School events. Create your event,
          sell tickets, and get paid — all in one link.
        </p>

        <div className="hero-pills">
          {['After Proms', 'Day Parties', 'Kickbacks', 'Functions', 'School Events', 'Nightlife'].map((t) => (
            <span key={t} className="hero-pill">{t}</span>
          ))}
        </div>

        <div className="hero-ctas">
          <a href="#host" className="btn-primary">
            Start Hosting Free
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </a>
          <a href="#events" className="btn-secondary">Explore Events</a>
        </div>

        <p className="hero-hint">Free to list · 5% on ticket sales only · No monthly fees</p>
      </div>
    </section>
  )
}

/* ── Events Section ────────────────────────────────────────────────────────── */
function EventsSection() {
  const [tab, setTab] = useState('Trending')

  return (
    <section className="events" id="events">
      <div className="wrap">
        <div className="events-header reveal">
          <div>
            <p className="section-label">Discover</p>
            <h2 className="section-title">Events near you</h2>
          </div>
          <a href="#events" className="section-link">View all events →</a>
        </div>

        <div className="events-tabs reveal delay-1">
          {['Trending', 'Soon', 'New'].map((t) => (
            <button
              key={t}
              className={`tab${tab === t ? ' active' : ''}`}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="events-grid">
          {EVENTS.map((e, i) => (
            <a key={e.name} href="#events" className={`event-card reveal delay-${Math.min(i + 1, 4)}`}>
              <div className="event-img">
                <div
                  className="event-img-bg"
                  style={{ background: e.bg }}
                />
                <div className="event-img-overlay" />
                {e.hot && (
                  <div className="event-img-badge">
                    <span className="badge-dot" />
                    Trending
                  </div>
                )}
                <div className="event-img-price">{e.price}</div>
              </div>

              <div className="event-body">
                <p className="event-name">{e.name}</p>
                <div className="event-meta">
                  <div className="event-meta-row">
                    <svg className="event-meta-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    {e.date} · {e.time}
                  </div>
                  <div className="event-meta-row">
                    <svg className="event-meta-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                    {e.location}
                  </div>
                </div>
                <div className="event-footer">
                  <div className="event-going">
                    <span className="event-going-dot" />
                    {e.going}
                  </div>
                  <span className="event-host">{e.host}</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── How It Works ──────────────────────────────────────────────────────────── */
function HowSection() {
  const steps = [
    {
      num: '01',
      title: 'Create your event',
      body: 'Name it, set a date, pick a venue. Add your flyer, age policy, and ticket tiers. Live in under 5 minutes.',
      tags: ['Event Page', 'Flyer Upload', 'Age Policy'],
    },
    {
      num: '02',
      title: 'Set your prices',
      body: 'Run early bird drops, general admission, VIP sections, and free RSVPs. You control tiers, caps, and deadlines.',
      tags: ['Early Bird', 'General', 'VIP', 'Free RSVP'],
    },
    {
      num: '03',
      title: 'Share and sell out',
      body: 'One link for everything. Share to IG, group chats, bio. Track sales live. Payout hits same night.',
      tags: ['Share Link', 'Live Dashboard', 'Same-Night Payout'],
    },
  ]

  return (
    <section className="how" id="how-it-works">
      <div className="wrap">
        <div className="how-header reveal">
          <p className="section-label">How It Works</p>
          <h2 className="section-title">
            From idea to sold out<br />
            <span className="gradient-text">in three steps.</span>
          </h2>
          <p className="how-sub">No experience needed. If you can share an Instagram story, you can run an event on Metlanta.</p>
        </div>

        <div className="how-grid">
          {steps.map((s, i) => (
            <div key={s.num} className={`how-card reveal delay-${i + 1}`}>
              <div className="how-num">{s.num}</div>
              <h3 className="how-title">{s.title}</h3>
              <p className="how-body">{s.body}</p>
              <div className="how-tags">
                {s.tags.map((t) => <span key={t} className="how-tag">{t}</span>)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── Host Section ──────────────────────────────────────────────────────────── */
function HostSection() {
  return (
    <section className="host" id="host">
      <div className="wrap">
        <div className="host-grid">
          {/* Copy */}
          <div className="host-copy">
            <div className="reveal">
              <p className="section-label">For Young Promoters</p>
              <h2 className="section-title">
                Go from throwing kickbacks<br />to running{' '}
                <span className="gradient-text">sold-out events.</span>
              </h2>
              <p>
                Whether it&apos;s your first after prom or your twentieth day party —
                Metlanta gives every young promoter the tools, audience, and reach to level up fast.
              </p>
            </div>

            <div className="host-benefits">
              {BENEFITS.map((b, i) => (
                <div key={b.title} className={`benefit reveal delay-${i + 1}`}>
                  <div className="benefit-icon">{b.icon}</div>
                  <div>
                    <p className="benefit-title">{b.title}</p>
                    <p className="benefit-body">{b.body}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="host-ctas reveal">
              <a href="#host" className="btn-primary">
                Start Hosting Free
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </a>
              <a href="#pricing" className="btn-secondary">See Pricing</a>
            </div>
          </div>

          {/* Dashboard mockup */}
          <div className="reveal delay-2" style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div className="dashboard">
              <div className="dash-toast">
                <div className="toast-dot" />
                <div>
                  <div className="toast-title">New ticket sold!</div>
                  <div className="toast-sub">VIP · @aaliyah.t · just now</div>
                </div>
              </div>

              <div className="dash-header">
                <div>
                  <div className="dash-label">Your Event Dashboard</div>
                  <div className="dash-event-name">Senior After Prom 2026</div>
                </div>
                <div className="live-pill">
                  <div className="live-dot" /> Live
                </div>
              </div>

              <div className="dash-stats">
                {[
                  { val: '412', lbl: 'Sold', delta: '+18 today' },
                  { val: '$7.2K', lbl: 'Revenue', delta: '+$310' },
                  { val: '82%', lbl: 'Capacity', delta: '500 cap' },
                ].map((s) => (
                  <div key={s.lbl} className="dash-stat">
                    <div className="dash-stat-val">{s.val}</div>
                    <div className="dash-stat-lbl">{s.lbl}</div>
                    <div className="dash-stat-delta">{s.delta}</div>
                  </div>
                ))}
              </div>

              <div className="dash-tier-label">Ticket Tiers</div>
              {[
                { name: 'Early Bird', sold: 150, cap: 150, price: '$25', color: '#22C55E' },
                { name: 'General',   sold: 230, cap: 300, price: '$40', color: '#E03030' },
                { name: 'VIP Table', sold: 32,  cap: 50,  price: '$100', color: '#A78BFA' },
              ].map((t) => (
                <div key={t.name} className="dash-tier">
                  <div className="dash-tier-row">
                    <span className="dash-tier-name">{t.name}</span>
                    <span className="dash-tier-info">{t.sold}/{t.cap} · {t.price}</span>
                  </div>
                  <div className="dash-bar-bg">
                    <div
                      className="dash-bar-fill"
                      style={{ width: `${(t.sold / t.cap) * 100}%`, background: t.color }}
                    />
                  </div>
                </div>
              ))}

              <div className="dash-actions">
                <button className="dash-btn" style={{ background: '#E03030', color: '#fff' }}>
                  Promote Event
                </button>
                <button className="dash-btn" style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}>
                  Guest List
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── Pricing ───────────────────────────────────────────────────────────────── */
function PricingSection() {
  return (
    <section className="pricing" id="pricing">
      <div className="wrap">
        <div className="pricing-header reveal">
          <p className="section-label">Pricing</p>
          <h2 className="section-title">Simple. No surprises.</h2>
          <p>Free to create. We only make money when you do.</p>
        </div>

        <div className="pricing-card reveal delay-1">
          <div className="pricing-top">
            <p className="section-label">All hosts</p>
            <div className="pricing-main">Free</div>
            <p className="pricing-sub">to create events and list on Metlanta</p>
            <div className="pricing-fee">
              <span className="pricing-fee-pct">5%</span>
              + payment processing on paid tickets only
            </div>
          </div>

          <div className="pricing-bottom">
            <p className="pricing-included">Everything included</p>
            <ul className="pricing-list">
              {PRICING_FEATURES.map((f) => (
                <li key={f}>
                  <svg className="check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            <a href="#host" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              Create Your First Event
            </a>
            <p style={{ textAlign: 'center', fontSize: '12px', color: 'rgba(255,255,255,0.22)', marginTop: '12px' }}>
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
    <section className="cta" id="download">
      <div className="wrap" style={{ position: 'relative', zIndex: 1 }}>
        <div className="reveal">
          <p className="section-label" style={{ marginBottom: '20px' }}>Ready to run your first function?</p>
          <h2 className="section-title" style={{ fontSize: 'clamp(36px,7vw,68px)' }}>
            Your first event<br />
            <span>starts tonight.</span>
          </h2>
          <p>
            No experience. No upfront cost. Just your idea, a date, and the drive
            to throw something people won&apos;t forget.
          </p>

          <div className="cta-buttons">
            <a href="#host" className="btn-primary cta-btn-lg">
              Create Your Event — It&apos;s Free
            </a>
            <a href="#events" className="btn-secondary cta-btn-lg">
              Explore Events
            </a>
          </div>
          <p className="cta-note">Free to list · 5% on ticket sales only · No monthly costs</p>

          <div className="cta-divider">
            <div className="cta-divider-line" />
            <span className="cta-divider-text">or</span>
            <div className="cta-divider-line" />
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
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              You&apos;re on the list — we&apos;ll hit you when we launch!
            </div>
          )}
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.22)', marginTop: '12px' }}>
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
                <Image
                  src="/logo.png"
                  alt="Metlanta"
                  height={26}
                  width={57}
                  className="footer-logo-img"
                />
              </div>
              <span className="footer-logo-text">Metlanta</span>
            </div>
            <p className="footer-tagline">
              The social ticketing platform for young promoters, DJs, and party hosts.
            </p>
            <div className="footer-socials">
              {[
                {
                  label: 'Instagram',
                  icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>,
                },
                {
                  label: 'TikTok',
                  icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.72a8.16 8.16 0 004.77 1.52V6.79a4.85 4.85 0 01-1.01-.1z"/></svg>,
                },
                {
                  label: 'X',
                  icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.213 5.567zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
                },
              ].map((s) => (
                <a key={s.label} href="#" className="social-btn" aria-label={s.label}>
                  {s.icon}
                </a>
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
      <HostSection />
      <PricingSection />
      <CTASection />
      <Footer />
    </main>
  )
}
