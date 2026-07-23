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
  balance: { available: number; pending: number; currency: string } | null
  totalEarned: number
  totalPaidOut: number
  payouts: PayoutRecord[]
}

const STATUS_COLORS: Record<string, string> = {
  paid: '#22c55e',
  pending: '#f59e0b',
  in_transit: '#3b82f6',
  canceled: '#6b7280',
  failed: '#ef4444',
}

export default function AccountPage() {
  const router = useRouter()
  const [transferType, setTransferType] = useState<'standard' | 'instant'>('standard')
  const [amount, setAmount] = useState('')
  const [historyTab, setHistoryTab] = useState<'payouts'>('payouts')
  const [data, setData] = useState<PayoutsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [transferring, setTransferring] = useState(false)
  const [transferError, setTransferError] = useState<string | null>(null)
  const [transferSuccess, setTransferSuccess] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/payouts')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setData(d) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const fmt = (n: number) => `$${(n ?? 0).toFixed(2)}`
  const available = data?.balance?.available ?? 0
  const pending = data?.balance?.pending ?? 0
  const totalEarned = data?.totalEarned ?? 0
  const totalPaidOut = data?.totalPaidOut ?? 0

  async function handleTransfer() {
    const amt = parseFloat(amount)
    if (!amt || amt <= 0) { setTransferError('Enter a valid amount.'); return }
    if (amt > available) { setTransferError('Amount exceeds available balance.'); return }

    setTransferring(true)
    setTransferError(null)
    setTransferSuccess(null)

    try {
      const res = await fetch('/api/payouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amt, method: transferType }),
      })
      const result = await res.json()
      if (!res.ok) {
        setTransferError(result.error ?? 'Transfer failed. Try again.')
      } else {
        setTransferSuccess(`Transfer of ${fmt(result.amount)} initiated! Arrives ${result.arrival_date}.`)
        setAmount('')
        // Refresh data
        fetch('/api/payouts').then(r => r.ok ? r.json() : null).then(d => { if (d) setData(d) })
      }
    } catch {
      setTransferError('Network error. Check your connection and try again.')
    }
    setTransferring(false)
  }

  if (loading) {
    return (
      <div className="mpd-spinner-wrap" style={{ minHeight: 300 }}>
        <div className="dash-spinner" />
      </div>
    )
  }

  if (!data?.connected) {
    return (
      <>
        <div className="mpd-breadcrumb">
          <a href="/dashboard">Dashboard</a>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          <span>Account Balance</span>
        </div>

        <div className="mpd-empty-state" style={{ paddingTop: 60 }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 20 }}>
            <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
          </svg>
          <p className="mpd-empty-title" style={{ marginBottom: 8 }}>Connect Stripe to unlock payouts</p>
          <p className="mpd-empty-sub" style={{ marginBottom: 24 }}>Link your bank account to receive payments from ticket sales directly.</p>
          <button className="mpd-primary-btn" onClick={() => router.push('/host/onboarding')}>
            Connect Stripe →
          </button>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="mpd-breadcrumb">
        <a href="/dashboard">Dashboard</a>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        <span>Account Balance</span>
      </div>

      <div className="mpd-info-box" style={{ marginBottom: 24 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <div>
          <p style={{ fontWeight: 700, marginBottom: 4 }}>Payout Options</p>
          <p><strong>Standard:</strong> No fee — arrives in 2–5 business days.</p>
          <p><strong>Instant:</strong> 5% fee — arrives in ~30 minutes.</p>
        </div>
      </div>

      {/* Balance cards */}
      <div className="mpd-kpi-grid" style={{ marginBottom: 28 }}>
        {[
          { label: 'Available Balance', val: fmt(available), note: 'Ready to withdraw' },
          { label: 'Pending Balance', val: fmt(pending), note: 'Processing payments' },
          { label: 'Total Earned', val: fmt(totalEarned), note: 'Lifetime earnings' },
          { label: 'Total Paid Out', val: fmt(totalPaidOut), note: 'Total withdrawn' },
        ].map(c => (
          <div key={c.label} className="mpd-kpi">
            <div className="mpd-kpi-hd"><span>{c.label}</span></div>
            <p className="mpd-kpi-val">{c.val}</p>
            <p className="mpd-kpi-note">{c.note}</p>
          </div>
        ))}
      </div>

      {/* Two-col layout */}
      <div className="mpd-two-col">
        {/* Left: Transfer widget */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="mpd-card">
            <h3 className="mpd-card-title">Request a Payout</h3>
            <p className="mpd-card-sub">Transfer funds from your Metlanta balance to your linked bank account.</p>

            <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, marginTop: 20 }}>Transfer Type</p>
            <div className="mpd-transfer-grid">
              {([
                { type: 'standard' as const, icon: '💳', label: 'Standard', fee: 'No fee', eta: '2–5 days' },
                { type: 'instant' as const, icon: '⚡', label: 'Instant', fee: '5% fee', eta: '~30 minutes' },
              ]).map(opt => (
                <button
                  key={opt.type}
                  className={`mpd-transfer-opt${transferType === opt.type ? ' active' : ''}`}
                  onClick={() => setTransferType(opt.type)}
                >
                  <span style={{ fontSize: 20 }}>{opt.icon}</span>
                  <p style={{ fontWeight: 700, fontSize: 14 }}>{opt.label}</p>
                  <p style={{ fontSize: 12, color: 'var(--gray3)' }}>{opt.fee}</p>
                  <p style={{ fontSize: 12, color: 'var(--gray3)' }}>{opt.eta}</p>
                </button>
              ))}
            </div>

            <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, marginTop: 20 }}>Amount</p>
            <div className="mpd-amount-row">
              <div className="mpd-amount-input-wrap">
                <span style={{ color: 'var(--gray3)', fontSize: 14 }}>$</span>
                <input
                  className="mpd-amount-input"
                  type="number"
                  min="0"
                  step="0.01"
                  value={amount}
                  placeholder="0.00"
                  onChange={e => setAmount(e.target.value)}
                />
              </div>
              <button className="mpd-ghost-btn" onClick={() => setAmount(available.toFixed(2))}>Max</button>
            </div>

            {transferType === 'instant' && parseFloat(amount) > 0 && (
              <p style={{ fontSize: 12, color: 'var(--gray3)', marginTop: 8 }}>
                5% fee: {fmt(parseFloat(amount) * 0.05)} · You receive: {fmt(parseFloat(amount) * 0.95)}
              </p>
            )}

            {transferError && (
              <div style={{ fontSize: 13, color: '#ef4444', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '10px 14px', marginTop: 12 }}>
                {transferError}
              </div>
            )}
            {transferSuccess && (
              <div style={{ fontSize: 13, color: '#22c55e', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 8, padding: '10px 14px', marginTop: 12 }}>
                {transferSuccess}
              </div>
            )}

            <button
              className="mpd-primary-btn"
              style={{ width: '100%', justifyContent: 'center', marginTop: 16 }}
              onClick={handleTransfer}
              disabled={transferring || available === 0}
            >
              {transferring ? <span className="btn-spinner" /> : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/></svg>
                  Request {transferType === 'standard' ? 'Standard' : 'Instant'} Payout
                </>
              )}
            </button>
            {available === 0 && (
              <p style={{ fontSize: 12, color: 'var(--gray3)', textAlign: 'center', marginTop: 8 }}>No available balance to withdraw.</p>
            )}
          </div>
        </div>

        {/* Right: Payout History */}
        <div className="mpd-card" style={{ minHeight: 300 }}>
          <h3 className="mpd-card-title">Payout History</h3>
          <p className="mpd-card-sub" style={{ marginBottom: 16 }}>Your recent payout records</p>

          {data.payouts.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--gray3)', fontSize: 13, paddingTop: 24 }}>
              No payouts yet
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {data.payouts.map(p => (
                <div key={p.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.06)',
                  fontSize: 13,
                }}>
                  <div>
                    <p style={{ fontWeight: 600, color: '#fff', marginBottom: 2 }}>
                      {fmt(p.amount)}
                    </p>
                    <p style={{ color: 'var(--gray3)', fontSize: 12 }}>
                      {new Date(p.arrival_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: 700, letterSpacing: '0.04em',
                    textTransform: 'uppercase', color: STATUS_COLORS[p.status] ?? 'var(--gray3)',
                    background: `${STATUS_COLORS[p.status] ?? '#6b7280'}18`,
                    border: `1px solid ${STATUS_COLORS[p.status] ?? '#6b7280'}30`,
                    borderRadius: 6, padding: '3px 8px',
                  }}>
                    {p.status.replace(/_/g, ' ')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
