'use client'

import { useEffect, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface AccountStats {
  attended: number
  discount: number
  progressLabel: string
  nextMilestone: number
  memberSince: string | null
}

function formatMemberSince(iso: string | null) {
  if (!iso) return 'Recently'
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

export default function AccountPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<AccountStats | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  useEffect(() => {
    if (status !== 'authenticated') return
    fetch('/api/account').then((r) => r.json()).then((d) => {
      setStats(d.stats)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [status])

  if (status === 'loading' || loading) {
    return <div className="acc-loading"><div className="dash-spinner" /></div>
  }

  const attended = stats?.attended ?? 0
  const discount = stats?.discount ?? 0
  const pct = Math.min((attended / 10) * 100, 100)

  return (
    <div className="acc-page">
      {/* Header */}
      <div className="acc-header">
        <button className="acc-back" onClick={() => router.back()}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
        </button>
        <h1 className="acc-title">Account</h1>
      </div>

      <div className="acc-content">
        <p className="acc-subtitle">Manage your profile and preferences</p>

        {/* Profile card */}
        <div className="acc-card">
          <div className="acc-profile-row">
            <div className="acc-avatar-wrap">
              {session?.user?.image
                ? <Image src={session.user.image} alt="" width={52} height={52} className="acc-avatar" />
                : <div className="acc-avatar-fallback">{session?.user?.name?.[0] ?? '?'}</div>
              }
            </div>
            <div className="acc-profile-info">
              <p className="acc-name">{session?.user?.name ?? 'User'}</p>
              <p className="acc-email">{session?.user?.email}</p>
              <p className="acc-since">Since {formatMemberSince(stats?.memberSince ?? null)}</p>
            </div>
          </div>

          <button className="acc-edit-toggle" onClick={() => setEditOpen((v) => !v)}>
            <span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
              Edit Profile
            </span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: editOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}><polyline points="6 9 12 15 18 9" /></svg>
          </button>

          {editOpen && (
            <div className="acc-edit-form">
              <p className="acc-edit-note">Profile editing requires Google account settings. Your display name and photo are synced from Google.</p>
              <a href="https://myaccount.google.com" target="_blank" rel="noreferrer" className="btn-ghost" style={{ fontSize: 13, padding: '9px 16px' }}>
                Edit in Google Account →
              </a>
            </div>
          )}
        </div>

        {/* Loyalty Rewards */}
        <div className="acc-card">
          <h2 className="acc-card-title">Loyalty Rewards</h2>
          <div className="acc-loyalty-grid">
            <div className="acc-loyalty-stat">
              <p className="acc-loyalty-label">EVENTS</p>
              <p className="acc-loyalty-val">{attended}</p>
              <p className="acc-loyalty-sub">attended</p>
            </div>
            <div className="acc-loyalty-stat">
              <p className="acc-loyalty-label">DISCOUNT</p>
              <p className="acc-loyalty-val" style={{ color: discount > 0 ? 'var(--red)' : '#fff' }}>
                {discount}%
              </p>
              <p className="acc-loyalty-sub">at checkout</p>
            </div>
          </div>

          <div className="acc-progress-card">
            <div className="acc-progress-header">
              <span>Progress to Max Discount</span>
              <span>{attended} / 10</span>
            </div>
            <div className="acc-progress-bar">
              <div className="acc-progress-fill" style={{ width: `${pct}%` }} />
            </div>
            <p className="acc-progress-label">{stats?.progressLabel ?? '10 more events to reach 10% off'}</p>
          </div>
        </div>

        {/* Events Attended */}
        <div className="acc-card">
          <h2 className="acc-card-title">Events Attended</h2>
          <p className="acc-card-sub">{attended} event{attended !== 1 ? 's' : ''}</p>

          {attended === 0 ? (
            <div className="acc-empty">
              <div className="acc-empty-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z" />
                </svg>
              </div>
              <p className="acc-empty-title">No events yet</p>
              <p className="acc-empty-sub">Events you buy tickets to will appear here</p>
            </div>
          ) : (
            <p style={{ fontSize: 13, color: 'var(--gray)' }}>View in My Tickets</p>
          )}
        </div>

        {/* Membership */}
        <div className="acc-card">
          <h2 className="acc-card-title">Membership</h2>
          <p className="acc-card-label">Status</p>
          <span className="acc-membership-badge">Not Active</span>
        </div>

        {/* Actions */}
        <a href="mailto:support@metlanta.com" className="acc-action-btn">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
          Contact Support
        </a>

        <button className="acc-action-btn" onClick={() => signOut({ callbackUrl: '/' })}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
          Sign Out
        </button>

        <button className="acc-action-btn danger">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></svg>
          Delete Account
        </button>
      </div>
    </div>
  )
}
