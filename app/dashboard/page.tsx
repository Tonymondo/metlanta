'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Suspense } from 'react'

const METRICS = ['Revenue', 'Attendees', 'Events'] as const
const CHART_TYPES = ['Bar', 'Line'] as const

const DATE_RANGE = (() => {
  const end = new Date()
  const start = new Date(); start.setDate(end.getDate() - 28)
  return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
})()

const MOCK_BARS = [0, 0, 0, 0, 0.1, 0, 0, 0.2, 0, 0, 0.05, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

function OverviewInner() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState({ totalRevenue: 0, totalTickets: 0, liveEvents: 0 })
  const [metric, setMetric] = useState<typeof METRICS[number]>('Revenue')
  const [chartType, setChartType] = useState<typeof CHART_TYPES[number]>('Bar')
  const [stripeConnected, setStripeConnected] = useState<boolean | null>(null)
  const isHost = session?.user?.role === 'host' || session?.user?.role === 'admin'

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/login'); return }
    if (isHost) {
      fetch('/api/dashboard/stats').then(r => r.ok ? r.json() : null).then(d => { if (d) setStats(d) })
      fetch('/api/stripe-connect').then(r => r.ok ? r.json() : null).then(d => {
        if (d) setStripeConnected(d.connected ?? false)
      })
    }
  }, [status, isHost, router])

  return (
    <>
      {/* Host setup banner — only when Stripe not yet connected */}
      {isHost && stripeConnected === false && (
        <div className="mpd-banner">
          <div>
            <p className="mpd-banner-title">Connect Stripe to start receiving payouts</p>
            <p className="mpd-banner-sub">Set up your Stripe account to get paid directly. Funds deposit within 2–5 business days.</p>
          </div>
          <a href="/dashboard/settings" className="mpd-banner-btn">Set up Stripe</a>
        </div>
      )}

      <h1 className="mpd-page-title">Dashboard</h1>

      {/* KPI row 1 */}
      <div className="mpd-kpi-grid">
        <div className="mpd-kpi">
          <div className="mpd-kpi-hd">
            <span>Total Revenue</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
          </div>
          <p className="mpd-kpi-val">$ {stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
        <div className="mpd-kpi">
          <div className="mpd-kpi-hd">
            <span>Total Attendees</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
          </div>
          <p className="mpd-kpi-val">{stats.totalTickets.toLocaleString()}</p>
        </div>
        <div className="mpd-kpi">
          <div className="mpd-kpi-hd">
            <span>Total Events Hosted</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          </div>
          <p className="mpd-kpi-val">{stats.liveEvents}</p>
        </div>
        <div className="mpd-kpi">
          <div className="mpd-kpi-hd">
            <span>Total Views</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          </div>
          <p className="mpd-kpi-val">0</p>
        </div>
      </div>

      {/* KPI row 2 */}
      <div className="mpd-kpi-grid" style={{ gridTemplateColumns: '1fr 3fr', gap: 12, marginBottom: 24 }}>
        <div className="mpd-kpi">
          <div className="mpd-kpi-hd">
            <span>Repeat Rate</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg>
          </div>
          <p className="mpd-kpi-val">0%</p>
          <a href="/dashboard/marketing" className="mpd-kpi-link">View insights →</a>
        </div>
        <div />
      </div>

      {/* Date range + chart */}
      <div className="mpd-date-row">
        <button className="mpd-date-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          {DATE_RANGE}
        </button>
      </div>

      <div className="mpd-chart-card">
        <div className="mpd-chart-controls">
          <div className="mpd-select-group">
            {METRICS.map(m => (
              <button key={m} className={`mpd-select-btn${metric === m ? ' active' : ''}`} onClick={() => setMetric(m)}>
                {m}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
            ))}
          </div>
          <div className="mpd-select-group">
            {CHART_TYPES.map(t => (
              <button key={t} className={`mpd-select-btn${chartType === t ? ' active' : ''}`} onClick={() => setChartType(t)}>
                {t}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
            ))}
          </div>
        </div>

        <div className="mpd-chart-wrap">
          <div className="mpd-chart-y">
            {[1.0, 0.8, 0.6, 0.4, 0.2, 0.0].map(v => (
              <span key={v}>{v.toFixed(1)}</span>
            ))}
          </div>
          <div className="mpd-chart-bars">
            {MOCK_BARS.map((h, i) => (
              <div key={i} className="mpd-bar-col">
                <div className="mpd-bar" style={{ height: `${h * 100}%` }} />
              </div>
            ))}
          </div>
        </div>

        <div className="mpd-chart-x">
          {[DATE_RANGE.split('–')[0].trim(), ...['', '', '', '', '', '', '', '', '', '', '', '', ''], DATE_RANGE.split('–')[1].trim()].filter((_, i) => i === 0 || i === 14).map((label, i) => (
            <span key={i} style={{ position: 'absolute', left: i === 0 ? 0 : '100%', transform: i === 0 ? 'none' : 'translateX(-100%)' }}>{label}</span>
          ))}
        </div>
      </div>
    </>
  )
}

export default function DashboardPage() {
  return <Suspense><OverviewInner /></Suspense>
}
