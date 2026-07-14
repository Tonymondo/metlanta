'use client'

import { useState, useEffect, useRef } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Suspense } from 'react'

type Tab = 'email' | 'phone'
type PhoneStep = 'enter' | 'verify'

function RegisterInner() {
  const { status } = useSession()
  const router = useRouter()

  const [tab, setTab] = useState<Tab>('email')
  const [phoneStep, setPhoneStep] = useState<PhoneStep>('enter')

  // Email form
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [emailLoading, setEmailLoading] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [googleLoading, setGoogleLoading] = useState(false)

  // Phone form
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [phoneLoading, setPhoneLoading] = useState(false)
  const [phoneError, setPhoneError] = useState('')
  const [resendCountdown, setResendCountdown] = useState(0)
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (status === 'authenticated') router.push('/')
  }, [status, router])

  useEffect(() => {
    if (resendCountdown <= 0) return
    const t = setTimeout(() => setResendCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [resendCountdown])

  async function handleEmailRegister(e: React.FormEvent) {
    e.preventDefault()
    setEmailError(''); setEmailLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })
      const data = await res.json()
      if (!res.ok) { setEmailError(data.error ?? 'Registration failed'); return }

      // Auto sign in after register
      const signInRes = await signIn('email-password', { email, password, redirect: false })
      if (signInRes?.ok) router.push('/onboarding')
      else setEmailError('Account created. Please log in.')
    } catch { setEmailError('Network error. Please try again.') }
    finally { setEmailLoading(false) }
  }

  async function handleSendOTP(e: React.FormEvent) {
    e.preventDefault()
    setPhoneError(''); setPhoneLoading(true)
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      })
      const data = await res.json()
      if (!res.ok) { setPhoneError(data.error ?? 'Failed to send code'); return }
      setPhoneStep('verify')
      setResendCountdown(30)
      setTimeout(() => otpRefs.current[0]?.focus(), 100)
    } catch { setPhoneError('Network error. Please try again.') }
    finally { setPhoneLoading(false) }
  }

  async function handleVerifyOTP(e: React.FormEvent) {
    e.preventDefault()
    const code = otp.join('')
    if (code.length < 6) { setPhoneError('Enter the 6-digit code.'); return }
    setPhoneError(''); setPhoneLoading(true)
    const res = await signIn('phone-otp', { phone, otp: code, redirect: false })
    setPhoneLoading(false)
    if (res?.error) {
      setPhoneError('Invalid or expired code.')
      setOtp(['', '', '', '', '', ''])
      otpRefs.current[0]?.focus()
    } else if (res?.ok) {
      router.push('/onboarding')
    }
  }

  function handleOtpChange(val: string, idx: number) {
    if (!/^\d*$/.test(val)) return
    const next = [...otp]; next[idx] = val.slice(-1); setOtp(next)
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus()
  }
  function handleOtpKey(e: React.KeyboardEvent, idx: number) {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) otpRefs.current[idx - 1]?.focus()
  }
  function handleOtpPaste(e: React.ClipboardEvent) {
    e.preventDefault()
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const next = [...otp]; digits.split('').forEach((d, i) => { next[i] = d }); setOtp(next)
    otpRefs.current[Math.min(digits.length, 5)]?.focus()
  }

  if (status === 'loading') return <div className="auth-page"><div className="dash-spinner" /></div>

  return (
    <div className="auth-page">
      {/* Nav */}
      <header className="auth-nav">
        <a href="/" className="auth-nav-brand">
          <img src="/metlantalogo.png" alt="Metlanta" className="auth-nav-logo" />
        </a>
        <nav className="auth-nav-links">
          <a href="#events">Events</a>
          <a href="/explore">Explore</a>
          <a href="/marketplace">Marketplace</a>
        </nav>
      </header>

      <div className="auth-center">
        {/* Tab toggle */}
        <div className="auth-tabs">
          <button className={`auth-tab${tab === 'email' ? ' active' : ''}`} onClick={() => { setTab('email'); setEmailError('') }}>Email</button>
          <button className={`auth-tab${tab === 'phone' ? ' active' : ''}`} onClick={() => { setTab('phone'); setPhoneError(''); setPhoneStep('enter') }}>Phone</button>
        </div>

        <div className="auth-card">
          {/* ── EMAIL TAB ── */}
          {tab === 'email' && (
            <form onSubmit={handleEmailRegister}>
              <h2 className="auth-card-title">Register</h2>
              <p className="auth-card-sub">Create your account.</p>

              <div className="auth-field">
                <label>Name</label>
                <input type="text" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} autoComplete="name" />
              </div>

              <div className="auth-field">
                <label>Email</label>
                <input type="email" placeholder="johndoe@gmail.com" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
              </div>

              <div className="auth-field">
                <label>Password</label>
                <div className="auth-pass-wrap">
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="Min. 8 characters"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    minLength={8}
                    autoComplete="new-password"
                  />
                  <button type="button" className="auth-pass-toggle" onClick={() => setShowPass(v => !v)} tabIndex={-1}>
                    {showPass
                      ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    }
                  </button>
                </div>
              </div>

              {emailError && <p className="auth-error">{emailError}</p>}

              <button type="submit" className="auth-submit" disabled={emailLoading}>
                {emailLoading ? <span className="btn-spinner" /> : 'Create Account'}
              </button>

              <div className="auth-divider"><span>or</span></div>

              <button
                type="button"
                className="auth-google-btn"
                onClick={() => { setGoogleLoading(true); signIn('google', { callbackUrl: '/onboarding' }) }}
                disabled={googleLoading}
              >
                {googleLoading ? <span className="btn-spinner" style={{ borderColor: 'rgba(0,0,0,0.2)', borderTopColor: '#333' }} /> : (
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                )}
                Continue with Google
              </button>

              <p className="auth-switch">Already have an account? <a href="/login">Login</a></p>
            </form>
          )}

          {/* ── PHONE TAB ── */}
          {tab === 'phone' && phoneStep === 'enter' && (
            <form onSubmit={handleSendOTP}>
              <h2 className="auth-card-title">Phone</h2>
              <p className="auth-card-sub">Register with your phone number.</p>

              <div className="auth-field">
                <label>Phone Number</label>
                <div className="auth-phone-wrap">
                  <div className="auth-phone-flag">
                    <span>🇺🇸</span>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                  </div>
                  <input type="tel" placeholder="Enter a phone number" value={phone} onChange={e => setPhone(e.target.value)} required autoComplete="tel" className="auth-phone-input" />
                </div>
              </div>

              {phoneError && <p className="auth-error">{phoneError}</p>}

              <button type="submit" className="auth-submit" disabled={phoneLoading}>
                {phoneLoading ? <span className="btn-spinner" /> : 'Send Code'}
              </button>

              <p className="auth-switch">Already have an account? <a href="/login">Login</a></p>
            </form>
          )}

          {tab === 'phone' && phoneStep === 'verify' && (
            <form onSubmit={handleVerifyOTP}>
              <h2 className="auth-card-title">Enter Code</h2>
              <p className="auth-card-sub">We sent a 6-digit code to <strong>+1 {phone}</strong></p>

              <div className="auth-field" style={{ marginTop: 20 }}>
                <label>Verification Code</label>
                <div className="auth-otp-row">
                  {otp.map((digit, i) => (
                    <input key={i} ref={el => { otpRefs.current[i] = el }} type="text" inputMode="numeric" maxLength={1}
                      className="auth-otp-box" value={digit}
                      onChange={e => handleOtpChange(e.target.value, i)}
                      onKeyDown={e => handleOtpKey(e, i)}
                      onPaste={i === 0 ? handleOtpPaste : undefined}
                    />
                  ))}
                </div>
              </div>

              {phoneError && <p className="auth-error">{phoneError}</p>}

              <button type="submit" className="auth-submit" disabled={phoneLoading || otp.join('').length < 6}>
                {phoneLoading ? <span className="btn-spinner" /> : 'Verify & Create Account'}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
                <button type="button" className="auth-text-btn" onClick={() => setPhoneStep('enter')}>← Change number</button>
                {resendCountdown > 0
                  ? <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>Resend in {resendCountdown}s</span>
                  : <button type="button" className="auth-text-btn" onClick={handleSendOTP}>Resend code</button>
                }
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return <Suspense><RegisterInner /></Suspense>
}
