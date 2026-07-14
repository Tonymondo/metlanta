'use client'

import { useState } from 'react'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const WEEKLY_LIMIT = 4

function getCalendarDays(year: number, month: number) {
  const first = new Date(year, month, 1).getDay()
  const last = new Date(year, month + 1, 0).getDate()
  const days: (number | null)[] = []
  for (let i = 0; i < first; i++) days.push(null)
  for (let d = 1; d <= last; d++) days.push(d)
  while (days.length % 7 !== 0) days.push(null)
  return days
}

function getWeekRanges(year: number, month: number) {
  const now = new Date()
  const ranges: { label: string; current: boolean }[] = []
  let cur = new Date(year, month, 1)
  // go to first Sunday of the month or prior
  const dayOfWeek = cur.getDay()
  cur.setDate(cur.getDate() - dayOfWeek)
  for (let i = 0; i < 6; i++) {
    const start = new Date(cur)
    const end = new Date(cur); end.setDate(end.getDate() + 6)
    const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const isCurrentWeek = now >= start && now <= end
    ranges.push({ label: `${fmt(start)} – ${fmt(end)}`, current: isCurrentWeek })
    cur.setDate(cur.getDate() + 7)
  }
  return ranges
}

export default function MarketingPage() {
  const now = new Date()
  const [calYear, setCalYear] = useState(now.getFullYear())
  const [calMonth, setCalMonth] = useState(now.getMonth())
  const [campaignTab, setCampaignTab] = useState<'upcoming' | 'history'>('upcoming')

  const calDays = getCalendarDays(calYear, calMonth)
  const weekRanges = getWeekRanges(calYear, calMonth)
  const monthLabel = new Date(calYear, calMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  function prevMonth() {
    if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11) }
    else setCalMonth(m => m - 1)
  }
  function nextMonth() {
    if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0) }
    else setCalMonth(m => m + 1)
  }

  const today = now.getDate()
  const isCurrentMonth = calYear === now.getFullYear() && calMonth === now.getMonth()

  return (
    <>
      <div className="mpd-banner">
        <div>
          <p className="mpd-banner-title">Complete your Stripe setup</p>
          <p className="mpd-banner-sub">Connect Stripe to unlock marketing campaigns.</p>
        </div>
        <a href="/dashboard/settings" className="mpd-banner-btn">Set up Stripe</a>
      </div>

      <div className="mpd-breadcrumb">
        <a href="/dashboard">Dashboard</a>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        <span>Marketing</span>
      </div>

      <div className="mpd-page-row">
        <span />
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="mpd-ghost-btn">Audiences</button>
          <button className="mpd-primary-btn">Create Campaign</button>
        </div>
      </div>

      {/* Locked warning */}
      <div className="mpd-info-box warning" style={{ marginBottom: 20 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <div>
          <p style={{ fontWeight: 700, marginBottom: 2 }}>Marketing campaigns are locked</p>
          <p>To send campaigns, you must have hosted at least one paid event on Metlanta.</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="mpd-kpi-grid" style={{ marginBottom: 24 }}>
        <div className="mpd-kpi"><div className="mpd-kpi-hd"><span>This week</span></div><p className="mpd-kpi-val">0<span style={{ fontSize: 14, fontWeight: 400, color: 'var(--gray3)' }}>/{WEEKLY_LIMIT}</span></p></div>
        <div className="mpd-kpi"><div className="mpd-kpi-hd"><span>Remaining</span></div><p className="mpd-kpi-val">{WEEKLY_LIMIT}</p></div>
        <div className="mpd-kpi"><div className="mpd-kpi-hd"><span>Upcoming</span></div><p className="mpd-kpi-val">0</p></div>
        <div className="mpd-kpi"><div className="mpd-kpi-hd"><span>Total sent</span></div><p className="mpd-kpi-val">0</p></div>
      </div>

      {/* Calendar */}
      <div className="mpd-cal-card">
        <div className="mpd-cal-hd">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            <span className="mpd-cal-title">Calendar</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="mpd-cal-nav" onClick={prevMonth}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <span className="mpd-cal-month">{monthLabel}</span>
            <button className="mpd-cal-nav" onClick={nextMonth}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        </div>

        <div className="mpd-cal-legend">
          <span><span className="mpd-cal-dot green" />Available</span>
          <span><span className="mpd-cal-dot yellow" />Almost full</span>
          <span><span className="mpd-cal-dot red" />At limit</span>
        </div>

        <div className="mpd-cal-grid">
          {DAYS.map(d => <div key={d} className="mpd-cal-dow">{d}</div>)}
          {calDays.map((day, i) => (
            <div key={i} className={`mpd-cal-day${day === null ? ' empty' : ''}${isCurrentMonth && day === today ? ' today' : ''}`}>
              {day !== null && (
                <>
                  <span className="mpd-cal-day-num">{day}</span>
                  <span className="mpd-cal-day-slots">2 left</span>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Weekly usage rows */}
        <div className="mpd-weekly-rows">
          {weekRanges.map((w, i) => (
            <div key={i} className={`mpd-weekly-row${w.current ? ' current' : ''}`}>
              <span>{w.label}</span>
              <span>0/{WEEKLY_LIMIT}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Campaigns tabs */}
      <div className="mpd-tabs" style={{ marginTop: 20 }}>
        <button className={`mpd-tab${campaignTab === 'upcoming' ? ' active' : ''}`} onClick={() => setCampaignTab('upcoming')}>Upcoming (0)</button>
        <button className={`mpd-tab${campaignTab === 'history' ? ' active' : ''}`} onClick={() => setCampaignTab('history')}>History (0)</button>
      </div>
      <div className="mpd-table-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
        <p style={{ color: 'var(--gray3)', fontSize: 14 }}>
          {campaignTab === 'upcoming'
            ? 'No upcoming campaigns. Click a day on the calendar to get started.'
            : 'No campaign history yet.'}
        </p>
      </div>
    </>
  )
}
