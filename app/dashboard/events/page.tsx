'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import type { DbEvent } from '@/lib/supabase'

type View = 'list' | 'create'

export default function EventsPage() {
  const { data: session } = useSession()
  const [view, setView] = useState<View>('list')
  const [events, setEvents] = useState<DbEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [createLoading, setCreateLoading] = useState(false)
  const [createDone, setCreateDone] = useState(false)
  const [createError, setCreateError] = useState('')
  const [form, setForm] = useState({
    title: '', date: '', time: '', end_time: '', location: '', city: 'Atlanta',
    capacity: '', description: '', event_type: '', age_policy: '',
    tiers: [{ name: 'General', price: '' }, { name: '', price: '' }],
  })

  const loadEvents = useCallback(async () => {
    setLoading(true)
    const r = await fetch('/api/dashboard/events')
    if (r.ok) setEvents((await r.json()).events ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { loadEvents() }, [loadEvents])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setCreateLoading(true); setCreateError('')
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          capacity: Number(form.capacity),
          tiers: form.tiers.filter(t => t.name).map(t => ({ name: t.name, price: Number(t.price) || 0 })),
        }),
      })
      const data = await res.json()
      if (!res.ok) { setCreateError(data.error ?? 'Failed'); return }
      setCreateDone(true)
      await loadEvents()
      setTimeout(() => { setCreateDone(false); setView('list') }, 1600)
    } catch { setCreateError('Something went wrong.') }
    finally { setCreateLoading(false) }
  }

  const isHost = session?.user?.role === 'host' || session?.user?.role === 'admin'

  return (
    <>
      <div className="mpd-banner">
        <div>
          <p className="mpd-banner-title">Complete your Stripe setup</p>
          <p className="mpd-banner-sub">Connect Stripe to start accepting payments for your events.</p>
        </div>
        <a href="/dashboard/settings" className="mpd-banner-btn">Set up Stripe</a>
      </div>

      <div className="mpd-breadcrumb">
        <a href="/dashboard">Dashboard</a>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        <span>Events</span>
      </div>

      {view === 'list' ? (
        <>
          <div className="mpd-page-row">
            <span />
            <button className="mpd-primary-btn" onClick={() => setView('create')}>Create Event</button>
          </div>

          {loading ? (
            <div className="mpd-spinner-wrap"><div className="dash-spinner" /></div>
          ) : events.length === 0 ? (
            <p className="mpd-empty-msg">No events yet...</p>
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
      ) : (
        <>
          <div className="mpd-page-row">
            <button className="mpd-ghost-btn" onClick={() => setView('list')}>← Back to Events</button>
          </div>

          {createDone ? (
            <div className="dash-success-msg">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              Event created and live!
            </div>
          ) : (
            <form className="mpd-form" onSubmit={handleCreate}>
              <div className="mpd-form-section">
                <h3 className="mpd-form-section-title">Event Details</h3>
                <div className="mpd-form-grid">
                  <div className="mpd-field full"><label>Event Title *</label><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Summer Night Kickback" required /></div>
                  <div className="mpd-field"><label>Date *</label><input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required /></div>
                  <div className="mpd-field"><label>Start Time</label><input value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} placeholder="9PM" /></div>
                  <div className="mpd-field"><label>End Time</label><input value={form.end_time} onChange={e => setForm({ ...form, end_time: e.target.value })} placeholder="3AM" /></div>
                  <div className="mpd-field"><label>Capacity *</label><input type="number" min="1" value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} placeholder="500" required /></div>
                  <div className="mpd-field full"><label>Location *</label><input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Venue name or address, Atlanta GA" required /></div>
                  <div className="mpd-field">
                    <label>Event Type</label>
                    <select value={form.event_type} onChange={e => setForm({ ...form, event_type: e.target.value })}>
                      <option value="">Select type</option>
                      <option value="kickback">Kickback</option>
                      <option value="day_party">Day Party</option>
                      <option value="nightlife">Nightlife</option>
                      <option value="after_prom">After Prom</option>
                      <option value="pop_up">Pop-Up</option>
                      <option value="school_event">School Event</option>
                    </select>
                  </div>
                  <div className="mpd-field"><label>Age Policy</label><input value={form.age_policy} onChange={e => setForm({ ...form, age_policy: e.target.value })} placeholder="18+ with ID" /></div>
                  <div className="mpd-field full"><label>Description</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Tell people what to expect…" rows={3} /></div>
                </div>
              </div>

              <div className="mpd-form-section">
                <h3 className="mpd-form-section-title">Ticket Tiers</h3>
                <p className="mpd-form-note">Set price to 0 for free RSVP. Platform fee: 22% per paid ticket (15% on $100+).</p>
                {form.tiers.map((tier, i) => (
                  <div key={i} className="mpd-tier-row">
                    <div className="mpd-field" style={{ flex: 2 }}>
                      <label>Tier {i + 1} Name</label>
                      <input value={tier.name} onChange={e => { const t = [...form.tiers]; t[i] = { ...t[i], name: e.target.value }; setForm({ ...form, tiers: t }) }} placeholder={i === 0 ? 'General' : 'VIP'} />
                    </div>
                    <div className="mpd-field" style={{ flex: 1 }}>
                      <label>Price ($)</label>
                      <input type="number" min="0" step="0.01" value={tier.price} onChange={e => { const t = [...form.tiers]; t[i] = { ...t[i], price: e.target.value }; setForm({ ...form, tiers: t }) }} placeholder="0" />
                    </div>
                  </div>
                ))}
                <button type="button" className="mpd-ghost-btn" style={{ marginTop: 8 }} onClick={() => setForm({ ...form, tiers: [...form.tiers, { name: '', price: '' }] })}>+ Add Tier</button>
              </div>

              {createError && <p className="mpd-error">{createError}</p>}
              <button type="submit" className="mpd-primary-btn" disabled={createLoading} style={{ width: '100%', justifyContent: 'center' }}>
                {createLoading ? 'Creating…' : 'Create Event — Go Live'}
              </button>
            </form>
          )}
        </>
      )}
    </>
  )
}
