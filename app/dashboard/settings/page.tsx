'use client'

const SETTINGS = [
  {
    href: '/dashboard/settings/members',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
    title: 'Members',
    desc: "See who's on the team. Invite, change roles, and authorize event access.",
  },
  {
    href: '/dashboard/settings/profile',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="12" cy="10" r="3"/><path d="M7 21v-1a5 5 0 0110 0v1"/></svg>,
    title: 'Team Profile',
    desc: 'Public name, banner, profile picture, and Instagram handle.',
  },
  {
    href: '#',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,
    title: 'Notifications',
    desc: "What your team is notified about, who receives it, and external email or webhook destinations.",
  },
  {
    href: 'https://dashboard.stripe.com',
    external: true,
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
    title: 'Payments',
    desc: 'Open Stripe to manage payouts, bank accounts, and tax info.',
    action: (
      <a href="https://dashboard.stripe.com" target="_blank" rel="noopener noreferrer" className="mpd-ghost-btn" style={{ flexShrink: 0 }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
        Open Stripe
      </a>
    ),
  },
]

export default function SettingsPage() {
  return (
    <>
      <div className="mpd-breadcrumb">
        <a href="/dashboard">Dashboard</a>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        <span>Settings</span>
      </div>

      <div style={{ marginBottom: 24 }}>
        <h2 className="mpd-section-title">Settings</h2>
        <p className="mpd-section-sub">Manage your team&apos;s profile, notifications, members, and payments.</p>
      </div>

      <div className="mpd-settings-list">
        {SETTINGS.map((s, i) => (
          <a
            key={i}
            href={s.href}
            target={s.external ? '_blank' : undefined}
            rel={s.external ? 'noopener noreferrer' : undefined}
            className="mpd-settings-row"
          >
            <div className="mpd-settings-row-icon">{s.icon}</div>
            <div className="mpd-settings-row-body">
              <p className="mpd-settings-row-title">{s.title}</p>
              <p className="mpd-settings-row-desc">{s.desc}</p>
            </div>
            {s.action ? s.action : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, color: 'var(--gray3)' }}><polyline points="9 18 15 12 9 6"/></svg>
            )}
          </a>
        ))}
      </div>
    </>
  )
}
