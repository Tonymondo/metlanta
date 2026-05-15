'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Image from 'next/image'

/* ── Types ────────────────────────────────────────────────────────────────── */

interface ProfileEvent {
  id: string
  title: string
  date: string
  event_type: string | null
  flyer_url: string | null
  image_url: string | null
  min_price: number
}

interface Profile {
  username: string
  display_name: string
  bio: string | null
  role: string
  avatar_url: string | null
  banner_url: string | null
  instagram: string | null
  event_count: number
  follower_count: number
  is_following?: boolean
  events: ProfileEvent[]
}

/* ── Helpers ──────────────────────────────────────────────────────────────── */

const EVENT_GRADIENTS: Record<string, string> = {
  after_prom:   'linear-gradient(160deg, #2d0808 0%, #0d0000 100%)',
  day_party:    'linear-gradient(160deg, #1a0a1e 0%, #050008 100%)',
  nightlife:    'linear-gradient(160deg, #1a1400 0%, #060500 100%)',
  kickback:     'linear-gradient(160deg, #050d05 0%, #030808 100%)',
  pop_up:       'linear-gradient(160deg, #1e1000 0%, #070400 100%)',
  school_event: 'linear-gradient(160deg, #070010 0%, #10001a 100%)',
}

const BANNER_GRADIENTS = [
  'linear-gradient(135deg, #1a0000 0%, #0d0000 100%)',
  'linear-gradient(135deg, #0d0020 0%, #000010 100%)',
  'linear-gradient(135deg, #001a0d 0%, #000a05 100%)',
]

/* ── Skeleton ─────────────────────────────────────────────────────────────── */

function ProfileSkeleton() {
  return (
    <div className="profile-page">
      <div className="profile-banner" style={{ background: BANNER_GRADIENTS[0] }} />
      <div className="profile-head-wrap wrap">
        <div className="profile-avatar profile-skeleton-avatar" />
        <div style={{ marginTop: 48, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div className="profile-skeleton-line" style={{ width: 160, height: 22 }} />
          <div className="profile-skeleton-line" style={{ width: 100, height: 14 }} />
          <div className="profile-skeleton-line" style={{ width: 240, height: 14 }} />
        </div>
      </div>
    </div>
  )
}

/* ── Mini event card ──────────────────────────────────────────────────────── */

function ProfileEventCard({ event }: { event: ProfileEvent }) {
  const router = useRouter()
  const bg = EVENT_GRADIENTS[event.event_type ?? ''] ?? 'linear-gradient(160deg, #141414, #0a0a0a)'
  const coverSrc = event.flyer_url ?? event.image_url
  const dateStr = event.date
    ? new Date(event.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : '—'

  return (
    <button className="profile-event-card" onClick={() => router.push(`/events/${event.id}`)}>
      <div className="profile-event-cover" style={!coverSrc ? { background: bg } : {}}>
        {coverSrc && (
          <Image src={coverSrc} alt={event.title} fill className="profile-event-img" />
        )}
        <div className="explore-card-overlay" />
        <div className="profile-event-info">
          <p className="profile-event-title">{event.title}</p>
          <p className="profile-event-date">{dateStr} · {event.min_price === 0 ? 'Free' : `$${event.min_price}`}</p>
        </div>
      </div>
    </button>
  )
}

/* ── Page ─────────────────────────────────────────────────────────────────── */

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>()
  const router = useRouter()
  const { data: session } = useSession()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [following, setFollowing] = useState(false)
  const [followerCount, setFollowerCount] = useState(0)
  const [followLoading, setFollowLoading] = useState(false)

  /* Fetch profile */
  useEffect(() => {
    if (!username) return
    fetch(`/api/profile/${username}`)
      .then((r) => {
        if (r.status === 404) { setNotFound(true); return null }
        return r.json()
      })
      .then((data) => {
        if (!data) return
        const p: Profile = data.profile ?? data
        setProfile(p)
        setFollowing(p.is_following ?? false)
        setFollowerCount(p.follower_count ?? 0)
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [username])

  /* Follow / unfollow */
  async function handleFollow() {
    if (!session) { router.push('/login'); return }
    if (followLoading) return
    setFollowLoading(true)
    const next = !following
    setFollowing(next)
    setFollowerCount((c) => c + (next ? 1 : -1))
    try {
      await fetch(`/api/profile/${username}/follow`, { method: 'POST' })
    } catch {
      setFollowing(!next)
      setFollowerCount((c) => c + (next ? -1 : 1))
    } finally {
      setFollowLoading(false)
    }
  }

  /* ── Render ─────────────────────────────────────────────────────────────── */

  if (loading) return <ProfileSkeleton />

  if (notFound || !profile) {
    return (
      <div className="event-page-not-found">
        <div className="empty-icon-wrap">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
        </div>
        <p className="empty-title">Profile not found.</p>
        <p className="empty-sub">This user doesn&apos;t exist or hasn&apos;t set up their profile yet.</p>
        <button className="btn-primary" onClick={() => router.push('/')} style={{ marginTop: 20 }}>Back to Home</button>
      </div>
    )
  }

  const bannerGrad = BANNER_GRADIENTS[profile.username.charCodeAt(0) % BANNER_GRADIENTS.length]

  return (
    <div className="profile-page">

      {/* ── Banner ──────────────────────────────────────────────────────────── */}
      <div
        className="profile-banner"
        style={!profile.banner_url ? { background: bannerGrad } : {}}
      >
        {profile.banner_url && (
          <Image src={profile.banner_url} alt="" fill className="profile-banner-img" />
        )}
      </div>

      {/* ── Profile head ────────────────────────────────────────────────────── */}
      <div className="profile-head-wrap wrap">
        <div className="profile-head">
          <div className="profile-avatar-wrap">
            {profile.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt={profile.display_name}
                width={60}
                height={60}
                className="profile-avatar"
              />
            ) : (
              <div className="profile-avatar profile-avatar-fallback">
                {profile.display_name[0] ?? '?'}
              </div>
            )}
          </div>

          <div className="profile-head-right">
            <button
              className={`profile-follow-btn${following ? ' following' : ''}`}
              onClick={handleFollow}
              disabled={followLoading}
            >
              {following ? 'Following' : 'Follow'}
            </button>
          </div>
        </div>

        {/* Name + username */}
        <div className="profile-identity">
          <h1 className="profile-display-name">{profile.display_name}</h1>
          <p className="profile-username">@{profile.username}</p>
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="profile-bio">{profile.bio}</p>
        )}

        {/* Instagram link */}
        {profile.instagram && (
          <a
            href={`https://instagram.com/${profile.instagram.replace('@', '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="profile-instagram"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
            </svg>
            {profile.instagram.startsWith('@') ? profile.instagram : `@${profile.instagram}`}
          </a>
        )}

        {/* Stats row */}
        <div className="profile-stats">
          <div className="profile-stat">
            <span className="profile-stat-val">{profile.event_count}</span>
            <span className="profile-stat-label">Events</span>
          </div>
          <div className="profile-stat-divider" />
          <div className="profile-stat">
            <span className="profile-stat-val">{followerCount}</span>
            <span className="profile-stat-label">Followers</span>
          </div>
          {profile.role && (
            <>
              <div className="profile-stat-divider" />
              <span className="profile-role-badge">{profile.role}</span>
            </>
          )}
        </div>

      </div>

      {/* ── Events grid ─────────────────────────────────────────────────────── */}
      <div className="wrap profile-events-section">
        <h2 className="profile-events-title">Events</h2>

        {profile.events.length === 0 ? (
          <div className="explore-empty">
            <p className="empty-title">No events yet.</p>
            <p className="empty-sub">Check back soon.</p>
          </div>
        ) : (
          <div className="profile-events-grid">
            {profile.events.map((e) => (
              <ProfileEventCard key={e.id} event={e} />
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
