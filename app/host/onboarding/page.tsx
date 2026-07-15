'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'

/* ── Constants ───────────────────────────────────────────────────────────────── */

type HostType = 'event_host' | 'venue' | 'party_brand' | 'festival' | 'club_promoter' | 'artist_dj' | 'community'

const HOST_TYPES: { id: HostType; label: string; desc: string; icon: string }[] = [
  { id: 'event_host',    label: 'Event Host',           desc: 'You throw parties, concerts, and gatherings.',       icon: '🎪' },
  { id: 'venue',         label: 'Venue',                desc: 'You own or manage a space that hosts events.',       icon: '🏛️' },
  { id: 'party_brand',   label: 'Party Brand',          desc: 'Your brand runs recurring event experiences.',       icon: '🔥' },
  { id: 'festival',      label: 'Festival Organizer',   desc: 'Multi-stage, large-scale productions.',             icon: '🎡' },
  { id: 'club_promoter', label: 'Club Promoter',        desc: 'You drive traffic and fill rooms for venues.',      icon: '🎭' },
  { id: 'artist_dj',    label: 'Artist / DJ',           desc: 'You perform and want to sell tickets to shows.',    icon: '🎧' },
  { id: 'community',     label: 'Community Organizer',  desc: 'Free or low-cost events for your community.',      icon: '🌐' },
]

const EVENT_TYPES = ['kickback', 'day_party', 'nightlife', 'after_prom', 'pop_up', 'school_event', 'concert', 'festival']

/* ── Inner component (needs Suspense for searchParams) ───────────────────────── */

function HostOnboardingInner() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [step, setStep] = useState(1)
  const [animating, setAnimating] = useState(false)
  const [hostType, setHostType] = useState<HostType | null>(null)
  const [stripeStatus, setStripeStatus] = useState<'none' | 'pending' | 'active'>('none')
  const [stripeLoading, setStripeLoading] = useState(false)
  const [stripeError, setStripeError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [eventLoading, setEventLoading] = useState(false)
  const [createdEventId, setCreatedEventId] = useState<string | null>(null)
  const [eventFlyer, setEventFlyer] = useState<File | null>(null)
  const [eventFlyerPreview, setEventFlyerPreview] = useState<string>('')
  const [stripeNeedsSignup, setStripeNeedsSignup] = useState(false)

  const [biz, setBiz] = useState({
    brand_name: '', instagram: '', tiktok: '', website: '',
    city: '', state: '', phone: '', email: '', bio: '',
  })
  const [ev, setEv] = useState({
    title: '', date: '', time: '', location: '', city: '', description: '',
    event_type: '', age_policy: '', dress_code: '', capacity: '200',
    tiers: [{ name: 'General', price: '' }, { name: 'VIP', price: '' }],
  })

  // Pre-fill email
  useEffect(() => {
    if (session?.user?.email) setBiz(f => ({ ...f, email: session.user!.email! }))
  }, [session?.user?.email])

  // Check Stripe return
  useEffect(() => {
    const stripeParam = searchParams.get('stripe')
    if (stripeParam === 'success') { setStripeStatus('active'); goTo(4) }
  }, [])

  // Check existing Stripe status
  useEffect(() => {
    if (status !== 'authenticated') return
    fetch('/api/stripe-connect').then(r => r.json()).then(d => {
      if (d.connected) setStripeStatus('active')
      else if (d.status === 'pending') setStripeStatus('pending')
    }).catch(() => {})
  }, [status])

  // Redirect if not authed
  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login?callbackUrl=/host/onboarding')
  }, [status])

  function goTo(n: number) {
    setAnimating(true)
    setTimeout(() => { setStep(n); setAnimating(false) }, 200)
  }

  async function saveProfile() {
    setSaving(true)
    await fetch('/api/host/setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ host_type: hostType, ...biz }),
    })
    await update()
    setSaving(false)
  }

  async function connectStripe() {
    setStripeLoading(true)
    setStripeError(null)
    setStripeNeedsSignup(false)
    try {
      const res = await fetch('/api/stripe-connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ return_url: '/host/onboarding?stripe=success', refresh_url: '/host/onboarding?stripe=refresh' }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
        return // don't setLoading false — page is navigating away
      }
      setStripeNeedsSignup(data.needs_connect_signup ?? false)
      setStripeError(data.error ?? 'Something went wrong. Please try again.')
    } catch {
      setStripeError('Network error. Check your connection and try again.')
    }
    setStripeLoading(false)
  }

  async function createEvent() {
    if (!ev.title || !ev.date || !ev.location) return
    setEventLoading(true)
    try {
      let flyerUrl = ''
      if (eventFlyer) {
        try {
          const fd = new FormData()
          fd.append('file', eventFlyer)
          fd.append('bucket', 'event-flyers')
          fd.append('ref_id', `onboarding-${Date.now()}`)
          const uploadRes = await fetch('/api/upload', { method: 'POST', body: fd })
          const uploadData = await uploadRes.json()
          if (uploadData.url) flyerUrl = uploadData.url
        } catch { /* non-fatal */ }
      }
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title:       ev.title,
          date:        ev.date,
          time:        ev.time,
          location:    ev.location,
          city:        ev.city || biz.city || 'Atlanta',
          description: ev.description,
          event_type:  ev.event_type,
          age_policy:  ev.age_policy,
          dress_code:  ev.dress_code,
          capacity:    Number(ev.capacity) || 200,
          flyer_url:   flyerUrl || undefined,
          tiers: ev.tiers.filter(t => t.name).map(t => ({ name: t.name, price: Number(t.price) || 0 })),
        }),
      })
      const data = await res.json()
      if (data.id) setCreatedEventId(data.id)
    } catch { /* ignore */ }
    setEventLoading(false)
    goTo(5)
  }

  if (status === 'loading') {
    return (
      <div className="ho-loading">
        <div className="ho-load-spinner" />
      </div>
    )
  }

  const STEPS = [
    { n: 1, label: 'Host Type' },
    { n: 2, label: 'Business' },
    { n: 3, label: 'Payouts' },
    { n: 4, label: 'First Event' },
    { n: 5, label: 'Launch' },
  ]

  return (
    <div className="ho-page">

      {/* ── Top bar ──────────────────────────────────────────────────────────── */}
      <header className="ho-header">
        <a href="/" className="ho-brand">
          <img src="/metlantalogo.png" alt="Metlanta" className="ho-brand-img" />
        </a>

        <div className="ho-stepper">
          {STEPS.map((s, i) => (
            <div key={s.n} className="ho-stepper-item">
              <div className={`ho-step-dot${step > s.n ? ' done' : ''}${step === s.n ? ' active' : ''}`}>
                {step > s.n
                  ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  : s.n
                }
              </div>
              <span className={`ho-step-label${step === s.n ? ' active' : ''}`}>{s.label}</span>
              {i < STEPS.length - 1 && <div className={`ho-step-line${step > s.n ? ' done' : ''}`} />}
            </div>
          ))}
        </div>

        <a href="/dashboard" className="ho-exit">Exit</a>
      </header>

      {/* ── Main ─────────────────────────────────────────────────────────────── */}
      <main className={`ho-main${animating ? ' ho-fading' : ''}`}>

        {/* ─── Step 1: Host Type ─────────────────────────────────────────────── */}
        {step === 1 && (
          <div className="ho-panel">
            <div className="ho-panel-hd">
              <span className="ho-eyebrow">Step 1 of 5</span>
              <h1 className="ho-title">What kind of<br />host are you?</h1>
              <p className="ho-sub">This shapes your dashboard, tools, and recommendations.</p>
            </div>
            <div className="ho-type-grid">
              {HOST_TYPES.map(t => (
                <button
                  key={t.id}
                  type="button"
                  className={`ho-type-card${hostType === t.id ? ' selected' : ''}`}
                  onClick={() => { setHostType(t.id); setTimeout(() => goTo(2), 240) }}
                >
                  <span className="ho-type-icon">{t.icon}</span>
                  <span className="ho-type-label">{t.label}</span>
                  <span className="ho-type-desc">{t.desc}</span>
                  <div className="ho-type-select-ring" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ─── Step 2: Business Setup ────────────────────────────────────────── */}
        {step === 2 && (
          <div className="ho-panel">
            <div className="ho-panel-hd">
              <span className="ho-eyebrow">Step 2 of 5</span>
              <h1 className="ho-title">Set up your<br />brand.</h1>
              <p className="ho-sub">How Atlanta and beyond will find you.</p>
            </div>
            <form
              className="ho-form"
              onSubmit={async e => { e.preventDefault(); await saveProfile(); goTo(3) }}
            >
              <div className="ho-form-grid">
                <div className="ho-field full">
                  <label>Brand / Stage Name *</label>
                  <input
                    value={biz.brand_name}
                    onChange={e => setBiz({ ...biz, brand_name: e.target.value })}
                    placeholder="Your name or brand"
                    required
                  />
                </div>
                <div className="ho-field">
                  <label>City *</label>
                  <input value={biz.city} onChange={e => setBiz({ ...biz, city: e.target.value })} placeholder="Atlanta" required />
                </div>
                <div className="ho-field">
                  <label>State *</label>
                  <input value={biz.state} onChange={e => setBiz({ ...biz, state: e.target.value })} placeholder="GA" maxLength={2} required style={{ textTransform: 'uppercase' }} />
                </div>
                <div className="ho-field">
                  <label>Instagram</label>
                  <div className="ho-prefix-wrap">
                    <span className="ho-prefix">@</span>
                    <input value={biz.instagram} onChange={e => setBiz({ ...biz, instagram: e.target.value })} placeholder="yourhandle" />
                  </div>
                </div>
                <div className="ho-field">
                  <label>TikTok</label>
                  <div className="ho-prefix-wrap">
                    <span className="ho-prefix">@</span>
                    <input value={biz.tiktok} onChange={e => setBiz({ ...biz, tiktok: e.target.value })} placeholder="yourtiktok" />
                  </div>
                </div>
                <div className="ho-field">
                  <label>Website</label>
                  <input value={biz.website} onChange={e => setBiz({ ...biz, website: e.target.value })} placeholder="https://yoursite.com" type="url" />
                </div>
                <div className="ho-field">
                  <label>Phone</label>
                  <input value={biz.phone} onChange={e => setBiz({ ...biz, phone: e.target.value })} placeholder="+1 (404) 000-0000" type="tel" />
                </div>
                <div className="ho-field">
                  <label>Business Email</label>
                  <input value={biz.email} onChange={e => setBiz({ ...biz, email: e.target.value })} placeholder="you@domain.com" type="email" />
                </div>
                <div className="ho-field full">
                  <label>About You / Bio</label>
                  <textarea
                    value={biz.bio}
                    onChange={e => setBiz({ ...biz, bio: e.target.value })}
                    placeholder="Tell people who you are and what kind of events you throw…"
                    rows={3}
                    maxLength={300}
                  />
                </div>
              </div>
              <div className="ho-actions">
                <button type="button" className="ho-back" onClick={() => goTo(1)}>← Back</button>
                <button type="submit" className="ho-next" disabled={saving}>
                  {saving ? <span className="btn-spinner" /> : 'Continue →'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ─── Step 3: Stripe Connect ────────────────────────────────────────── */}
        {step === 3 && (
          <div className="ho-panel">
            <div className="ho-panel-hd">
              <span className="ho-eyebrow">Step 3 of 5</span>
              <h1 className="ho-title">Connect your<br />payouts.</h1>
              <p className="ho-sub">Get paid directly to your bank after every sold-out event.</p>
            </div>

            <div className="ho-stripe-card">
              {stripeStatus === 'active' ? (
                <div className="ho-stripe-connected">
                  <div className="ho-stripe-check-circle">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <div>
                    <p className="ho-stripe-title">Stripe Connected</p>
                    <p className="ho-stripe-sub">Your bank account is verified. Payouts are enabled.</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="ho-stripe-top">
                    <div className="ho-stripe-icon-wrap">
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                    </div>
                    <div>
                      <p className="ho-stripe-title">Connect Stripe Account</p>
                      <p className="ho-stripe-sub">Takes ~3 min. You&apos;ll need your bank info and SSN (last 4).</p>
                    </div>
                  </div>

                  <div className="ho-stripe-features">
                    {[
                      'Instant bank verification',
                      'Payouts in 1–2 business days',
                      'Automatic 1099-K tax forms',
                      'Stripe buyer protection',
                      'Real-time payout tracking',
                    ].map(f => (
                      <div key={f} className="ho-stripe-feat">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        {f}
                      </div>
                    ))}
                  </div>

                  <button className="ho-stripe-btn" onClick={connectStripe} disabled={stripeLoading}>
                    {stripeLoading
                      ? <span className="btn-spinner" />
                      : <>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                          Connect Stripe — Free
                        </>
                    }
                  </button>

                  {stripeError && (
                    <div style={{ fontSize: 13, color: '#ef4444', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '12px 16px' }}>
                      {stripeNeedsSignup ? (
                        <span>
                          Stripe Connect isn&apos;t enabled on your account.{' '}
                          <a href="https://dashboard.stripe.com/connect" target="_blank" rel="noreferrer" style={{ color: '#ef4444', textDecoration: 'underline', fontWeight: 700 }}>
                            Activate it here →
                          </a>
                          {' '}(takes ~2 min), then come back and try again.
                        </span>
                      ) : stripeError}
                    </div>
                  )}

                  <p className="ho-stripe-note">Secure payments powered by Stripe. Free to get started.</p>
                </>
              )}
            </div>

            <div className="ho-actions">
              <button type="button" className="ho-back" onClick={() => goTo(2)}>← Back</button>
              <button type="button" className="ho-next" onClick={() => goTo(4)}>
                {stripeStatus === 'active' ? 'Continue →' : 'Skip for now →'}
              </button>
            </div>
          </div>
        )}

        {/* ─── Step 4: Create First Event ────────────────────────────────────── */}
        {step === 4 && (
          <div className="ho-panel">
            <div className="ho-panel-hd">
              <span className="ho-eyebrow">Step 4 of 5</span>
              <h1 className="ho-title">Create your<br />first event.</h1>
              <p className="ho-sub">You can always edit, duplicate, or create more from your dashboard.</p>
            </div>

            <form className="ho-form" onSubmit={e => { e.preventDefault(); createEvent() }}>
              <div className="ho-form-grid">
                <div className="ho-field full">
                  <label>Event Title *</label>
                  <input
                    value={ev.title}
                    onChange={e => setEv({ ...ev, title: e.target.value })}
                    placeholder="Summer Rooftop Party 2026"
                    required
                  />
                </div>
                <div className="ho-field">
                  <label>Date *</label>
                  <input type="date" value={ev.date} onChange={e => setEv({ ...ev, date: e.target.value })} required />
                </div>
                <div className="ho-field">
                  <label>Start Time</label>
                  <input value={ev.time} onChange={e => setEv({ ...ev, time: e.target.value })} placeholder="9PM" />
                </div>
                <div className="ho-field full">
                  <label>Venue / Location *</label>
                  <input value={ev.location} onChange={e => setEv({ ...ev, location: e.target.value })} placeholder="Venue name or full address" required />
                </div>
                <div className="ho-field">
                  <label>City</label>
                  <input value={ev.city} onChange={e => setEv({ ...ev, city: e.target.value })} placeholder={biz.city || 'Atlanta'} />
                </div>
                <div className="ho-field">
                  <label>Capacity</label>
                  <input type="number" min="1" value={ev.capacity} onChange={e => setEv({ ...ev, capacity: e.target.value })} placeholder="200" />
                </div>
                <div className="ho-field">
                  <label>Event Type</label>
                  <select value={ev.event_type} onChange={e => setEv({ ...ev, event_type: e.target.value })}>
                    <option value="">Select type</option>
                    {EVENT_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                  </select>
                </div>
                <div className="ho-field">
                  <label>Age Policy</label>
                  <input value={ev.age_policy} onChange={e => setEv({ ...ev, age_policy: e.target.value })} placeholder="18+ with ID" />
                </div>
                <div className="ho-field">
                  <label>Dress Code</label>
                  <input value={ev.dress_code} onChange={e => setEv({ ...ev, dress_code: e.target.value })} placeholder="All Black, Casual…" />
                </div>
                <div className="ho-field full">
                  <label>Description</label>
                  <textarea
                    value={ev.description}
                    onChange={e => setEv({ ...ev, description: e.target.value })}
                    placeholder="What should people expect? Lineup, vibe, dress code…"
                    rows={3}
                  />
                </div>
              </div>

              <div className="ho-form-grid" style={{ marginBottom: 0 }}>
                <div className="ho-field full">
                  <label>Event Flyer / Cover Image</label>
                  <label className={`ho-img-upload${eventFlyerPreview ? ' has-preview' : ''}`}>
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      setEventFlyer(file)
                      setEventFlyerPreview(URL.createObjectURL(file))
                    }} />
                    {eventFlyerPreview
                      ? <img src={eventFlyerPreview} alt="Preview" className="ho-img-preview" />
                      : <div className="ho-img-placeholder">
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                          <span>Upload event flyer</span>
                          <span style={{ fontSize: 11, color: 'var(--gray3)' }}>JPG, PNG up to 5MB</span>
                        </div>
                    }
                  </label>
                </div>
              </div>

              <div className="ho-tiers-section">
                <p className="ho-tiers-label">Ticket Tiers <span className="ho-tiers-note">Set price to $0 for free RSVP</span></p>
                <div className="ho-tiers-list">
                  {ev.tiers.map((tier, i) => (
                    <div key={i} className="ho-tier-row">
                      <input
                        className="ho-tier-name"
                        value={tier.name}
                        onChange={e => {
                          const t = [...ev.tiers]; t[i] = { ...t[i], name: e.target.value }
                          setEv({ ...ev, tiers: t })
                        }}
                        placeholder={i === 0 ? 'General' : 'VIP'}
                      />
                      <div className="ho-tier-price-wrap">
                        <span className="ho-prefix">$</span>
                        <input
                          className="ho-tier-price"
                          type="number" min="0" step="0.01"
                          value={tier.price}
                          onChange={e => {
                            const t = [...ev.tiers]; t[i] = { ...t[i], price: e.target.value }
                            setEv({ ...ev, tiers: t })
                          }}
                          placeholder="0"
                        />
                      </div>
                      {ev.tiers.length > 1 && (
                        <button
                          type="button"
                          className="ho-tier-remove"
                          onClick={() => setEv({ ...ev, tiers: ev.tiers.filter((_, j) => j !== i) })}
                        >×</button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  className="ho-add-tier"
                  onClick={() => setEv({ ...ev, tiers: [...ev.tiers, { name: '', price: '' }] })}
                >
                  + Add Tier
                </button>
              </div>

              <div className="ho-actions">
                <button type="button" className="ho-back" onClick={() => goTo(3)}>← Back</button>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="button" className="ho-skip" onClick={() => goTo(5)}>Skip →</button>
                  <button type="submit" className="ho-next" disabled={eventLoading || !ev.title || !ev.date || !ev.location}>
                    {eventLoading ? <span className="btn-spinner" /> : 'Create & Continue →'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* ─── Step 5: Launch ────────────────────────────────────────────────── */}
        {step === 5 && (
          <div className="ho-panel ho-launch-panel">
            <div className="ho-launch-rocket">🚀</div>
            <h1 className="ho-launch-title">You&apos;re live.</h1>
            <p className="ho-launch-sub">Your host profile is active. Time to sell out.</p>

            <div className="ho-launch-checklist">
              {[
                { done: true,                    label: 'Host profile created' },
                { done: !!biz.brand_name,        label: 'Brand set up' },
                { done: stripeStatus === 'active', label: 'Stripe connected for payouts' },
                { done: !!createdEventId,        label: 'First event created' },
              ].map(item => (
                <div key={item.label} className={`ho-check-row${item.done ? ' done' : ''}`}>
                  <div className="ho-check-icon">
                    {item.done
                      ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/></svg>
                    }
                  </div>
                  <span>{item.label}</span>
                  {!item.done && item.label === 'Stripe connected for payouts' && (
                    <button type="button" className="ho-fix-btn" onClick={() => goTo(3)}>Fix →</button>
                  )}
                </div>
              ))}
            </div>

            <div className="ho-launch-actions">
              <a href="/dashboard/events" className="ho-launch-cta primary">Create Event</a>
              <a href="/dashboard" className="ho-launch-cta secondary">Open Dashboard</a>
              {createdEventId && (
                <a href={`/events/${createdEventId}`} className="ho-launch-cta ghost">
                  View Your Event →
                </a>
              )}
            </div>
          </div>
        )}

      </main>
    </div>
  )
}

/* ── Export ──────────────────────────────────────────────────────────────────── */

export default function HostOnboarding() {
  return (
    <Suspense fallback={<div className="ho-loading"><div className="ho-load-spinner" /></div>}>
      <HostOnboardingInner />
    </Suspense>
  )
}
