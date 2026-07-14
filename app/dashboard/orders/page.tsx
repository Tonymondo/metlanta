'use client'

import { useState, useEffect } from 'react'

interface Order {
  id: string
  uuid: string
  amount: number
  status: string
  event_name: string
  customer_name: string
  customer_email: string
  purchased_at: string
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [page, setPage] = useState(0)
  const PER = 20

  useEffect(() => {
    fetch('/api/customers')
      .then(r => r.ok ? r.json() : { orders: [] })
      .then(d => setOrders(d.orders ?? []))
      .finally(() => setLoading(false))
  }, [])

  const filtered = orders.filter(o =>
    !search || [o.id, o.uuid, o.event_name, o.customer_name, o.customer_email].some(v => v?.toLowerCase().includes(search.toLowerCase()))
  )
  const paged = filtered.slice(page * PER, (page + 1) * PER)
  const allChecked = paged.length > 0 && paged.every(o => selected.has(o.id))

  function toggleAll() {
    const next = new Set(selected)
    if (allChecked) paged.forEach(o => next.delete(o.id))
    else paged.forEach(o => next.add(o.id))
    setSelected(next)
  }
  function toggle(id: string) {
    const next = new Set(selected)
    next.has(id) ? next.delete(id) : next.add(id)
    setSelected(next)
  }

  return (
    <>
      <div className="mpd-banner">
        <div>
          <p className="mpd-banner-title">Complete your Stripe setup</p>
          <p className="mpd-banner-sub">Connect Stripe to start accepting payments for your events.</p>
        </div>
        <a href="/dashboard/settings" className="mpd-banner-btn">Set up Stripe</a>
      </div>

      <div className="mpd-breadcrumb">
        <a href="/dashboard">Dashboard</a>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        <span>Orders</span>
      </div>

      <div className="mpd-page-row" style={{ alignItems: 'flex-end' }}>
        <div>
          <h2 className="mpd-section-title">Orders</h2>
          <p className="mpd-section-sub">Search, review, and refund purchases.</p>
        </div>
        <button className="mpd-ghost-btn" disabled={selected.size === 0}>Refund</button>
      </div>

      <div className="mpd-table-card">
        <div className="mpd-search-row">
          <div className="mpd-search-wrap">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input
              className="mpd-search-input"
              placeholder="Search event, name, ID, payment intent..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(0) }}
            />
          </div>
        </div>

        {loading ? (
          <div className="mpd-spinner-wrap"><div className="dash-spinner" /></div>
        ) : (
          <>
            <div className="mpd-table-wrap">
              <table className="mpd-table">
                <thead>
                  <tr>
                    <th><input type="checkbox" checked={allChecked} onChange={toggleAll} /></th>
                    <th>ID</th>
                    <th>UUID</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Event Name</th>
                    <th>Customer Name</th>
                    <th>Purchased At</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.length === 0 ? (
                    <tr><td colSpan={8} className="mpd-table-empty">No orders found.</td></tr>
                  ) : paged.map(o => (
                    <tr key={o.id} className={selected.has(o.id) ? 'selected' : ''}>
                      <td><input type="checkbox" checked={selected.has(o.id)} onChange={() => toggle(o.id)} /></td>
                      <td className="mpd-table-mono">{o.id.slice(0, 8)}</td>
                      <td className="mpd-table-mono">{o.uuid?.slice(0, 12) ?? '—'}</td>
                      <td>${o.amount?.toFixed(2) ?? '0.00'}</td>
                      <td><span className={`mpd-badge ${o.status}`}>{o.status}</span></td>
                      <td>{o.event_name}</td>
                      <td>{o.customer_name}</td>
                      <td>{o.purchased_at ? new Date(o.purchased_at).toLocaleDateString() : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mpd-table-foot">
              <span>{selected.size} of {filtered.length} row(s) selected.</span>
              <div className="mpd-pagination">
                <button className="mpd-page-btn" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Previous</button>
                <button className="mpd-page-btn" disabled={(page + 1) * PER >= filtered.length} onClick={() => setPage(p => p + 1)}>Next</button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}
