'use client'

import { useState, useEffect } from 'react'

interface StripeStatus {
  connected: boolean
  charges_enabled?: boolean
  payouts_enabled?: boolean
  status: string
}

export default function SettingsPage() {
  const [stripeStatus, setStripeStatus] = useState<StripeStatus | null>(null)
  const [stripeLoading, setStripeLoading] = useState(false)
  const [stripeError, setStripeError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/stripe-connect')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setStripeStatus(d) })
      .catch(() => {})
  }, [])

  async function connectStripe() {
    setStripeLoading(true)
    setStripeError(null)
    try {
      const res = await fetch('/api/stripe-connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          return_url: '/dashboard/settings?stripe=success',
          refresh_url: '/dashboard/settings?stripe=refresh',
        }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
        return
      }
      setStripeError(data.error ?? 'Something went wrong.')
    } catch {
      setStripeError('Network error. Please try again.')
    }
    setStripeLoading(false)
  }

  const SETTINGS = [
    {
      href: '/dashboard/settings/members',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
      title: 'Members',
      desc: "See who's on the team. Invite, change roles, and authorize event access.",
    },
    {
      href: '/dashboard/settings/profile',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="12" cy="10" r="3"/><path d="M7 21v-1a5 5 0 0110 0v1"/></svg>,
      title: 'Team Profile',
      desc: 'Public name, banner, profile picture, and Instagram handle.',
    },
    {
      href: '#',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,
      title: 'Notifications',
      desc: "What your team is notified about, who receives it, and external email or webhook destinations.",
    },
  ]

  return (
    <>
      <div className="mpd-breadcrumb">
        <a href="/dashboard">Dashboard</a>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        <span>Settings</span>
      </div>

      <div style={{ marginBottom: 24 }}>
        <h2 className="mpd-section-title">Settings</h2>
        <p className="mpd-section-sub">Manage your team&apos;s profile, notifications, members, and payments.</p>
      </div>

      {/* Payments / Stripe Connect card */}
      <div className="mpd-card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 20 }}>
          <div className="mpd-settings-row-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
          </div>
          <div style={{ flex: 1 }}>
            <p className="mpd-settings-row-title">Payments</p>
            <p className="mpd-settings-row-desc">Connect Stripe to accept payments and receive direct bank deposits for your events.</p>
          </div>
        </div>

        {stripeStatus === null ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--gray3)', fontSize: 13 }}>
            <div className="dash-spinner" style={{ width: 14, height: 14 }} />
            Checking status…
          </div>
        ) : stripeStatus.connected ? (
          <div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)',
              borderRadius: 10, padding: '12px 16px', marginBottom: 16,
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'rgba(34,197,94,0.15)', border: '1.5px solid rgba(34,197,94,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: 14, color: '#22c55e' }}>Stripe Connected</p>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 1 }}>
                  Payments enabled · Payouts active
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <a href="/dashboard/account" className="mpd-primary-btn" style={{ textDecoration: 'none' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                View Balance & Payouts
              </a>
              <a href="https://dashboard.stripe.com" target="_blank" rel="noopener noreferrer" className="mpd-ghost-btn">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                Stripe Dashboard
              </a>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              {[
                'Direct bank deposits within 2–5 days',
                'Instant payouts available (5% fee)',
                'Automatic 1099-K tax forms from Stripe',
                'Real-time earnings dashboard',
              ].map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  {f}
                </div>
              ))}
            </div>
            <button
              className="mpd-primary-btn"
              onClick={connectStripe}
              disabled={stripeLoading}
            >
              {stripeLoading ? (
                <span className="btn-spinner" />
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                  Connect Stripe — Free
                </>
              )}
            </button>
            {stripeError && (
              <p style={{ fontSize: 13, color: '#ef4444', marginTop: 10 }}>{stripeError}</p>
            )}
          </div>
        )}
      </div>

      {/* Other settings */}
      <div className="mpd-settings-list">
        {SETTINGS.map((s, i) => (
          <a
            key={i}
            href={s.href}
            className="mpd-settings-row"
          >
            <div className="mpd-settings-row-icon">{s.icon}</div>
            <div className="mpd-settings-row-body">
              <p className="mpd-settings-row-title">{s.title}</p>
              <p className="mpd-settings-row-desc">{s.desc}</p>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, color: 'var(--gray3)' }}><polyline points="9 18 15 12 9 6"/></svg>
          </a>
        ))}
      </div>
    </>
  )
}
