'use client'

import { useState, useEffect } from 'react'

export default function AccountPage() {
  const [transferType, setTransferType] = useState<'standard' | 'instant'>('standard')
  const [amount, setAmount] = useState('100.00')
  const [historyTab, setHistoryTab] = useState<'adjustments' | 'payouts'>('adjustments')
  const [payouts, setPayouts] = useState<{ available: number; pending: number; total: number; paid: number }>({ available: 0, pending: 0, total: 0, paid: 0 })

  useEffect(() => {
    fetch('/api/payouts')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setPayouts(d) })
      .catch(() => {})
  }, [])

  const fmt = (n: number) => `$${n.toFixed(2)}`

  return (
    <>
      <div className="mpd-breadcrumb">
        <a href="/dashboard">Dashboard</a>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        <span>Account Balance</span>
      </div>

      {/* Info notices */}
      <div className="mpd-info-box" style={{ marginBottom: 12 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <div>
          <p style={{ fontWeight: 700, marginBottom: 2 }}>Monetization review required</p>
          <p>Set up Stripe from the dashboard overview to request monetization review. Reviews take 1–2 business days.</p>
        </div>
      </div>
      <div className="mpd-info-box" style={{ marginBottom: 24 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <div>
          <p style={{ fontWeight: 700, marginBottom: 4 }}>Payout Options</p>
          <p><strong>Manual Instant Transfers:</strong> 5% fee, funds arrive in ~30 minutes.</p>
          <p><strong>Automatic Daily Transfers:</strong> NO fee, standard timing (2–5 business days).</p>
          <a href="/help" className="mpd-info-link">Learn more about account balance &amp; payouts →</a>
        </div>
      </div>

      {/* Balance cards */}
      <div className="mpd-kpi-grid" style={{ marginBottom: 28 }}>
        {[
          { label: 'Available Balance', val: fmt(payouts.available), note: 'Ready to withdraw' },
          { label: 'Pending Balance', val: fmt(payouts.pending), note: 'Processing payments' },
          { label: 'Total Earned', val: fmt(payouts.total), note: 'Lifetime earnings' },
          { label: 'Total Paid Out', val: fmt(payouts.paid), note: 'Total withdrawals' },
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
        {/* Left: Automatic Payouts + Manual Transfer */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="mpd-card">
            <h3 className="mpd-card-title">Automatic Payouts</h3>
            <p className="mpd-card-sub">Daily standard transfers when balance is available (NO fee, 2–5 days)</p>
            <div className="mpd-auto-row">
              <div>
                <p style={{ fontWeight: 700, fontSize: 14 }}>Disabled</p>
                <p style={{ fontSize: 12, color: 'var(--gray3)' }}>Enable automatic daily payouts</p>
              </div>
              <button className="mpd-ghost-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg>
                Configure
              </button>
            </div>
          </div>

          <div className="mpd-card">
            <h3 className="mpd-card-title">Manual Transfer</h3>
            <p className="mpd-card-sub">Request a one-time payout to your bank account</p>
            <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, marginTop: 16 }}>Transfer Type</p>
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
            <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, marginTop: 16 }}>Amount to Transfer</p>
            <div className="mpd-amount-row">
              <div className="mpd-amount-input-wrap">
                <span style={{ color: 'var(--gray3)', fontSize: 14 }}>$</span>
                <input className="mpd-amount-input" type="number" min="0" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} />
              </div>
              <button className="mpd-ghost-btn" onClick={() => setAmount(payouts.available.toFixed(2))}>Max</button>
            </div>
            <button className="mpd-primary-btn" style={{ width: '100%', justifyContent: 'center', marginTop: 16 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/></svg>
              Request {transferType === 'standard' ? 'Standard' : 'Instant'} Transfer
            </button>
            <a href="/help" className="mpd-info-link" style={{ display: 'block', marginTop: 12, textAlign: 'center' }}>Learn more about payout options</a>
          </div>
        </div>

        {/* Right: Transaction History */}
        <div className="mpd-card" style={{ minHeight: 300 }}>
          <h3 className="mpd-card-title">Transaction History</h3>
          <p className="mpd-card-sub" style={{ marginBottom: 16 }}>View all balance adjustments and payout records</p>
          <div className="mpd-tabs" style={{ marginBottom: 20 }}>
            <button className={`mpd-tab${historyTab === 'adjustments' ? ' active' : ''}`} onClick={() => setHistoryTab('adjustments')} style={{ flex: 1, justifyContent: 'center' }}>Adjustments</button>
            <button className={`mpd-tab${historyTab === 'payouts' ? ' active' : ''}`} onClick={() => setHistoryTab('payouts')} style={{ flex: 1, justifyContent: 'center' }}>Payouts</button>
          </div>
          <p style={{ textAlign: 'center', color: 'var(--gray3)', fontSize: 13, paddingTop: 24 }}>
            {historyTab === 'adjustments' ? 'No adjustments yet' : 'No payouts yet'}
          </p>
        </div>
      </div>
    </>
  )
}
