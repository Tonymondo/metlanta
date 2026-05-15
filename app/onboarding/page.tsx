'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

type Role = 'attendee' | 'host' | 'promoter'

interface RoleOption {
  id: Role
  icon: React.ReactNode
  title: string
  subtitle: string
  description: string
  perks: string[]
  popular?: boolean
}

const roles: RoleOption[] = [
  {
    id: 'attendee',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z"/>
      </svg>
    ),
    title: 'Discover & Attend',
    subtitle: 'ATTENDEE',
    description: 'Find the hottest events in Atlanta. Buy tickets, follow hosts, save events.',
    perks: ['Browse all events', 'Buy tickets instantly', 'Follow your favorite hosts', 'Save events for later'],
  },
  {
    id: 'host',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
    title: 'Host & Monetize',
    subtitle: 'HOST',
    description: 'Create events, sell tickets, get paid same night.',
    perks: ['Create unlimited events', 'Set your own prices', 'Manage attendees', 'SMS your crowd', 'Real-time revenue tracking'],
    popular: true,
  },
  {
    id: 'promoter',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 11l19-9-9 19-2-8-8-2z"/>
      </svg>
    ),
    title: 'Promote & Grow',
    subtitle: 'PROMOTER',
    description: 'Help market events and build your following.',
    perks: ['Curate events to your profile', 'Build your audience', 'Early access to promoter earnings'],
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
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong.')
        return
      }
      if (selected === 'host' || selected === 'promoter') {
        router.push('/dashboard')
      } else {
        router.push('/')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="onboarding-page">
      {/* Background glow */}
      <div className="onboarding-glow" aria-hidden />

      <div className="onboarding-inner">
        {/* Header */}
        <div className="onboarding-header">
          <img src="/metlantalogo.png" alt="Metlanta" className="onboarding-logo" />
          <h1 className="onboarding-title">How will you use Metlanta?</h1>
          <p className="onboarding-sub">
            {session?.user?.name ? `Welcome, ${session.user.name.split(' ')[0]}. ` : ''}
            Pick your role to get started.
          </p>
        </div>

        {/* Role cards */}
        <div className="role-cards">
          {roles.map((role) => (
            <button
              key={role.id}
              className={`role-card${selected === role.id ? ' active' : ''}`}
              onClick={() => setSelected(role.id)}
              type="button"
            >
              {role.popular && (
                <span className="role-card-badge">Most Popular</span>
              )}
              <div className="role-card-icon">{role.icon}</div>
              <p className="role-card-eyebrow">{role.subtitle}</p>
              <h2 className="role-card-title">{role.title}</h2>
              <p className="role-card-desc">{role.description}</p>
              <ul className="role-card-perks">
                {role.perks.map((perk) => (
                  <li key={perk} className="role-card-perk">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    {perk}
                  </li>
                ))}
              </ul>
              <div className={`role-card-select${selected === role.id ? ' checked' : ''}`}>
                {selected === role.id ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                ) : null}
              </div>
            </button>
          ))}
        </div>

        {/* Profile form — shown after role selected */}
        {selected && (
          <form className="onboarding-form" onSubmit={handleSubmit}>
            <div className="onboarding-form-inner">
              <h3 className="onboarding-form-title">Set up your profile</h3>

              <div className="onboarding-field">
                <label htmlFor="ob-username">Username *</label>
                <div className="onboarding-input-wrap">
                  <span className="onboarding-input-prefix">@</span>
                  <input
                    id="ob-username"
                    type="text"
                    placeholder="yourhandle"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.replace(/[^a-z0-9_]/gi, '').toLowerCase())}
                    required
                    maxLength={30}
                    autoFocus
                  />
                </div>
              </div>

              <div className="onboarding-field">
                <label htmlFor="ob-bio">Bio <span className="onboarding-optional">(optional)</span></label>
                <textarea
                  id="ob-bio"
                  placeholder="Tell the Atlanta scene who you are…"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  maxLength={200}
                />
              </div>

              {error && <p className="onboarding-error">{error}</p>}

              <button
                type="submit"
                className="btn-primary onboarding-submit"
                disabled={loading || !username.trim()}
              >
                {loading ? <span className="btn-spinner" /> : "Let's Go →"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
