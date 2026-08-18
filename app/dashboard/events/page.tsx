'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import type { DbEvent } from '@/lib/supabase'

type View = 'list' | 'create'

const STEPS = [
  { n: 1, label: 'Basics' },
  { n: 2, label: 'Media' },
  { n: 3, label: 'Theme' },
  { n: 4, label: 'When & Where' },
  { n: 5, label: 'Tickets' },
  { n: 6, label: 'Review' },
]

const EVENT_TYPES = [
  { value: 'kickback',    label: 'Kickback' },
  { value: 'day_party',  label: 'Day Party' },
  { value: 'nightlife',  label: 'Nightlife' },
  { value: 'after_prom', label: 'After Prom' },
  { value: 'pop_up',     label: 'Pop-Up' },
  { value: 'school_event', label: 'School Event' },
  { value: 'concert',    label: 'Concert' },
  { value: 'festival',   label: 'Festival' },
]

function StepDot({ n, current }: { n: number; current: number }) {
  const done = current > n
  const active = current === n
  return (
    <div style={{
      width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 13, fontWeight: 700,
      background: done ? 'var(--green)' : active ? 'var(--red)' : 'rgba(255,255,255,0.06)',
      border: done ? '2px solid var(--green)' : active ? '2px solid var(--red)' : '2px solid rgba(255,255,255,0.12)',
      color: (done || active) ? '#fff' : 'rgba(255,255,255,0.3)',
      transition: 'all 0.25s',
    }}>
      {done
        ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        : n
      }
    </div>
  )
}

function EventPreviewCard({ title, description, flyerPreview, date, location, tiers }: {
  title: string; description: string; flyerPreview: string
  date: string; location: string; tiers: { name: string; price: string }[]
}) {
  const lowestPrice = tiers.filter(t => t.name).reduce<number | null>((min, t) => {
    const p = Number(t.price) || 0
    return min === null || p < min ? p : min
  }, null)

  const dateStr = date
    ? new Date(date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : null

  return (
    <div style={{ background: '#111', borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
      {/* Flyer */}
      <div style={{ height: 200, background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
        {flyerPreview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={flyerPreview} alt="Flyer" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.18)' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
            </svg>
            <span style={{ fontSize: 12 }}>Flyer preview</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '16px 18px' }}>
        <p style={{
          fontWeight: 800, fontSize: 16, letterSpacing: '-0.01em', lineHeight: 1.3,
          color: title ? '#fff' : 'rgba(255,255,255,0.2)', marginBottom: 6,
        }}>
          {title || 'Your event name'}
        </p>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginBottom: 10, lineHeight: 1.5 }}>
          {description ? description.slice(0, 60) + (description.length > 60 ? '…' : '') : 'Live preview of your event card'}
        </p>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {dateStr && (
            <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.45)', background: 'rgba(255,255,255,0.06)', padding: '3px 8px', borderRadius: 6 }}>
              {dateStr}
            </span>
          )}
          {location && (
            <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.45)', background: 'rgba(255,255,255,0.06)', padding: '3px 8px', borderRadius: 6 }}>
              {location.slice(0, 20)}
            </span>
          )}
          {lowestPrice !== null && (
            <span style={{ fontSize: 11, fontWeight: 700, color: '#fff', background: 'var(--red)', padding: '3px 8px', borderRadius: 6 }}>
              {lowestPrice === 0 ? 'Free' : `$${lowestPrice}+`}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default function EventsPage() {
  const { data: session } = useSession()
  const [view, setView] = useState<View>('list')
  const [step, setStep] = useState(1)
  const [animating, setAnimating] = useState(false)
  const [events, setEvents] = useState<DbEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [createLoading, setCreateLoading] = useState(false)
  const [createDone, setCreateDone] = useState(false)
  const [createError, setCreateError] = useState('')
  const [stripeConnected, setStripeConnected] = useState<boolean | null>(null)

  const [form, setForm] = useState({
    title: '',
    description: '',
    flyer: null as File | null,
    flyerPreview: '',
    event_type: '',
    age_policy: '',
    dress_code: '',
    date: '',
    time: '',
    end_time: '',
    location: '',
    city: 'Atlanta',
    capacity: '',
    tiers: [{ name: 'General', price: '' }, { name: 'VIP', price: '' }],
  })

  const loadEvents = useCallback(async () => {
    setLoading(true)
    const r = await fetch('/api/dashboard/events')
    if (r.ok) setEvents((await r.json()).events ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    loadEvents()
    fetch('/api/stripe-connect').then(r => r.ok ? r.json() : null).then(d => {
      if (d) setStripeConnected(d.connected ?? false)
    })
  }, [loadEvents])

  function goTo(n: number) {
    setAnimating(true)
    setTimeout(() => { setStep(n); setAnimating(false) }, 150)
  }

  function canNext() {
    if (step === 1) return form.title.trim().length > 0
    if (step === 4) return form.date.trim().length > 0 && form.location.trim().length > 0
    return true
  }

  async function handleCreate() {
    setCreateLoading(true)
    setCreateError('')
    try {
      let flyerUrl = ''
      if (form.flyer) {
        const fd = new FormData()
        fd.append('file', form.flyer)
        fd.append('bucket', 'event-flyers')
        fd.append('ref_id', `dashboard-${Date.now()}`)
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: fd })
        const uploadData = await uploadRes.json()
        if (uploadData.url) flyerUrl = uploadData.url
      }

      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          event_type: form.event_type || undefined,
          age_policy: form.age_policy || undefined,
          dress_code: form.dress_code || undefined,
          date: form.date,
          time: form.time || undefined,
          end_time: form.end_time || undefined,
          location: form.location,
          city: form.city || 'Atlanta',
          capacity: Number(form.capacity) || 200,
          flyer_url: flyerUrl || undefined,
          tiers: form.tiers.filter(t => t.name.trim()).map(t => ({
            name: t.name.trim(),
            price: Number(t.price) || 0,
          })),
        }),
      })
      const data = await res.json()
      if (!res.ok) { setCreateError(data.error ?? 'Failed to create event'); return }
      setCreateDone(true)
      await loadEvents()
      setTimeout(() => { setCreateDone(false); setView('list'); setStep(1) }, 1800)
    } catch {
      setCreateError('Something went wrong. Please try again.')
    } finally {
      setCreateLoading(false)
    }
  }

  function resetCreate() {
    setView('list')
    setStep(1)
    setCreateError('')
    setCreateDone(false)
    setForm({
      title: '', description: '', flyer: null, flyerPreview: '',
      event_type: '', age_policy: '', dress_code: '',
      date: '', time: '', end_time: '', location: '', city: 'Atlanta', capacity: '',
      tiers: [{ name: 'General', price: '' }, { name: 'VIP', price: '' }],
    })
  }

  /* ── LIST VIEW ──────────────────────────────────────────────────────────── */
  if (view === 'list') {
    return (
      <>
        {stripeConnected === false && (
          <div className="mpd-banner">
            <div>
              <p className="mpd-banner-title">Complete your Stripe setup</p>
              <p className="mpd-banner-sub">Connect Stripe to start accepting payments for your events.</p>
            </div>
            <a href="/dashboard/settings" className="mpd-banner-btn">Set up Stripe</a>
          </div>
        )}

        <div className="mpd-breadcrumb">
          <a href="/dashboard">Dashboard</a>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          <span>Events</span>
        </div>

        <div className="mpd-page-row">
          <span />
          <button className="mpd-primary-btn" onClick={() => setView('create')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Create Event
          </button>
        </div>

        {loading ? (
          <div className="mpd-spinner-wrap"><div className="dash-spinner" /></div>
        ) : events.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.25)' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 16 }}>
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
            <p style={{ fontSize: 15, fontWeight: 700, color: 'rgba(255,255,255,0.3)', marginBottom: 6 }}>No events yet</p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.18)' }}>Create your first event to start selling tickets.</p>
          </div>
        ) : (
          <div className="mpd-events-list">
            {events.map(ev => {
              const tiers = ev.ticket_tiers ?? []
              const sold = tiers.reduce((s, t) => s + t.sold_count, 0)
              const cap = tiers.reduce((s, t) => s + (t.capacity ?? 0), 0)
              const pct = cap > 0 ? Math.min((sold / cap) * 100, 100) : 0
              const dateStr = new Date(ev.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              return (
                <div key={ev.id} className="mpd-event-row">
                  <div className="mpd-event-row-main">
                    <div className="mpd-event-row-left">
                      <span className={`mpd-status-dot ${ev.status}`} />
                      <div>
                        <p className="mpd-event-row-title">{ev.title}</p>
                        <p className="mpd-event-row-meta">{dateStr} · {ev.location}</p>
                      </div>
                    </div>
                    <div className="mpd-event-row-right">
                      <span className="mpd-event-row-sold">{sold} sold</span>
                      <a href={`/events/${ev.id}`} className="mpd-ghost-btn">View</a>
                    </div>
                  </div>
                  {cap > 0 && (
                    <div className="mpd-tier-bar">
                      <div className="mpd-tier-fill" style={{ width: `${pct}%` }} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </>
    )
  }

  /* ── CREATE WIZARD ──────────────────────────────────────────────────────── */
  return (
    <div style={{ maxWidth: 1100 }}>
      {/* Breadcrumb */}
      <div className="mpd-breadcrumb">
        <a href="/dashboard">Dashboard</a>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        <button onClick={resetCreate} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font)', padding: 0 }}>
          Events
        </button>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        <span>Create</span>
      </div>

      <h2 className="mpd-page-title" style={{ marginBottom: 4 }}>New Event</h2>
      <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', marginBottom: 28 }}>Set up your event in a few quick steps.</p>

      {/* Step Progress */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 0,
        background: '#161616', border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 12, padding: '16px 20px', marginBottom: 28, overflowX: 'auto',
      }}>
        {STEPS.map((s, i) => (
          <div key={s.n} style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: step > s.n ? 'pointer' : 'default' }}
              onClick={() => step > s.n ? goTo(s.n) : undefined}>
              <StepDot n={s.n} current={step} />
              <span style={{
                fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap',
                color: step === s.n ? '#fff' : step > s.n ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.25)',
                transition: 'color 0.2s',
              }}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{
                height: 1, width: 48, flexShrink: 0, margin: '0 8px', marginBottom: 20,
                background: step > s.n ? 'var(--green)' : 'rgba(255,255,255,0.1)',
                transition: 'background 0.3s',
              }} />
            )}
          </div>
        ))}
      </div>

      {/* Two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>

        {/* LEFT: Form */}
        <div className="mpd-card" style={{ opacity: animating ? 0 : 1, transition: 'opacity 0.15s' }}>

          {/* ── Step 1: Basics ─────────────────────────────────────────────── */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="mpd-field">
                <label>Event name *</label>
                <input
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="Summer Rooftop Party"
                  autoFocus
                  style={{ fontSize: 15 }}
                />
              </div>
              <div className="mpd-field">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <label style={{ marginBottom: 0 }}>Description</label>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>{form.description.length} characters</span>
                </div>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Tell people what to expect…"
                  rows={6}
                  maxLength={1000}
                />
              </div>
            </div>
          )}

          {/* ── Step 2: Media ──────────────────────────────────────────────── */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Event Flyer / Cover Image</p>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', marginBottom: 16 }}>Upload the flyer or graphic that represents your event. JPG, PNG up to 5MB.</p>
                <label style={{
                  display: 'block', border: '2px dashed rgba(255,255,255,0.12)', borderRadius: 12,
                  overflow: 'hidden', cursor: 'pointer', transition: 'border-color 0.2s',
                }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)')}>
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    setForm({ ...form, flyer: file, flyerPreview: URL.createObjectURL(file) })
                  }} />
                  {form.flyerPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={form.flyerPreview} alt="Preview" style={{ width: '100%', maxHeight: 340, objectFit: 'cover', display: 'block' }} />
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '48px 24px', color: 'rgba(255,255,255,0.25)' }}>
                      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                      </svg>
                      <p style={{ fontSize: 14, fontWeight: 600 }}>Click to upload flyer</p>
                      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.18)' }}>JPG, PNG up to 5MB</p>
                    </div>
                  )}
                </label>
                {form.flyerPreview && (
                  <button
                    onClick={() => setForm({ ...form, flyer: null, flyerPreview: '' })}
                    style={{ marginTop: 10, fontSize: 12, color: 'rgba(255,255,255,0.35)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font)' }}>
                    Remove image
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ── Step 3: Theme ──────────────────────────────────────────────── */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="mpd-field">
                <label>Event Type</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 4 }}>
                  {EVENT_TYPES.map(t => (
                    <button key={t.value} type="button"
                      onClick={() => setForm({ ...form, event_type: form.event_type === t.value ? '' : t.value })}
                      style={{
                        padding: '10px 14px', borderRadius: 9, fontSize: 13, fontWeight: 600, fontFamily: 'var(--font)',
                        cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left',
                        background: form.event_type === t.value ? 'rgba(224,48,48,0.1)' : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${form.event_type === t.value ? 'var(--red)' : 'rgba(255,255,255,0.08)'}`,
                        color: form.event_type === t.value ? 'var(--red)' : 'rgba(255,255,255,0.6)',
                      }}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mpd-field">
                <label>Age Policy</label>
                <input
                  value={form.age_policy}
                  onChange={e => setForm({ ...form, age_policy: e.target.value })}
                  placeholder="18+ with valid ID, All Ages…"
                />
              </div>
              <div className="mpd-field">
                <label>Dress Code</label>
                <input
                  value={form.dress_code}
                  onChange={e => setForm({ ...form, dress_code: e.target.value })}
                  placeholder="All Black, Casual, Dressy Casual…"
                />
              </div>
            </div>
          )}

          {/* ── Step 4: When & Where ───────────────────────────────────────── */}
          {step === 4 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="mpd-field" style={{ gridColumn: '1 / -1' }}>
                <label>Venue / Location *</label>
                <input
                  value={form.location}
                  onChange={e => setForm({ ...form, location: e.target.value })}
                  placeholder="Venue name or full address"
                />
              </div>
              <div className="mpd-field">
                <label>City</label>
                <input
                  value={form.city}
                  onChange={e => setForm({ ...form, city: e.target.value })}
                  placeholder="Atlanta"
                />
              </div>
              <div className="mpd-field">
                <label>Capacity</label>
                <input
                  type="number" min="1"
                  value={form.capacity}
                  onChange={e => setForm({ ...form, capacity: e.target.value })}
                  placeholder="200"
                />
              </div>
              <div className="mpd-field">
                <label>Date *</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={e => setForm({ ...form, date: e.target.value })}
                />
              </div>
              <div className="mpd-field">
                <label>Start Time</label>
                <input
                  value={form.time}
                  onChange={e => setForm({ ...form, time: e.target.value })}
                  placeholder="9PM"
                />
              </div>
              <div className="mpd-field">
                <label>End Time</label>
                <input
                  value={form.end_time}
                  onChange={e => setForm({ ...form, end_time: e.target.value })}
                  placeholder="3AM"
                />
              </div>
            </div>
          )}

          {/* ── Step 5: Tickets ────────────────────────────────────────────── */}
          {step === 5 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Ticket Tiers</p>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', marginBottom: 16 }}>Set price to $0 for free RSVP. Platform fee: 22% per paid ticket (15% on $100+).</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {form.tiers.map((tier, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <div className="mpd-field" style={{ flex: 2, gap: 0 }}>
                        {i === 0 && <label style={{ marginBottom: 6 }}>Tier Name</label>}
                        <input
                          value={tier.name}
                          onChange={e => {
                            const t = [...form.tiers]; t[i] = { ...t[i], name: e.target.value }
                            setForm({ ...form, tiers: t })
                          }}
                          placeholder={i === 0 ? 'General' : i === 1 ? 'VIP' : 'Tier name'}
                        />
                      </div>
                      <div className="mpd-field" style={{ flex: 1, gap: 0 }}>
                        {i === 0 && <label style={{ marginBottom: 6 }}>Price ($)</label>}
                        <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 8, overflow: 'hidden' }}>
                          <span style={{ padding: '0 10px', color: 'rgba(255,255,255,0.3)', fontSize: 13, flexShrink: 0 }}>$</span>
                          <input
                            type="number" min="0" step="0.01"
                            value={tier.price}
                            onChange={e => {
                              const t = [...form.tiers]; t[i] = { ...t[i], price: e.target.value }
                              setForm({ ...form, tiers: t })
                            }}
                            placeholder="0"
                            style={{ border: 'none !important', background: 'transparent', paddingLeft: 0, width: '100%', padding: '10px 10px 10px 0' }}
                          />
                        </div>
                      </div>
                      {form.tiers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, tiers: form.tiers.filter((_, j) => j !== i) })}
                          style={{
                            width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                            color: 'rgba(255,255,255,0.4)', fontSize: 16, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            marginTop: i === 0 ? 24 : 0,
                          }}>
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, tiers: [...form.tiers, { name: '', price: '' }] })}
                  style={{ marginTop: 12, fontSize: 13, fontWeight: 600, color: 'var(--red)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font)', padding: 0 }}>
                  + Add Tier
                </button>
              </div>
            </div>
          )}

          {/* ── Step 6: Review ─────────────────────────────────────────────── */}
          {step === 6 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Review your event</p>

              {[
                { label: 'Event Name', value: form.title },
                { label: 'Date', value: form.date ? new Date(form.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : null },
                { label: 'Time', value: [form.time, form.end_time].filter(Boolean).join(' – ') || null },
                { label: 'Location', value: form.location || null },
                { label: 'City', value: form.city || null },
                { label: 'Capacity', value: form.capacity ? `${form.capacity} people` : null },
                { label: 'Event Type', value: form.event_type ? EVENT_TYPES.find(t => t.value === form.event_type)?.label : null },
                { label: 'Age Policy', value: form.age_policy || null },
                { label: 'Dress Code', value: form.dress_code || null },
              ].filter(row => row.value).map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.06)', gap: 16 }}>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', flexShrink: 0 }}>{row.label}</span>
                  <span style={{ fontSize: 13, color: '#fff', fontWeight: 600, textAlign: 'right' }}>{row.value}</span>
                </div>
              ))}

              {form.tiers.filter(t => t.name).length > 0 && (
                <div style={{ paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>Tickets</p>
                  {form.tiers.filter(t => t.name).map((t, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#fff', marginBottom: 4 }}>
                      <span>{t.name}</span>
                      <span style={{ fontWeight: 700 }}>{Number(t.price) === 0 ? 'Free' : `$${Number(t.price).toFixed(2)}`}</span>
                    </div>
                  ))}
                </div>
              )}

              {createError && (
                <div className="mpd-error">{createError}</div>
              )}

              {createDone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--green)', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 8, padding: '12px 16px', fontSize: 14, fontWeight: 700 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Event created and live!
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 28, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <button
              type="button"
              onClick={() => step === 1 ? resetCreate() : goTo(step - 1)}
              style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font)', padding: '8px 4px', transition: 'color 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}>
              ← Back
            </button>

            {step < 6 ? (
              <button
                type="button"
                className="mpd-primary-btn"
                onClick={() => goTo(step + 1)}
                disabled={!canNext()}
                style={{ padding: '10px 28px', fontSize: 14 }}>
                Next →
              </button>
            ) : (
              <button
                type="button"
                className="mpd-primary-btn"
                onClick={handleCreate}
                disabled={createLoading || createDone}
                style={{ padding: '10px 28px', fontSize: 14 }}>
                {createLoading ? <span className="btn-spinner" /> : 'Create Event — Go Live'}
              </button>
            )}
          </div>
        </div>

        {/* RIGHT: Live Preview */}
        <div style={{ position: 'sticky', top: 28 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 12 }}>
            Live Preview
          </p>
          <EventPreviewCard
            title={form.title}
            description={form.description}
            flyerPreview={form.flyerPreview}
            date={form.date}
            location={form.location}
            tiers={form.tiers}
          />
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', marginTop: 12, textAlign: 'center' }}>
            Updates as you fill in details
          </p>
        </div>

      </div>
    </div>
  )
}
