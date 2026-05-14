'use client'

import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'
import Image from 'next/image'

const MOCK_EVENTS = [
  {
    id: '1',
    name: 'Senior After Prom 2026',
    date: 'MAY 22',
    status: 'live',
    sold: 412,
    cap: 500,
    revenue: 7240,
    tiers: [
      { name: 'Early Bird', sold: 150, cap: 150, price: 25, color: '#22C55E' },
      { name: 'General', sold: 230, cap: 300, price: 40, color: '#E03030' },
      { name: 'VIP Table', sold: 32, cap: 50, price: 100, color: '#A78BFA' },
    ],
  },
  {
    id: '2',
    name: 'Buckhead Saturday',
    date: 'MAY 24',
    status: 'draft',
    sold: 0,
    cap: 300,
    revenue: 0,
    tiers: [
      { name: 'General', sold: 0, cap: 300, price: 20, color: '#E03030' },
    ],
  },
]

type Tab = 'overview' | 'events' | 'create'

export default function Dashboard() {
  const { data: session } = useSession()
  const [tab, setTab] = useState<Tab>('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [form, setForm] = useState({
    name: '', date: '', time: '', location: '', capacity: '', description: '',
    price1: '', tier1: 'General', price2: '', tier2: 'VIP',
  })
  const [created, setCreated] = useState(false)

  const totalRevenue = MOCK_EVENTS.reduce((s, e) => s + e.revenue, 0)
  const totalSold = MOCK_EVENTS.reduce((s, e) => s + e.sold, 0)
  const liveEvents = MOCK_EVENTS.filter((e) => e.status === 'live').length

  function handleCreate(ev: React.FormEvent) {
    ev.preventDefault()
    setCreated(true)
    setForm({ name: '', date: '', time: '', location: '', capacity: '', description: '', price1: '', tier1: 'General', price2: '', tier2: 'VIP' })
    setTimeout(() => { setCreated(false); setTab('events') }, 2000)
  }

  const navItems: { id: Tab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'overview', label: 'Overview',
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></svg>,
    },
    {
      id: 'events', label: 'My Events',
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
    },
    {
      id: 'create', label: 'Create Event',
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>,
    },
  ]

  return (
    <div className="dash-layout">
      {/* Sidebar */}
      <aside className={`dash-sidebar${sidebarOpen ? ' open' : ''}`}>
        <div className="dash-sidebar-top">
          <a href="/" className="dash-brand">
            <div className="dash-brand-logo">
              <Image src="/logo.png" alt="Metlanta" width={48} height={22} />
            </div>
            <span>Metlanta</span>
          </a>

          <nav className="dash-nav">
            {navItems.map((item) => (
              <button
                key={item.id}
                className={`dash-nav-item${tab === item.id ? ' active' : ''}`}
                onClick={() => { setTab(item.id); setSidebarOpen(false) }}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="dash-sidebar-bottom">
          <div className="dash-user">
            {session?.user?.image && (
              <Image
                src={session.user.image}
                alt="avatar"
                width={32}
                height={32}
                className="dash-user-avatar"
              />
            )}
            <div className="dash-user-info">
              <p className="dash-user-name">{session?.user?.name ?? 'Host'}</p>
              <p className="dash-user-role">Host</p>
            </div>
          </div>
          <button className="dash-signout" onClick={() => signOut({ callbackUrl: '/' })}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="dash-mobile-bar">
        <button className="dash-burger" onClick={() => setSidebarOpen((v) => !v)} aria-label="Menu">
          <span /><span /><span />
        </button>
        <span className="dash-mobile-title">Dashboard</span>
        {session?.user?.image && (
          <Image src={session.user.image} alt="avatar" width={28} height={28} className="dash-user-avatar" />
        )}
      </div>

      {/* Main content */}
      <main className="dash-main">

        {/* OVERVIEW */}
        {tab === 'overview' && (
          <div className="dash-content">
            <div className="dash-page-header">
              <div>
                <h1 className="dash-page-title">Good to see you, {session?.user?.name?.split(' ')[0] ?? 'Host'} 👋</h1>
                <p className="dash-page-sub">Here&apos;s how your events are performing.</p>
              </div>
              <button className="btn-primary" onClick={() => setTab('create')}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>
                New Event
              </button>
            </div>

            {/* KPI row */}
            <div className="dash-kpis">
              <div className="dash-kpi">
                <p className="dash-kpi-label">Total Revenue</p>
                <p className="dash-kpi-val">${totalRevenue.toLocaleString()}</p>
                <p className="dash-kpi-delta green">+$310 today</p>
              </div>
              <div className="dash-kpi">
                <p className="dash-kpi-label">Tickets Sold</p>
                <p className="dash-kpi-val">{totalSold.toLocaleString()}</p>
                <p className="dash-kpi-delta green">+18 today</p>
              </div>
              <div className="dash-kpi">
                <p className="dash-kpi-label">Live Events</p>
                <p className="dash-kpi-val">{liveEvents}</p>
                <p className="dash-kpi-delta gray">Active now</p>
              </div>
              <div className="dash-kpi">
                <p className="dash-kpi-label">Platform Fee</p>
                <p className="dash-kpi-val">15%</p>
                <p className="dash-kpi-delta gray">Per paid ticket</p>
              </div>
            </div>

            {/* Live event preview */}
            {MOCK_EVENTS.filter((e) => e.status === 'live').map((event) => (
              <div key={event.id} className="dash-event-card">
                <div className="dash-event-header">
                  <div>
                    <div className="dash-live-pill"><div className="live-dot" />Live</div>
                    <h3 className="dash-event-name">{event.name}</h3>
                    <p className="dash-event-date">{event.date}</p>
                  </div>
                  <div className="dash-event-revenue">${event.revenue.toLocaleString()}</div>
                </div>

                <div className="dash-event-tiers">
                  {event.tiers.map((t) => (
                    <div key={t.name} className="dash-tier-row">
                      <div className="dash-tier-info">
                        <span className="dash-tier-name">{t.name}</span>
                        <span className="dash-tier-count">{t.sold}/{t.cap} · ${t.price}</span>
                      </div>
                      <div className="dash-tier-bar">
                        <div
                          className="dash-tier-fill"
                          style={{ width: `${(t.sold / t.cap) * 100}%`, background: t.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="dash-event-actions">
                  <button className="btn-primary" style={{ fontSize: 13, padding: '9px 20px' }}>Promote Event</button>
                  <button className="dash-ghost-btn">Guest List</button>
                  <button className="dash-ghost-btn">Edit</button>
                </div>
              </div>
            ))}

            {/* Toast demo */}
            <div className="dash-toast-demo">
              <div className="toast-dot" />
              <div>
                <p className="toast-title">New ticket sold!</p>
                <p className="toast-sub">VIP · @aaliyah.t · just now</p>
              </div>
            </div>
          </div>
        )}

        {/* MY EVENTS */}
        {tab === 'events' && (
          <div className="dash-content">
            <div className="dash-page-header">
              <div>
                <h1 className="dash-page-title">My Events</h1>
                <p className="dash-page-sub">{MOCK_EVENTS.length} events total</p>
              </div>
              <button className="btn-primary" onClick={() => setTab('create')}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>
                New Event
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {MOCK_EVENTS.map((event) => (
                <div key={event.id} className="dash-event-card">
                  <div className="dash-event-header">
                    <div>
                      <div className={`dash-status-pill ${event.status}`}>{event.status === 'live' ? '● Live' : '○ Draft'}</div>
                      <h3 className="dash-event-name">{event.name}</h3>
                      <p className="dash-event-date">{event.date}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: 11, color: 'var(--gray3)', marginBottom: 4 }}>Revenue</p>
                      <p className="dash-event-revenue">${event.revenue.toLocaleString()}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                    <div className="dash-tier-bar" style={{ flex: 1 }}>
                      <div className="dash-tier-fill" style={{ width: `${(event.sold / event.cap) * 100}%`, background: 'var(--red)' }} />
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--gray)', whiteSpace: 'nowrap' }}>{event.sold}/{event.cap} sold</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CREATE EVENT */}
        {tab === 'create' && (
          <div className="dash-content">
            <div className="dash-page-header">
              <div>
                <h1 className="dash-page-title">Create Event</h1>
                <p className="dash-page-sub">Go live in under 5 minutes.</p>
              </div>
            </div>

            {created ? (
              <div className="dash-success">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                Event created! Redirecting to your events…
              </div>
            ) : (
              <form className="dash-form" onSubmit={handleCreate}>
                <div className="dash-form-section">
                  <h3 className="dash-form-heading">Event Details</h3>
                  <div className="dash-form-grid">
                    <div className="dash-field">
                      <label>Event Name *</label>
                      <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Senior After Prom 2026" required />
                    </div>
                    <div className="dash-field">
                      <label>Location *</label>
                      <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Atlanta, GA" required />
                    </div>
                    <div className="dash-field">
                      <label>Date *</label>
                      <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
                    </div>
                    <div className="dash-field">
                      <label>Time</label>
                      <input value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} placeholder="9PM – 3AM" />
                    </div>
                    <div className="dash-field" style={{ gridColumn: '1/-1' }}>
                      <label>Capacity *</label>
                      <input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} placeholder="500" required />
                    </div>
                    <div className="dash-field" style={{ gridColumn: '1/-1' }}>
                      <label>Description</label>
                      <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Tell people about your event..." rows={3} />
                    </div>
                  </div>
                </div>

                <div className="dash-form-section">
                  <h3 className="dash-form-heading">Ticket Tiers</h3>
                  <div className="dash-form-grid">
                    <div className="dash-field">
                      <label>Tier 1 Name</label>
                      <input value={form.tier1} onChange={(e) => setForm({ ...form, tier1: e.target.value })} placeholder="General" />
                    </div>
                    <div className="dash-field">
                      <label>Price ($)</label>
                      <input type="number" value={form.price1} onChange={(e) => setForm({ ...form, price1: e.target.value })} placeholder="20" />
                    </div>
                    <div className="dash-field">
                      <label>Tier 2 Name</label>
                      <input value={form.tier2} onChange={(e) => setForm({ ...form, tier2: e.target.value })} placeholder="VIP" />
                    </div>
                    <div className="dash-field">
                      <label>Price ($)</label>
                      <input type="number" value={form.price2} onChange={(e) => setForm({ ...form, price2: e.target.value })} placeholder="60" />
                    </div>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--gray3)', marginTop: 10 }}>
                    Metlanta fee: 15% per paid ticket · Free RSVPs are always free
                  </p>
                </div>

                <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px' }}>
                  Create Event — Go Live
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </button>
              </form>
            )}
          </div>
        )}
      </main>

      {/* Sidebar overlay on mobile */}
      {sidebarOpen && <div className="dash-overlay" onClick={() => setSidebarOpen(false)} />}
    </div>
  )
}
