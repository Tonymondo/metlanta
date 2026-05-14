'use client'

import { useState, useEffect } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function LoginPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [role, setRole] = useState<'attendee' | 'host'>('attendee')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'authenticated') {
      router.push(session?.user?.role === 'host' ? '/dashboard' : '/')
    }
  }, [status, session, router])

  async function handleGoogle() {
    setLoading(true)
    await signIn('google', { callbackUrl: '/' })
  }

  async function handleCredentials(e: React.FormEvent) {
    e.preventDefault()
    setError('Email/password login requires database setup. Please use Google Sign-In for now.')
  }

  if (status === 'loading') {
    return (
      <div className="login-loading">
        <div className="login-spinner" />
      </div>
    )
  }

  return (
    <div className="login-page">
      {/* Ambient bg */}
      <div className="login-orb login-orb-1" aria-hidden />
      <div className="login-orb login-orb-2" aria-hidden />

      {/* Card */}
      <div className="login-card">
        {/* Logo */}
        <a href="/" className="login-logo">
          <div className="login-logo-img-wrap">
            <Image src="/logo.png" alt="Metlanta" width={54} height={24} />
          </div>
          <span className="login-logo-text">Metlanta</span>
        </a>

        <h1 className="login-title">
          {mode === 'login' ? 'Welcome back.' : 'Join Metlanta.'}
        </h1>
        <p className="login-sub">
          {mode === 'login'
            ? 'Log in to discover events and manage your tickets.'
            : 'Create an account to buy tickets or start hosting.'}
        </p>

        {/* Role selector — only on signup */}
        {mode === 'signup' && (
          <div className="login-roles">
            <button
              className={`login-role-btn${role === 'attendee' ? ' active' : ''}`}
              onClick={() => setRole('attendee')}
              type="button"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
              </svg>
              Attendee
            </button>
            <button
              className={`login-role-btn${role === 'host' ? ' active' : ''}`}
              onClick={() => setRole('host')}
              type="button"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              Host / Promoter
            </button>
          </div>
        )}

        {/* Google button */}
        <button
          className="login-google-btn"
          onClick={handleGoogle}
          disabled={loading}
          type="button"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Continue with Google
        </button>

        <div className="login-divider">
          <div className="login-divider-line" />
          <span>or</span>
          <div className="login-divider-line" />
        </div>

        {/* Email form */}
        <form className="login-form" onSubmit={handleCredentials}>
          <div className="login-field">
            <label>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="login-field">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="login-error">{error}</p>}

          <button type="submit" className="login-submit" disabled={loading}>
            {mode === 'login' ? 'Log In' : 'Create Account'}
          </button>
        </form>

        <p className="login-switch">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button type="button" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError('') }}>
            {mode === 'login' ? 'Sign up' : 'Log in'}
          </button>
        </p>
      </div>
    </div>
  )
}
