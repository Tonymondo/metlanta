'use client'

import { useState, useEffect } from 'react'

const DATE_RANGE = (() => {
  const end = new Date()
  const start = new Date(); start.setDate(end.getDate() - 30)
  const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  return `${fmt(start)} - ${fmt(end)}`
})()

export default function DisputesPage() {
  const [filter, setFilter] = useState('all')
  const [disputes, setDisputes] = useState<{ id: string; amount: number; status: string; reason: string; created_at: string }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/chargebacks')
      .then(r => r.ok ? r.json() : { disputes: [] })
      .then(d => setDisputes(d.disputes ?? []))
      .finally(() => setLoading(false))
  }, [])

  const STATUSES = ['All statuses', 'needs_response', 'under_review', 'won', 'lost']

  return (
    <>
      <div className="mpd-breadcrumb">
        <a href="/dashboard">Dashboard</a>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        <span>Disputes</span>
      </div>

      {/* About disputes */}
      <div className="mpd-info-box" style={{ marginBottom: 24 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <div>
          <p style={{ fontWeight: 700, marginBottom: 2 }}>About Disputes</p>
          <p>Disputes occur when customers contact their bank to reverse a charge. Metlanta automatically submits evidence and tracks all disputes. <a href="/help" className="mpd-info-link">Learn more →</a></p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="mpd-kpi-grid" style={{ marginBottom: 24 }}>
        <div className="mpd-kpi">
          <div className="mpd-kpi-hd"><span>Active liability</span></div>
          <p className="mpd-kpi-val">$0.00</p>
          <p className="mpd-kpi-note">Exposure from open disputes</p>
        </div>
        <div className="mpd-kpi">
          <div className="mpd-kpi-hd"><span>Disputed in view</span></div>
          <p className="mpd-kpi-val">$0.00</p>
          <p className="mpd-kpi-note">0 open · 0 resolved</p>
        </div>
        <div className="mpd-kpi">
          <div className="mpd-kpi-hd"><span>Fees charged</span></div>
          <p className="mpd-kpi-val">$0.00</p>
          <p className="mpd-kpi-note">Net impact: $0.00</p>
        </div>
        <div className="mpd-kpi">
          <div className="mpd-kpi-hd"><span>Case flow</span></div>
          <div style={{ display: 'flex', gap: 24, marginTop: 8 }}>
            <div><p className="mpd-kpi-val">0</p><p className="mpd-kpi-note">Active</p></div>
            <div><p className="mpd-kpi-val">0</p><p className="mpd-kpi-note">Resolved</p></div>
          </div>
        </div>
      </div>

      {/* Analytics chart */}
      <div className="mpd-table-card" style={{ marginBottom: 20 }}>
        <div className="mpd-page-row" style={{ marginBottom: 16 }}>
          <div>
            <p style={{ fontWeight: 700, fontSize: 15 }}>Dispute Analytics</p>
            <p style={{ fontSize: 13, color: 'var(--gray3)' }}>Daily disputed amount and dispute count.</p>
          </div>
          <button className="mpd-date-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            {DATE_RANGE}
          </button>
        </div>
        <div style={{ height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: 'var(--gray3)', fontSize: 13 }}>No dispute activity for this period.</p>
        </div>
      </div>

      {/* Disputes table */}
      <div className="mpd-table-card">
        <div className="mpd-page-row" style={{ marginBottom: 16 }}>
          <div>
            <p style={{ fontWeight: 700, fontSize: 15 }}>Disputes</p>
            <p style={{ fontSize: 13, color: 'var(--gray3)' }}>Manage disputes and view their status.</p>
          </div>
          <select className="mpd-select-native" value={filter} onChange={e => setFilter(e.target.value)}>
            {STATUSES.map(s => <option key={s} value={s}>{s === 'all' ? 'All statuses' : s.replace(/_/g, ' ')}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="mpd-spinner-wrap"><div className="dash-spinner" /></div>
        ) : disputes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 24px' }}>
            <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>No disputes in this view</p>
            <p style={{ fontSize: 13, color: 'var(--gray3)' }}>Adjust the filters or check back after new orders.</p>
          </div>
        ) : (
          <table className="mpd-table">
            <thead>
              <tr><th>ID</th><th>Amount</th><th>Status</th><th>Reason</th><th>Created</th></tr>
            </thead>
            <tbody>
              {disputes.map(d => (
                <tr key={d.id}>
                  <td className="mpd-table-mono">{d.id.slice(0, 12)}</td>
                  <td>${d.amount?.toFixed(2)}</td>
                  <td><span className={`mpd-badge ${d.status}`}>{d.status?.replace(/_/g, ' ')}</span></td>
                  <td>{d.reason}</td>
                  <td>{new Date(d.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}
