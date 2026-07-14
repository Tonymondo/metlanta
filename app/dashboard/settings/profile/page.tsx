'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'

export default function ProfilePage() {
  const { data: session } = useSession()
  const [name, setName] = useState(session?.user?.name ?? '')
  const [instagram, setInstagram] = useState('')
  const [saved, setSaved] = useState(false)
  const publicUrl = `https://metlanta.app/profile/${session?.user?.name?.toLowerCase().replace(/\s+/g, '-') ?? 'you'}`

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    // persist via account API
    await fetch('/api/account', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, instagram }),
    }).catch(() => {})
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <>
      <div className="mpd-breadcrumb">
        <a href="/dashboard">Dashboard</a>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        <a href="/dashboard/settings">Settings</a>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        <span>Team Profile</span>
      </div>

      <form onSubmit={handleSave} className="mpd-form">
        {/* Public URL */}
        <div className="mpd-profile-row">
          <div className="mpd-profile-row-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
          </div>
          <div style={{ flex: 1 }}>
            <p className="mpd-profile-row-title">Public URL</p>
            <p style={{ fontSize: 13, color: 'var(--gray3)' }}>{publicUrl}</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="mpd-ghost-btn" onClick={() => navigator.clipboard.writeText(publicUrl)}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
            </button>
            <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="mpd-ghost-btn">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            </a>
            <button type="button" className="mpd-primary-btn">Share</button>
          </div>
        </div>

        {/* Name */}
        <div className="mpd-profile-row">
          <div className="mpd-profile-row-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>
          </div>
          <div style={{ flex: 1 }}>
            <p className="mpd-profile-row-title">Name</p>
            <p style={{ fontSize: 13, color: 'var(--gray3)', marginBottom: 10 }}>Shown on the public profile and across the app.</p>
            <input
              className="mpd-field-input"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your display name"
            />
          </div>
        </div>

        {/* Banner */}
        <div className="mpd-profile-row">
          <div className="mpd-profile-row-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          </div>
          <div style={{ flex: 1 }}>
            <p className="mpd-profile-row-title">Banner</p>
            <p style={{ fontSize: 13, color: 'var(--gray3)', marginBottom: 10 }}>Wide cover image (16:9 recommended).</p>
            <div className="mpd-banner-upload">
              <div className="mpd-banner-placeholder">
                <img src="/metlantalogo.png" alt="Metlanta" style={{ height: 48, opacity: 0.4 }} />
                <p style={{ fontSize: 13, color: 'var(--gray3)', marginTop: 8 }}>Click to upload a banner</p>
              </div>
              <button type="button" className="mpd-ghost-btn mpd-banner-replace">Replace</button>
            </div>
          </div>
        </div>

        {/* Profile picture */}
        <div className="mpd-profile-row">
          <div className="mpd-profile-row-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <div style={{ flex: 1 }}>
            <p className="mpd-profile-row-title">Profile Picture</p>
            <p style={{ fontSize: 13, color: 'var(--gray3)', marginBottom: 10 }}>Square avatar (1:1, at least 256×256).</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div className="mpd-avatar-upload">
                {session?.user?.image
                  ? <img src={session.user.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
                  : <span style={{ fontSize: 28, fontWeight: 800 }}>{(session?.user?.name ?? 'M')[0]}</span>
                }
              </div>
              <button type="button" className="mpd-ghost-btn">Replace</button>
            </div>
          </div>
        </div>

        {/* Instagram */}
        <div className="mpd-profile-row">
          <div className="mpd-profile-row-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
          </div>
          <div style={{ flex: 1 }}>
            <p className="mpd-profile-row-title">Instagram</p>
            <p style={{ fontSize: 13, color: 'var(--gray3)', marginBottom: 10 }}>Linked from your public profile.</p>
            <div className="mpd-instagram-wrap">
              <span style={{ color: 'var(--gray3)', fontSize: 14, flexShrink: 0 }}>@</span>
              <input className="mpd-field-input" value={instagram} onChange={e => setInstagram(e.target.value)} placeholder="handle" />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 8 }}>
          <button type="submit" className="mpd-primary-btn">
            {saved ? '✓ Saved' : 'Save Profile'}
          </button>
        </div>
      </form>
    </>
  )
}
