'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'

function SuccessContent() {
  const params = useSearchParams()
  const event = params.get('event') ?? 'your event'
  const tier = params.get('tier') ?? 'General'

  return (
    <main style={{
      minHeight: '100svh',
      background: '#000',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: 'var(--font-outfit, Outfit, system-ui, sans-serif)',
      textAlign: 'center',
    }}>
      {/* Glow */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at center, rgba(34,197,94,0.08) 0%, transparent 65%)',
      }} />

      {/* Check circle */}
      <div style={{
        width: 72, height: 72, borderRadius: '50%',
        background: 'rgba(34,197,94,0.12)',
        border: '2px solid rgba(34,197,94,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 28,
      }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>

      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: '#4ade80', marginBottom: 16 }}>
        You&apos;re in
      </div>

      <h1 style={{ fontSize: 'clamp(28px,6vw,52px)', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', marginBottom: 12, lineHeight: 1.1 }}>
        Ticket confirmed.
      </h1>

      <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', marginBottom: 8, maxWidth: 420, lineHeight: 1.7 }}>
        Your <strong style={{ color: '#fff' }}>{tier}</strong> ticket for{' '}
        <strong style={{ color: '#fff' }}>{event}</strong> is locked in.
        Check your email for your confirmation and QR code.
      </p>

      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)', marginBottom: 40 }}>
        Powered by Metlanta · Secured by Stripe
      </p>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link href="/#events" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '13px 26px', background: '#E03030', color: '#fff',
          fontSize: 14, fontWeight: 700, borderRadius: 10, textDecoration: 'none',
          transition: 'background 0.15s',
        }}>
          Find More Events
        </Link>
        <Link href="/" style={{
          display: 'inline-flex', alignItems: 'center',
          padding: '13px 24px', background: 'transparent', color: '#fff',
          fontSize: 14, fontWeight: 600, borderRadius: 10, textDecoration: 'none',
          border: '1px solid rgba(255,255,255,0.14)',
        }}>
          Back to Metlanta
        </Link>
      </div>
    </main>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <main style={{ minHeight: '100svh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'system-ui' }}>Loading...</div>
      </main>
    }>
      <SuccessContent />
    </Suspense>
  )
}
