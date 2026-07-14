'use client'

import { useSession } from 'next-auth/react'

export default function MembersPage() {
  const { data: session } = useSession()
  const userName = session?.user?.name ?? 'User'

  return (
    <>
      <div className="mpd-breadcrumb">
        <a href="/dashboard">Dashboard</a>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        <a href="/dashboard/settings">Settings</a>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        <span>Members</span>
      </div>

      <div className="mpd-page-row" style={{ marginBottom: 8 }}>
        <div>
          <h2 className="mpd-section-title">Members</h2>
          <p className="mpd-section-sub">Invite, manage roles, and configure event access for everyone on your team.</p>
        </div>
        <button className="mpd-ghost-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
          Invite a Team Member
        </button>
      </div>

      <div className="mpd-table-card">
        <table className="mpd-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div className="mpd-member-av">{userName[0]}</div>
                  <span style={{ fontWeight: 600 }}>{userName} (you)</span>
                </div>
              </td>
              <td><span className="mpd-role-badge">Owner</span></td>
            </tr>
          </tbody>
        </table>
        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--gray3)', padding: '16px 0' }}>A list of Team Members</p>
      </div>
    </>
  )
}
