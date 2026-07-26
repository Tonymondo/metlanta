'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface PayoutRecord {
  id: string
  amount: number
  status: string
  arrival_date: string
  currency: string
}

interface PayoutsData {
  connected: boolean
  charges_enabled?: boolean
  payouts_enabled?: boolean
  balance: { available: number; pending: number; currency: string } | null
  totalEarned: number
  totalPaidOut: number
  payouts: PayoutRecord[]
  payout_schedule?: {
    interval: string
    delay_days: number
    weekly_anchor?: string
    monthly_anchor?: number
  } | null
}

const STATUS_COLORS: Record<string, string> = {
  paid:       '#22c55e',
  pending:    '#f59e0b',
  in_transit: '#3b82f6',
  canceled:   '#6b7280',
  failed:     '#ef4444',
}

function KpiCard({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div style={{
      background: '#161616', border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 14, padding: '22px 24px',
    }}>
      <p style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 10 }}>{label}</p>
      <p style={{ fontSize: 32, fontWeight: 900, letterSpacing: '-0.03em', color: '#fff', lineHeight: 1, marginBottom: 6 }}>{value}</p>
      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>{note}</p>
    </div>
  )
}

export default function AccountPage() {
  const router = useRouter()
  const [data, setData] = useState<PayoutsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [transferType, setTransferType] = useState<'standard' | 'instant'>('standard')
  const [amount, setAmount] = useState('')
  const [transferring, setTransferring] = useState(false)
  const [transferError, setTransferError] = useState<string | null>(null)
  const [transferSuccess, setTransferSuccess] = useState<string | null>(null)
  const [historyOpen, setHistoryOpen] = useState(false)

  useEffect(() => {
    fetch('/api/payouts')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setData(d) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const fmt = (n: number) => `$${(n ?? 0).toFixed(2)}`
  const available  = data?.balance?.available ?? 0
  const pending    = data?.balance?.pending ?? 0
  const totalEarned   = data?.totalEarned ?? 0
  const totalPaidOut  = data?.totalPaidOut ?? 0

  async function handleTransfer() {
    const amt = parseFloat(amount)
    if (!amt || amt <= 0) { setTransferError('Enter a valid amount.'); return }
    if (amt > available) { setTransferError('Amount exceeds available balance.'); return }
    setTransferring(true); setTransferError(null); setTransferSuccess(null)
    try {
      const res = await fetch('/api/payouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amt, method: transferType }),
      })
      const result = await res.json()
      if (!res.ok) setTransferError(result.error ?? 'Transfer failed.')
      else {
        setTransferSuccess(`Transfer of ${fmt(result.amount)} initiated! Arrives ${result.arrival_date}.`)
        setAmount('')
        fetch('/api/payouts').then(r => r.ok ? r.json() : null).then(d => { if (d) setData(d) })
      }
    } catch { setTransferError('Network error. Try again.') }
    setTransferring(false)
  }

  if (loading) {
    return <div className="mpd-spinner-wrap" style={{ minHeight: 300 }}><div className="dash-spinner" /></div>
  }

  /* ── Not connected ─────────────────────────────────────────────────────── */
  if (!data?.connected) {
    return (
      <>
        <div className="mpd-breadcrumb">
          <a href="/dashboard">Dashboard</a>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          <span>Account Balance</span>
        </div>

        {/* Monetization banner */}
        <div className="mpd-info-box" style={{ marginBottom: 20 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <div>
            <p style={{ fontWeight: 700, marginBottom: 4 }}>Monetization review required</p>
            <p>Set up Stripe from the dashboard overview to request monetization review. Reviews take 1–2 business days.</p>
          </div>
        </div>

        <div style={{ textAlign: 'center', paddingTop: 40 }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 20 }}>
            <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
          </svg>
          <p style={{ fontSize: 15, fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>Connect Stripe to unlock payouts</p>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', marginBottom: 24 }}>Link your bank account to receive payments from ticket sales.</p>
          <button className="mpd-primary-btn" onClick={() => router.push('/host/onboarding')}>
            Connect Stripe →
          </button>
        </div>
      </>
    )
  }

  /* ── Connected ─────────────────────────────────────────────────────────── */
  const schedule = data.payout_schedule
  const autoEnabled = schedule?.interval === 'daily' || schedule?.interval === 'weekly'

  return (
    <>
      <div className="mpd-breadcrumb">
        <a href="/dashboard">Dashboard</a>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        <span>Account Balance</span>
      </div>

      {/* Info boxes */}
      <div className="mpd-info-box" style={{ marginBottom: 12 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <div>
          <p style={{ fontWeight: 700, marginBottom: 2 }}>Monetization review required</p>
          <p>Set up Stripe from the dashboard overview to request monetization review. Reviews can take 1–2 business days.</p>
        </div>
      </div>
      <div className="mpd-info-box" style={{ marginBottom: 24 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <div>
          <p style={{ fontWeight: 700, marginBottom: 4 }}>Payout Options</p>
          <p><strong>Manual Instant Transfers:</strong> 5% fee, funds arrive in ~30 minutes.</p>
          <p><strong>Automatic Daily Transfers:</strong> NO fee, standard timing (2–5 business days).</p>
          <a href="/help" className="mpd-info-link" style={{ display: 'inline-block', marginTop: 6 }}>Learn more about account balance &amp; payouts →</a>
        </div>
      </div>

      {/* KPI 2x2 grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
        <KpiCard label="Available Balance"  value={fmt(available)}   note="Ready to withdraw" />
        <KpiCard label="Pending Balance"    value={fmt(pending)}     note="Processing payments" />
        <KpiCard label="Total Earned"       value={fmt(totalEarned)} note="Lifetime earnings" />
        <KpiCard label="Total Paid Out"     value={fmt(totalPaidOut)}note="Total withdrawals" />
      </div>

      {/* Automatic Payouts card */}
      <div style={{
        background: '#161616', border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 14, padding: '20px 24px', marginBottom: 14,
      }}>
        <p style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Automatic Payouts</p>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 16 }}>
          Daily standard transfers when balance is available (NO fee, 2–5 days)
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: autoEnabled ? '#22c55e' : 'rgba(255,255,255,0.4)' }}>
                {autoEnabled ? 'Enabled' : 'Disabled'}
              </span>
              {autoEnabled && schedule && (
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
                  · ${((data.balance?.available ?? 0) >= 100 ? 100 : data.balance?.available ?? 0).toFixed(0)} min
                </span>
              )}
            </div>
            {autoEnabled && (
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
                Next: {new Date(Date.now() + 86400000).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </p>
            )}
          </div>
          <a href="https://dashboard.stripe.com/settings/payouts" target="_blank" rel="noopener noreferrer"
            className="mpd-ghost-btn" style={{ textDecoration: 'none' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
            Configure
          </a>
        </div>
      </div>

      {/* Manual Transfer card */}
      <div style={{
        background: '#161616', border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 14, padding: '20px 24px', marginBottom: 14,
      }}>
        <p style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Manual Transfer</p>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 20 }}>Request a one-time payout to your linked bank account.</p>

        {/* Transfer type toggle */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
          {([
            { type: 'standard' as const, label: 'Standard', fee: 'No fee', eta: '2–5 days' },
            { type: 'instant'  as const, label: 'Instant',  fee: '5% fee', eta: '~30 min'  },
          ]).map(opt => (
            <button key={opt.type} onClick={() => setTransferType(opt.type)}
              style={{
                padding: '14px 16px', borderRadius: 12, cursor: 'pointer', textAlign: 'left',
                transition: 'all 0.15s', background: transferType === opt.type ? 'rgba(224,48,48,0.1)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${transferType === opt.type ? 'var(--red)' : 'rgba(255,255,255,0.08)'}`,
                fontFamily: 'var(--font)',
              }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 2 }}>{opt.label}</p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{opt.fee}</p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{opt.eta}</p>
            </button>
          ))}
        </div>

        {/* Amount */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', gap: 6,
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: 10, padding: '0 12px',
          }}>
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14 }}>$</span>
            <input
              type="number" min="0" step="0.01" value={amount} placeholder="0.00"
              onChange={e => setAmount(e.target.value)}
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: 14, fontFamily: 'var(--font)', padding: '12px 0' }}
            />
          </div>
          <button className="mpd-ghost-btn" onClick={() => setAmount(available.toFixed(2))}>Max</button>
        </div>

        {transferType === 'instant' && parseFloat(amount) > 0 && (
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginBottom: 12 }}>
            5% fee: {fmt(parseFloat(amount) * 0.05)} · You receive: {fmt(parseFloat(amount) * 0.95)}
          </p>
        )}

        {transferError && (
          <div style={{ fontSize: 13, color: '#ef4444', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '10px 14px', marginBottom: 12 }}>
            {transferError}
          </div>
        )}
        {transferSuccess && (
          <div style={{ fontSize: 13, color: '#22c55e', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 8, padding: '10px 14px', marginBottom: 12 }}>
            {transferSuccess}
          </div>
        )}

        <button
          className="mpd-primary-btn"
          style={{ width: '100%', justifyContent: 'center' }}
          onClick={handleTransfer}
          disabled={transferring || available === 0}>
          {transferring ? <span className="btn-spinner" /> : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/></svg>
              Request {transferType === 'instant' ? 'Instant' : 'Standard'} Payout
            </>
          )}
        </button>
        {available === 0 && <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', textAlign: 'center', marginTop: 8 }}>No available balance to withdraw.</p>}
      </div>

      {/* Payout History */}
      <div style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, overflow: 'hidden' }}>
        <button
          onClick={() => setHistoryOpen(v => !v)}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '18px 24px', background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: 'var(--font)', color: '#fff',
          }}>
          <div>
            <p style={{ fontSize: 15, fontWeight: 700, textAlign: 'left' }}>Payout History</p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', textAlign: 'left', marginTop: 2 }}>
              {data.payouts.length} record{data.payouts.length !== 1 ? 's' : ''}
            </p>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ transform: historyOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: 'rgba(255,255,255,0.4)', flexShrink: 0 }}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>

        {historyOpen && (
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            {data.payouts.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 13, padding: '28px 24px' }}>No payouts yet</p>
            ) : (
              data.payouts.map(p => (
                <div key={p.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: 13,
                }}>
                  <div>
                    <p style={{ fontWeight: 700, color: '#fff', marginBottom: 2 }}>{fmt(p.amount)}</p>
                    <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>
                      {new Date(p.arrival_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase',
                    color: STATUS_COLORS[p.status] ?? 'var(--gray3)',
                    background: `${STATUS_COLORS[p.status] ?? '#6b7280'}18`,
                    border: `1px solid ${STATUS_COLORS[p.status] ?? '#6b7280'}30`,
                    borderRadius: 6, padding: '3px 8px',
                  }}>
                    {p.status.replace(/_/g, ' ')}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </>
  )
}
