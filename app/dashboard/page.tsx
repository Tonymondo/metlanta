'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { Suspense } from 'react'
import type { DbEvent } from '@/lib/supabase'

type Tab = 'overview' | 'events' | 'create' | 'become-host'

function DashboardInner() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [tab, setTab] = useState<Tab>(() => {
    const t = searchParams.get('tab')
    return (t as Tab) || 'overview'
  })
  const [events, setEvents] = useState<DbEvent[]>([])
  const [stats, setStats] = useState({ totalRevenue: 0, totalTickets: 0, liveEvents: 0 })
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [hostForm, setHostForm] = useState({ displayName: '', bio: '', instagram: '' })
  const [hostLoading, setHostLoading] = useState(false)
  const [hostDone, setHostDone] = useState(false)
  const [createForm, setCreateForm] = useState({
    title: '', date: '', time: '', end_time: '', location: '', city: 'Atlanta',
    capacity: '', description: '', event_type: '', age_policy: '',
    tiers: [
      { name: 'General', price: '' },
      { name: '', price: '' },
    ],
  })
  const [createLoading, setCreateLoading] = useState(false)
  const [createDone, setCreateDone] = useState(false)
  const [createError, setCreateError] = useState('')
  const [flyerFile, setFlyerFile] = useState<File | null>(null)
  const [flyerPreview, setFlyerPreview] = useState('')
  const [flyerDragOver, setFlyerDragOver] = useState(false)

  const isHost = session?.user?.role === 'host' || session?.user?.role === 'admin'

  const loadData = useCallback(async () => {
    if (!session?.user?.id || !isHost) { setLoading(false); return }
    try {
      const [evRes, stRes] = await Promise.all([
        fetch('/api/dashboard/events'),
        fetch('/api/dashboard/stats'),
      ])
      if (evRes.ok) setEvents((await evRes.json()).events ?? [])
      if (stRes.ok) setStats(await stRes.json())
    } catch { /* non-critical */ }
    setLoading(false)
  }, [session?.user?.id, isHost])

  useEffect(() => { if (status !== 'loading') loadData() }, [status, loadData])

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="dash-loading">
        <div className="dash-spinner" />
      </div>
    )
  }

  // Become host flow
  async function handleBecomeHost(e: React.FormEvent) {
    e.preventDefault()
    setHostLoading(true)
    const res = await fetch('/api/hosts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(hostForm),
    })
    if (res.ok) {
      await update()  // refresh session role
      setHostDone(true)
      setTab('overview')
    }
    setHostLoading(false)
  }

  function handleFlyerSelect(file: File) {
    if (!file.type.startsWith('image/')) { setCreateError('Flyer must be an image file.'); return }
    if (file.size > 5 * 1024 * 1024) { setCreateError('Flyer image must be under 5MB.'); return }
    setCreateError('')
    setFlyerFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => setFlyerPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  function resetCreateForm() {
    setCreateForm({
      title: '', date: '', time: '', end_time: '', location: '', city: 'Atlanta',
      capacity: '', description: '', event_type: '', age_policy: '',
      tiers: [{ name: 'General', price: '' }, { name: '', price: '' }],
    })
    setFlyerFile(null)
    setFlyerPreview('')
  }

  // Create event
  async function handleCreateEvent(e: React.FormEvent) {
    e.preventDefault()
    setCreateLoading(true)
    setCreateError('')
    try {
      // Step 1: create event
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...createForm,
          capacity: Number(createForm.capacity),
          tiers: createForm.tiers.filter((t) => t.name).map((t) => ({
            name: t.name,
            price: Number(t.price) || 0,
          })),
        }),
      })
      const data = await res.json()
      if (!res.ok) { setCreateError(data.error ?? 'Failed to create event'); return }

      const eventId = data.event.id

      // Step 2: upload flyer if selected
      if (flyerFile && eventId) {
        const fd = new FormData()
        fd.append('file', flyerFile)
        fd.append('bucket', 'event-flyers')
        fd.append('ref_id', eventId)
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: fd })
        if (uploadRes.ok) {
          const { url } = await uploadRes.json()
          // Step 3: attach flyer URL to event
          await fetch(`/api/events/${eventId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ flyer_url: url }),
          })
        }
      }

      setCreateDone(true)
      resetCreateForm()
      await loadData()
      setTimeout(() => { setCreateDone(false); setTab('events') }, 1800)
    } catch {
      setCreateError('Something went wrong.')
    } finally {
      setCreateLoading(false)
    }
  }

  const navItems: { id: Tab; label: string }[] = isHost
    ? [
      { id: 'overview', label: 'Overview' },
      { id: 'events', label: 'My Events' },
      { id: 'create', label: 'Create Event' },
    ]
    : [
      { id: 'overview', label: 'Overview' },
      { id: 'become-host', label: 'Become a Host' },
    ]

  return (
    <div className="dash-layout">
      {/* Sidebar */}
      <aside className={`dash-sidebar${sidebarOpen ? ' open' : ''}`}>
        <div className="dash-sidebar-top">
          <a href="/" className="dash-wordmark">METLANTA</a>

          <nav className="dash-nav">
            {navItems.map((item) => (
              <button
                key={item.id}
                className={`dash-nav-item${tab === item.id ? ' active' : ''}`}
                onClick={() => { setTab(item.id); setSidebarOpen(false) }}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="dash-sidebar-foot">
          <div className="dash-user-row">
            {session?.user?.image
              ? <Image src={session.user.image} alt="" width={32} height={32} className="dash-avatar" />
              : <div className="dash-avatar-fallback">{session?.user?.name?.[0] ?? '?'}</div>
            }
            <div>
              <p className="dash-uname">{session?.user?.name ?? 'User'}</p>
              <p className="dash-urole">{session?.user?.role ?? 'attendee'}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <a href="/" className="dash-ghost-btn" style={{ flex: 1, textAlign: 'center' }}>Home</a>
            <button className="dash-ghost-btn" style={{ flex: 1 }} onClick={() => signOut({ callbackUrl: '/' })}>Sign Out</button>
          </div>
        </div>
      </aside>

      {/* Mobile bar */}
      <div className="dash-mobile-bar">
        <button className={`dash-burger${sidebarOpen ? ' open' : ''}`} onClick={() => setSidebarOpen((v) => !v)} aria-label="Menu">
          <span /><span /><span />
        </button>
        <span className="dash-mobile-title">
          {navItems.find((n) => n.id === tab)?.label ?? 'Dashboard'}
        </span>
        <a href="/" className="dash-mobile-home">← Home</a>
      </div>

      {/* Main */}
      <main className="dash-main">
        <div className="dash-content">

          {/* OVERVIEW */}
          {tab === 'overview' && (
            <>
              <div className="dash-page-hd">
                <h1 className="dash-page-title">
                  Hello, {session?.user?.name?.split(' ')[0] ?? 'there'}.
                </h1>
                <p className="dash-page-sub">
                  {isHost ? 'Your host dashboard.' : 'Your Metlanta account.'}
                </p>
              </div>

              {isHost ? (
                <>
                  <div className="dash-kpis">
                    {[
                      { label: 'Your Revenue', val: `$${stats.totalRevenue.toLocaleString()}`, note: '85% of all ticket sales' },
                      { label: 'Tickets Sold', val: stats.totalTickets.toLocaleString(), note: 'Confirmed tickets' },
                      { label: 'Live Events', val: stats.liveEvents, note: 'Active right now' },
                      { label: 'Platform Fee', val: '15%', note: 'Per paid ticket' },
                    ].map((k) => (
                      <div key={k.label} className="dash-kpi">
                        <p className="dash-kpi-label">{k.label}</p>
                        <p className="dash-kpi-val">{k.val}</p>
                        <p className="dash-kpi-note">{k.note}</p>
                      </div>
                    ))}
                  </div>

                  {loading ? (
                    <div className="dash-spinner" />
                  ) : events.length === 0 ? (
                    <div className="dash-empty">
                      <p className="dash-empty-title">No events yet.</p>
                      <p className="dash-empty-sub">Create your first event to start selling tickets.</p>
                      <button className="btn-primary" onClick={() => setTab('create')} style={{ marginTop: 16 }}>
                        Create Event
                      </button>
                    </div>
                  ) : (
                    <div className="dash-events-list">
                      {events.slice(0, 3).map((event) => (
                        <MiniEventRow key={event.id} event={event} />
                      ))}
                      {events.length > 3 && (
                        <button className="dash-ghost-btn" onClick={() => setTab('events')}>
                          View all {events.length} events →
                        </button>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="dash-attendee-state">
                  <p className="dash-empty-title">You&apos;re logged in as an attendee.</p>
                  <p className="dash-empty-sub">Want to host events and get paid? Upgrade to a host account.</p>
                  <button className="btn-primary" onClick={() => setTab('become-host')} style={{ marginTop: 16 }}>
                    Become a Host
                  </button>
                </div>
              )}
            </>
          )}

          {/* MY EVENTS */}
          {tab === 'events' && isHost && (
            <>
              <div className="dash-page-hd" style={{ marginBottom: 24 }}>
                <h1 className="dash-page-title">My Events</h1>
                <button className="btn-primary" onClick={() => setTab('create')}>+ New Event</button>
              </div>

              {loading ? <div className="dash-spinner" /> : events.length === 0 ? (
                <div className="dash-empty">
                  <p className="dash-empty-title">No events yet.</p>
                  <button className="btn-primary" onClick={() => setTab('create')} style={{ marginTop: 12 }}>Create Your First Event</button>
                </div>
              ) : (
                <div className="dash-events-list">
                  {events.map((event) => <MiniEventRow key={event.id} event={event} full />)}
                </div>
              )}
            </>
          )}

          {/* CREATE EVENT */}
          {tab === 'create' && isHost && (
            <>
              <div className="dash-page-hd">
                <h1 className="dash-page-title">Create Event</h1>
                <p className="dash-page-sub">Goes live immediately.</p>
              </div>

              {createDone ? (
                <div className="dash-success-msg">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  Event created and live! Redirecting…
                </div>
              ) : (
                <form className="dash-form" onSubmit={handleCreateEvent}>
                  <fieldset className="dash-fieldset">
                    <legend>Event Details</legend>
                    <div className="dash-form-grid">
                      <div className="dash-field full">
                        <label>Event Title *</label>
                        <input value={createForm.title} onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })} placeholder="Senior After Prom 2026" required />
                      </div>
                      <div className="dash-field">
                        <label>Date *</label>
                        <input type="date" value={createForm.date} onChange={(e) => setCreateForm({ ...createForm, date: e.target.value })} required />
                      </div>
                      <div className="dash-field">
                        <label>Start Time</label>
                        <input value={createForm.time} onChange={(e) => setCreateForm({ ...createForm, time: e.target.value })} placeholder="9PM" />
                      </div>
                      <div className="dash-field">
                        <label>End Time</label>
                        <input value={createForm.end_time} onChange={(e) => setCreateForm({ ...createForm, end_time: e.target.value })} placeholder="3AM" />
                      </div>
                      <div className="dash-field">
                        <label>Capacity *</label>
                        <input type="number" min="1" value={createForm.capacity} onChange={(e) => setCreateForm({ ...createForm, capacity: e.target.value })} placeholder="500" required />
                      </div>
                      <div className="dash-field full">
                        <label>Location *</label>
                        <input value={createForm.location} onChange={(e) => setCreateForm({ ...createForm, location: e.target.value })} placeholder="Venue name or address, Atlanta GA" required />
                      </div>
                      <div className="dash-field">
                        <label>Event Type</label>
                        <select value={createForm.event_type} onChange={(e) => setCreateForm({ ...createForm, event_type: e.target.value })}>
                          <option value="">Select type</option>
                          <option value="kickback">Kickback</option>
                          <option value="day_party">Day Party</option>
                          <option value="nightlife">Nightlife</option>
                          <option value="after_prom">After Prom</option>
                          <option value="pop_up">Pop-Up</option>
                          <option value="school_event">School Event</option>
                        </select>
                      </div>
                      <div className="dash-field">
                        <label>Age Policy</label>
                        <input value={createForm.age_policy} onChange={(e) => setCreateForm({ ...createForm, age_policy: e.target.value })} placeholder="18+ with ID" />
                      </div>
                      <div className="dash-field full">
                        <label>Description</label>
                        <textarea value={createForm.description} onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })} placeholder="Tell people what to expect…" rows={3} />
                      </div>
                    </div>
                  </fieldset>

                  <fieldset className="dash-fieldset">
                    <legend>Event Flyer</legend>
                    <p className="dash-fieldset-note">Upload a flyer or cover image. JPG, PNG, WebP · Max 5MB.</p>
                    {flyerPreview ? (
                      <div className="flyer-preview">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={flyerPreview} alt="Flyer preview" className="flyer-preview-img" />
                        <button
                          type="button"
                          className="flyer-preview-remove"
                          onClick={() => { setFlyerFile(null); setFlyerPreview('') }}
                          aria-label="Remove flyer"
                        >
                          ×
                        </button>
                        <p className="flyer-preview-label">{flyerFile?.name}</p>
                      </div>
                    ) : (
                      <div
                        className={`flyer-upload-zone${flyerDragOver ? ' drag-over' : ''}`}
                        onDragOver={(ev) => { ev.preventDefault(); setFlyerDragOver(true) }}
                        onDragLeave={() => setFlyerDragOver(false)}
                        onDrop={(ev) => {
                          ev.preventDefault()
                          setFlyerDragOver(false)
                          const f = ev.dataTransfer.files[0]
                          if (f) handleFlyerSelect(f)
                        }}
                      >
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(ev) => { const f = ev.target.files?.[0]; if (f) handleFlyerSelect(f) }}
                        />
                        <div className="flyer-upload-icon">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--gray)' }}>
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                          </svg>
                        </div>
                        <p className="flyer-upload-text">Drop your flyer here or tap to browse</p>
                        <p className="flyer-upload-sub">JPG, PNG, WebP · Max 5MB</p>
                      </div>
                    )}
                  </fieldset>

                  <fieldset className="dash-fieldset">
                    <legend>Ticket Tiers</legend>
                    <p className="dash-fieldset-note">Set price to 0 for free RSVP. Platform fee: 15% per paid ticket.</p>
                    {createForm.tiers.map((tier, i) => (
                      <div key={i} className="dash-tier-row-form">
                        <div className="dash-field" style={{ flex: 2 }}>
                          <label>Tier {i + 1} Name</label>
                          <input
                            value={tier.name}
                            onChange={(e) => {
                              const t = [...createForm.tiers]
                              t[i] = { ...t[i], name: e.target.value }
                              setCreateForm({ ...createForm, tiers: t })
                            }}
                            placeholder={i === 0 ? 'General' : 'VIP'}
                          />
                        </div>
                        <div className="dash-field" style={{ flex: 1 }}>
                          <label>Price ($)</label>
                          <input
                            type="number" min="0" step="0.01"
                            value={tier.price}
                            onChange={(e) => {
                              const t = [...createForm.tiers]
                              t[i] = { ...t[i], price: e.target.value }
                              setCreateForm({ ...createForm, tiers: t })
                            }}
                            placeholder="0"
                          />
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="dash-ghost-btn"
                      style={{ marginTop: 8 }}
                      onClick={() => setCreateForm({ ...createForm, tiers: [...createForm.tiers, { name: '', price: '' }] })}
                    >
                      + Add Tier
                    </button>
                  </fieldset>

                  {createError && <p className="dash-error">{createError}</p>}

                  <button type="submit" className="btn-primary" disabled={createLoading} style={{ width: '100%', justifyContent: 'center' }}>
                    {createLoading ? 'Creating…' : 'Create Event — Go Live'}
                  </button>
                </form>
              )}
            </>
          )}

          {/* BECOME HOST */}
          {tab === 'become-host' && (
            <>
              <div className="dash-page-hd">
                <h1 className="dash-page-title">Become a Host</h1>
                <p className="dash-page-sub">Upgrade your account to create events and sell tickets.</p>
              </div>

              {hostDone ? (
                <div className="dash-success-msg">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  You&apos;re now a host! Reloading your dashboard…
                </div>
              ) : (
                <form className="dash-form" onSubmit={handleBecomeHost}>
                  <fieldset className="dash-fieldset">
                    <legend>Host Profile</legend>
                    <div className="dash-form-grid">
                      <div className="dash-field full">
                        <label>Display Name *</label>
                        <input value={hostForm.displayName} onChange={(e) => setHostForm({ ...hostForm, displayName: e.target.value })} placeholder="Your name or brand" required />
                      </div>
                      <div className="dash-field full">
                        <label>Bio</label>
                        <textarea value={hostForm.bio} onChange={(e) => setHostForm({ ...hostForm, bio: e.target.value })} placeholder="Tell people who you are and what you throw…" rows={3} />
                      </div>
                      <div className="dash-field full">
                        <label>Instagram Handle</label>
                        <input value={hostForm.instagram} onChange={(e) => setHostForm({ ...hostForm, instagram: e.target.value })} placeholder="@yourhandle" />
                      </div>
                    </div>
                  </fieldset>
                  <button type="submit" className="btn-primary" disabled={hostLoading} style={{ width: '100%', justifyContent: 'center' }}>
                    {hostLoading ? 'Upgrading…' : 'Upgrade to Host — Free'}
                  </button>
                </form>
              )}
            </>
          )}

        </div>
      </main>

      {sidebarOpen && <div className="dash-overlay" onClick={() => setSidebarOpen(false)} />}
    </div>
  )
}

function MiniEventRow({ event, full = false }: { event: DbEvent; full?: boolean }) {
  const tiers = event.ticket_tiers ?? []
  const totalSold = tiers.reduce((s, t) => s + t.sold_count, 0)
  const totalCap = tiers.reduce((s, t) => s + (t.capacity ?? 0), 0)
  const pct = totalCap > 0 ? Math.min((totalSold / totalCap) * 100, 100) : 0

  return (
    <div className="dash-event-row">
      <div className="dash-event-row-info">
        <div>
          <span className={`dash-status-dot ${event.status}`} />
          <span className="dash-event-row-title">{event.title}</span>
        </div>
        <span className="dash-event-row-date">
          {new Date(event.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
      </div>
      {full && (
        <>
          <div className="dash-tier-bar" style={{ marginTop: 10, marginBottom: 4 }}>
            <div className="dash-tier-fill" style={{ width: `${pct}%`, background: event.status === 'live' ? 'var(--red)' : '#333' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--gray3)' }}>
            <span>{totalSold} sold</span>
            <span>{totalCap > 0 ? `${totalCap} cap` : 'Open'}</span>
          </div>
        </>
      )}
    </div>
  )
}

export default function Dashboard() {
  return (
    <Suspense>
      <DashboardInner />
    </Suspense>
  )
}
