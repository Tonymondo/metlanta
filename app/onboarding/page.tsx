'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

type Role = 'attendee' | 'host' | 'promoter'

const ROLES = [
  {
    id: 'attendee' as Role,
    eyebrow: 'DISCOVER & ATTEND',
    tagline: 'Find your vibe.',
    desc: 'The hottest events in Atlanta, all in one place. Buy tickets, follow hosts, build your nightlife.',
    perks: ['Instant ticket purchasing', 'Follow top hosts', 'Save events & get reminders'],
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
      </svg>
    ),
    accent: 'rgba(99,179,237,0.15)',
    glowColor: 'rgba(99,179,237,0.25)',
    borderActive: 'rgba(99,179,237,0.6)',
  },
  {
    id: 'host' as Role,
    eyebrow: 'HOST & MONETIZE',
    tagline: 'Own the night.',
    desc: 'Create events, sell tickets, get paid. The complete platform for Atlanta\'s next generation of hosts.',
    perks: ['Create & publish events', 'Real-time revenue tracking', 'SMS your attendees direct'],
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    ),
    accent: 'rgba(224,48,48,0.18)',
    glowColor: 'rgba(224,48,48,0.35)',
    borderActive: 'rgba(224,48,48,0.8)',
    popular: true,
  },
  {
    id: 'promoter' as Role,
    eyebrow: 'PROMOTE & GROW',
    tagline: 'Build your legacy.',
    desc: 'Curate the culture. Market events, grow your following, and become Atlanta\'s go-to promoter.',
    perks: ['Curate events to your profile', 'Build your audience fast', 'Early promoter earnings access'],
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>
      </svg>
    ),
    accent: 'rgba(168,85,247,0.15)',
    glowColor: 'rgba(168,85,247,0.28)',
    borderActive: 'rgba(168,85,247,0.7)',
  },
]

export default function OnboardingPage() {
  const { data: session } = useSession()
  const router = useRouter()

  const [selected, setSelected] = useState<Role | null>(null)
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [splineLoaded, setSplineLoaded] = useState(false)
  const formRef = useRef<HTMLDivElement>(null)

  // Scroll to form on mobile when role selected
  useEffect(() => {
    if (selected && formRef.current) {
      setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 120)
    }
  }, [selected])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selected || !username.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: selected,
          username: username.trim().toLowerCase(),
          display_name: session?.user?.name ?? '',
          bio: bio.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Something went wrong.'); return }
      router.push(selected === 'host' || selected === 'promoter' ? '/dashboard' : '/')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const firstName = session?.user?.name?.split(' ')[0] ?? null

  return (
    <div className="ob-page">

      {/* ── Spline atmosphere ─────────────────────────────────── */}
      <div className={`ob-spline-wrap${splineLoaded ? ' ob-spline-visible' : ''}`} aria-hidden>
        <iframe
          src="https://my.spline.design/3stepmenuwithgradientmask-qIpuS2ffQmyD0YMfwQx8ktFk-hFf/"
          frameBorder="0"
          width="100%"
          height="100%"
          loading="lazy"
          onLoad={() => setSplineLoaded(true)}
          title="background"
          tabIndex={-1}
        />
      </div>

      {/* Bottom atmosphere fade */}
      <div className="ob-fade-bottom" aria-hidden />
      <div className="ob-fade-top" aria-hidden />

      {/* ── Content ───────────────────────────────────────────── */}
      <div className="ob-content">

        {/* Logo */}
        <div className="ob-logo-wrap">
          <img src="/metlantalogo.png" alt="Metlanta" className="ob-logo" />
        </div>

        {/* Headline */}
        <div className="ob-headline">
          <p className="ob-eyebrow">
            <span className="ob-eyebrow-dot" />
            {firstName ? `Welcome, ${firstName}` : 'Welcome to Metlanta'}
          </p>
          <h1 className="ob-title">Choose your identity<br />in the culture.</h1>
          <p className="ob-sub">Every movement needs its people. Who are you?</p>
        </div>

        {/* ── Role panels ────────────────────────────────────── */}
        <div className="ob-roles">
          {ROLES.map((role) => {
            const isSelected = selected === role.id
            const isDimmed = selected !== null && !isSelected
            return (
              <button
                key={role.id}
                className={`ob-role${isSelected ? ' ob-role-active' : ''}${isDimmed ? ' ob-role-dim' : ''}`}
                onClick={() => setSelected(role.id)}
                type="button"
                style={{
                  '--role-accent': role.accent,
                  '--role-glow': role.glowColor,
                  '--role-border': role.borderActive,
                } as React.CSSProperties}
              >
                {role.popular && (
                  <span className="ob-role-badge">Most Popular</span>
                )}

                {/* Icon */}
                <div className="ob-role-icon">
                  {role.icon}
                </div>

                {/* Text */}
                <p className="ob-role-eyebrow">{role.eyebrow}</p>
                <h2 className="ob-role-title">{role.tagline}</h2>
                <p className="ob-role-desc">{role.desc}</p>

                {/* Perks */}
                <ul className="ob-role-perks">
                  {role.perks.map((p) => (
                    <li key={p}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      {p}
                    </li>
                  ))}
                </ul>

                {/* Select indicator */}
                <div className="ob-role-check">
                  {isSelected
                    ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/></svg>
                  }
                  <span>{isSelected ? 'Selected' : 'Select'}</span>
                </div>
              </button>
            )
          })}
        </div>

        {/* ── Profile form ────────────────────────────────────── */}
        <div
          ref={formRef}
          className={`ob-form-wrap${selected ? ' ob-form-visible' : ''}`}
        >
          <form className="ob-form" onSubmit={handleSubmit}>
            <div className="ob-form-header">
              <h3 className="ob-form-title">Set up your profile</h3>
              <p className="ob-form-sub">You can always change this later.</p>
            </div>

            <div className="ob-field">
              <label htmlFor="ob-username">Username</label>
              <div className="ob-input-wrap">
                <span className="ob-input-prefix">@</span>
                <input
                  id="ob-username"
                  type="text"
                  placeholder="yourhandle"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.replace(/[^a-z0-9_]/gi, '').toLowerCase())}
                  required
                  maxLength={30}
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>
            </div>

            <div className="ob-field">
              <label htmlFor="ob-bio">
                Bio <span className="ob-optional">(optional)</span>
              </label>
              <textarea
                id="ob-bio"
                placeholder="Tell Atlanta who you are…"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={2}
                maxLength={200}
              />
            </div>

            {error && <p className="ob-error">{error}</p>}

            <button
              type="submit"
              className="ob-submit"
              disabled={loading || !username.trim()}
            >
              {loading
                ? <span className="btn-spinner" />
                : <>Enter Metlanta <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg></>
              }
            </button>
          </form>
        </div>

      </div>
    </div>
  )
}
