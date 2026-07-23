'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Image from 'next/image'

/* ── Types ────────────────────────────────────────────────────────────────── */

interface TicketTier {
  id: string
  name: string
  price: number
  capacity: number | null
  sold_count: number
}

interface Comment {
  id: string
  text: string
  created_at: string
  user: {
    name: string
    image: string | null
  }
}

interface Event {
  id: string
  title: string
  description: string | null
  date: string
  time: string | null
  end_time: string | null
  location: string
  event_type: string | null
  age_policy: string | null
  flyer_url: string | null
  image_url: string | null
  status: string
  like_count: number
  save_count: number
  sold_count: number
  comment_count: number
  is_liked?: boolean
  is_saved?: boolean
  ticket_tiers: TicketTier[]
  host: {
    username: string
    display_name: string
    avatar_url: string | null
    is_following?: boolean
  } | null
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

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

/* ── Skeleton ─────────────────────────────────────────────────────────────── */

function EventSkeleton() {
  return (
    <div className="event-page-skeleton-wrap">
      <div className="event-page-flyer event-page-skeleton-flyer" />
      <div className="wrap">
        <div className="event-page-skeleton-line" style={{ width: '60%', height: 32, marginTop: 24, marginBottom: 12 }} />
        <div className="event-page-skeleton-line" style={{ width: '40%', height: 18, marginBottom: 24 }} />
        <div className="event-page-skeleton-line" style={{ width: '100%', height: 120, marginBottom: 16 }} />
        <div className="event-page-skeleton-line" style={{ width: '100%', height: 80 }} />
      </div>
    </div>
  )
}

/* ── Page ─────────────────────────────────────────────────────────────────── */

export default function EventPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { data: session } = useSession()

  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [saved, setSaved] = useState(false)
  const [saveCount, setSaveCount] = useState(0)
  const [likeLoading, setLikeLoading] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)

  const [following, setFollowing] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)

  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)

  const [comments, setComments] = useState<Comment[]>([])
  const [commentsLoading, setCommentsLoading] = useState(true)
  const [commentText, setCommentText] = useState('')
  const [commentSubmitting, setCommentSubmitting] = useState(false)

  /* Fetch event */
  useEffect(() => {
    if (!id) return
    fetch(`/api/events/${id}`)
      .then((r) => {
        if (r.status === 404) { setNotFound(true); return null }
        return r.json()
      })
      .then((data) => {
        if (!data) return
        setEvent(data.event ?? data)
        const ev: Event = data.event ?? data
        setLiked(ev.is_liked ?? false)
        setLikeCount(ev.like_count ?? 0)
        setSaved(ev.is_saved ?? false)
        setSaveCount(ev.save_count ?? 0)
        setFollowing(ev.host?.is_following ?? false)
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id])

  /* Fetch comments */
  const fetchComments = useCallback(() => {
    if (!id) return
    setCommentsLoading(true)
    fetch(`/api/events/${id}/comments`)
      .then((r) => r.json())
      .then((d) => setComments(d.comments ?? []))
      .catch(() => {})
      .finally(() => setCommentsLoading(false))
  }, [id])

  useEffect(() => { fetchComments() }, [fetchComments])

  /* Like */
  async function handleLike() {
    if (!session) { router.push('/login'); return }
    if (likeLoading) return
    setLikeLoading(true)
    const next = !liked
    setLiked(next)
    setLikeCount((c) => c + (next ? 1 : -1))
    try {
      await fetch(`/api/events/${id}/like`, { method: 'POST' })
    } catch {
      setLiked(!next)
      setLikeCount((c) => c + (next ? -1 : 1))
    } finally {
      setLikeLoading(false)
    }
  }

  /* Save */
  async function handleSave() {
    if (!session) { router.push('/login'); return }
    if (saveLoading) return
    setSaveLoading(true)
    const next = !saved
    setSaved(next)
    setSaveCount((c) => c + (next ? 1 : -1))
    try {
      await fetch(`/api/events/${id}/save`, { method: 'POST' })
    } catch {
      setSaved(!next)
      setSaveCount((c) => c + (next ? -1 : 1))
    } finally {
      setSaveLoading(false)
    }
  }

  /* Follow host */
  async function handleFollow() {
    if (!session || !event?.host) { router.push('/login'); return }
    if (followLoading) return
    setFollowLoading(true)
    const next = !following
    setFollowing(next)
    try {
      await fetch(`/api/profile/${event.host.username}/follow`, { method: 'POST' })
    } catch {
      setFollowing(!next)
    } finally {
      setFollowLoading(false)
    }
  }

  /* Checkout */
  async function handleCheckout(tier: TicketTier) {
    setCheckoutLoading(tier.id)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: id,
          tiers: [{ tierId: tier.id, tierName: tier.name, price: tier.price, quantity: 1 }],
        }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else alert(data.error ?? 'Something went wrong.')
    } catch {
      alert('Something went wrong.')
    } finally {
      setCheckoutLoading(null)
    }
  }

  /* Post comment */
  async function handleComment(e: React.FormEvent) {
    e.preventDefault()
    if (!session) { router.push('/login'); return }
    if (!commentText.trim() || commentSubmitting) return
    setCommentSubmitting(true)
    try {
      const res = await fetch(`/api/events/${id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: commentText.trim() }),
      })
      if (res.ok) {
        setCommentText('')
        fetchComments()
      }
    } catch { /* swallow */ }
    setCommentSubmitting(false)
  }

  /* Share */
  function handleShare() {
    if (navigator.share) {
      navigator.share({ title: event?.title ?? 'Event', url: window.location.href })
    } else {
      navigator.clipboard.writeText(window.location.href).then(() => alert('Link copied!'))
    }
  }

  /* ── Render ─────────────────────────────────────────────────────────────── */

  if (loading) return <EventSkeleton />

  if (notFound || !event) {
    return (
      <div className="event-page-not-found">
        <div className="empty-icon-wrap">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <p className="empty-title">Event not found.</p>
        <p className="empty-sub">This event may have ended or been removed.</p>
        <button className="btn-primary" onClick={() => router.push('/')} style={{ marginTop: 20 }}>Back to Home</button>
      </div>
    )
  }

  const bg = EVENT_GRADIENTS[event.event_type ?? ''] ?? 'linear-gradient(160deg, #141414 0%, #0a0a0a 100%)'
  const flyerSrc = event.flyer_url ?? event.image_url
  const dateStr = event.date
    ? new Date(event.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    : '—'

  return (
    <div className="event-page">

      {/* ── Flyer / Banner ──────────────────────────────────────────────────── */}
      <div className="event-page-flyer" style={!flyerSrc ? { background: bg } : {}}>
        {flyerSrc && (
          <Image src={flyerSrc} alt={event.title} fill className="event-page-flyer-img" priority />
        )}
        <div className="event-page-flyer-overlay" />

        {/* Back button */}
        <button className="event-page-back" onClick={() => router.back()} aria-label="Go back">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
        </button>

        {/* Top-right actions */}
        <div className="event-page-top-actions">
          <button className="event-page-action-btn" onClick={handleShare} aria-label="Share">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
          </button>
          <button
            className={`event-page-action-btn${saved ? ' active' : ''}`}
            onClick={handleSave}
            aria-label="Save event"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────────────────────── */}
      <div className="event-page-body">
        <div className="wrap">

          {/* Host row */}
          {event.host && (
            <div className="event-page-host-row">
              <a href={`/profile/${event.host.username}`} className="event-page-host-link">
                {event.host.avatar_url ? (
                  <Image
                    src={event.host.avatar_url}
                    alt={event.host.display_name}
                    width={32}
                    height={32}
                    className="event-page-host-avatar"
                  />
                ) : (
                  <div className="event-page-host-avatar-fallback">
                    {event.host.display_name[0] ?? '?'}
                  </div>
                )}
                <span className="event-page-host-name">{event.host.display_name}</span>
              </a>
              <button
                className={`event-page-follow-btn${following ? ' following' : ''}`}
                onClick={handleFollow}
                disabled={followLoading}
              >
                {following ? 'Following' : 'Follow'}
              </button>
            </div>
          )}

          {/* Title */}
          <h1 className="event-page-title">{event.title}</h1>

          {/* Date + Location pills */}
          <div className="event-page-pills">
            <span className="event-page-pill">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              {dateStr}{event.time ? ` · ${event.time}` : ''}
            </span>
            <span className="event-page-pill">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              {event.location}
            </span>
          </div>

          {/* Badges */}
          <div className="event-page-badges">
            {event.event_type && (
              <span className="event-page-badge">{event.event_type.replace(/_/g, ' ')}</span>
            )}
            {event.age_policy && (
              <span className="event-page-badge">{event.age_policy}</span>
            )}
          </div>

          {/* Social row */}
          <div className="event-social-row">
            <button className={`like-btn${liked ? ' active' : ''}`} onClick={handleLike} disabled={likeLoading}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill={liked ? 'var(--red)' : 'none'} stroke={liked ? 'var(--red)' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              <span>{likeCount}</span>
            </button>

            <button className={`save-btn${saved ? ' active' : ''}`} onClick={handleSave} disabled={saveLoading}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
              </svg>
              <span>{saveCount}</span>
            </button>

            <div className="event-social-stat">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <span>{event.comment_count ?? comments.length}</span>
            </div>

            <div className="event-social-stat">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              <span>{event.sold_count ?? 0} going</span>
            </div>
          </div>

          {/* ── Ticket widget ──────────────────────────────────────────────── */}
          {event.ticket_tiers && event.ticket_tiers.length > 0 && (
            <div className="ticket-widget">
              <p className="ticket-widget-title">Tickets</p>
              <div className="ticket-widget-tiers">
                {event.ticket_tiers.map((tier) => {
                  const isSoldOut = tier.capacity !== null && tier.sold_count >= tier.capacity
                  const pct = tier.capacity ? Math.round((tier.sold_count / tier.capacity) * 100) : 0
                  return (
                    <div key={tier.id} className="ticket-widget-tier">
                      <div className="ticket-widget-tier-info">
                        <p className="ticket-widget-tier-name">{tier.name}</p>
                        {tier.capacity && (
                          <p className="ticket-widget-tier-cap">
                            {isSoldOut ? 'Sold out' : `${tier.capacity - tier.sold_count} left`}
                          </p>
                        )}
                      </div>
                      <div className="ticket-widget-tier-right">
                        <span className="ticket-widget-price">
                          {tier.price === 0 ? 'Free' : `$${tier.price.toFixed(2)}`}
                        </span>
                        <button
                          className={`btn-primary ticket-widget-btn${isSoldOut ? ' disabled' : ''}`}
                          onClick={() => handleCheckout(tier)}
                          disabled={isSoldOut || checkoutLoading === tier.id}
                        >
                          {checkoutLoading === tier.id ? (
                            <span className="btn-spinner" />
                          ) : isSoldOut ? 'Sold Out' : tier.price === 0 ? 'RSVP Free' : 'Get Tickets'}
                        </button>
                      </div>
                      {tier.capacity && (
                        <div className="ticket-widget-tier-bar-wrap">
                          <div className="cap-bar">
                            <div
                              className="cap-fill"
                              style={{ width: `${pct}%`, background: pct > 80 ? 'var(--red)' : 'rgba(255,255,255,0.4)' }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ── Description ───────────────────────────────────────────────── */}
          {event.description && (
            <div className="event-page-section">
              <h2 className="event-page-section-title">About</h2>
              <p className="event-page-desc">{event.description}</p>
            </div>
          )}

          {/* ── Comments ──────────────────────────────────────────────────── */}
          <div className="event-page-section">
            <h2 className="event-page-section-title">Comments</h2>

            {commentsLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0' }}>
                <div className="dash-spinner" />
              </div>
            ) : comments.length === 0 ? (
              <p className="event-page-no-comments">No comments yet. Be the first!</p>
            ) : (
              <div className="event-comments-list">
                {comments.map((c) => (
                  <div key={c.id} className="comment-item">
                    {c.user.image ? (
                      <Image
                        src={c.user.image}
                        alt={c.user.name}
                        width={32}
                        height={32}
                        className="comment-avatar"
                      />
                    ) : (
                      <div className="comment-avatar-fallback">{c.user.name[0] ?? '?'}</div>
                    )}
                    <div className="comment-body">
                      <div className="comment-meta">
                        <span className="comment-name">{c.user.name}</span>
                        <span className="comment-time">{timeAgo(c.created_at)}</span>
                      </div>
                      <p className="comment-text">{c.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Comment input */}
            {session ? (
              <form className="comment-form" onSubmit={handleComment}>
                <input
                  type="text"
                  placeholder="Add a comment…"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  maxLength={280}
                />
                <button type="submit" className="comment-submit-btn" disabled={!commentText.trim() || commentSubmitting}>
                  {commentSubmitting ? <span className="btn-spinner" /> : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                  )}
                </button>
              </form>
            ) : (
              <a href="/login" className="comment-auth-prompt">
                Sign in to comment →
              </a>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
