'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { calculateFee } from '@/lib/fees'

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
  user: { name: string; image: string | null }
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
  dress_code: string | null
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

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function fmt(n: number) {
  return n % 1 === 0 ? `$${n}` : `$${n.toFixed(2)}`
}

/* ── Skeleton ─────────────────────────────────────────────────────────────── */

function EventSkeleton() {
  return (
    <div style={{ minHeight: '100svh', background: '#000' }}>
      <div style={{ height: '55svh', background: '#1a1a1a', animation: 'skeletonPulse 1.8s ease-in-out infinite' }} />
      <div className="wrap" style={{ paddingTop: 24 }}>
        <div style={{ width: '60%', height: 32, background: '#1a1a1a', borderRadius: 8, marginBottom: 12, animation: 'skeletonPulse 1.8s ease-in-out infinite' }} />
        <div style={{ width: '40%', height: 18, background: '#1a1a1a', borderRadius: 8, animation: 'skeletonPulse 1.8s ease-in-out infinite' }} />
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
  const [following, setFollowing] = useState(false)

  const [comments, setComments] = useState<Comment[]>([])
  const [commentsLoading, setCommentsLoading] = useState(true)
  const [commentText, setCommentText] = useState('')
  const [commentSubmitting, setCommentSubmitting] = useState(false)

  // Cart state: tierId → quantity
  const [cart, setCart] = useState<Record<string, number>>({})
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [discountCode, setDiscountCode] = useState('')

  /* Fetch event */
  useEffect(() => {
    if (!id) return
    fetch(`/api/events/${id}`)
      .then(r => { if (r.status === 404) { setNotFound(true); return null } return r.json() })
      .then(data => {
        if (!data) return
        const ev: Event = data.event ?? data
        setEvent(ev)
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
      .then(r => r.json())
      .then(d => setComments(d.comments ?? []))
      .catch(() => {})
      .finally(() => setCommentsLoading(false))
  }, [id])
  useEffect(() => { fetchComments() }, [fetchComments])

  /* Like */
  async function handleLike() {
    if (!session) { router.push('/login'); return }
    const next = !liked
    setLiked(next); setLikeCount(c => c + (next ? 1 : -1))
    try { await fetch(`/api/events/${id}/like`, { method: 'POST' }) }
    catch { setLiked(!next); setLikeCount(c => c + (next ? -1 : 1)) }
  }

  /* Save */
  async function handleSave() {
    if (!session) { router.push('/login'); return }
    const next = !saved
    setSaved(next); setSaveCount(c => c + (next ? 1 : -1))
    try { await fetch(`/api/events/${id}/save`, { method: 'POST' }) }
    catch { setSaved(!next); setSaveCount(c => c + (next ? -1 : 1)) }
  }

  /* Follow */
  async function handleFollow() {
    if (!session || !event?.host) { router.push('/login'); return }
    const next = !following
    setFollowing(next)
    try { await fetch(`/api/profile/${event.host.username}/follow`, { method: 'POST' }) }
    catch { setFollowing(!next) }
  }

  /* Cart helpers */
  function setQty(tierId: string, qty: number) {
    setCart(prev => ({ ...prev, [tierId]: Math.max(0, qty) }))
  }

  const cartCount = Object.values(cart).reduce((s, q) => s + q, 0)
  const cartSubtotal = event?.ticket_tiers.reduce((s, t) => s + (cart[t.id] ?? 0) * t.price, 0) ?? 0
  const cartFee = event?.ticket_tiers.reduce((s, t) => {
    const qty = cart[t.id] ?? 0
    return s + qty * calculateFee(t.price).fee
  }, 0) ?? 0
  const cartTotal = cartSubtotal + cartFee

  const lowestAvailable = event?.ticket_tiers
    .filter(t => !(t.capacity !== null && t.sold_count >= t.capacity))
    .sort((a, b) => a.price - b.price)[0]

  const lowestPriceWithFees = lowestAvailable
    ? lowestAvailable.price === 0 ? 0 : lowestAvailable.price + calculateFee(lowestAvailable.price).fee
    : null

  /* Checkout */
  async function handleCheckout() {
    if (!session) { router.push('/login'); return }
    const tiers = (event?.ticket_tiers ?? [])
      .filter(t => (cart[t.id] ?? 0) > 0)
      .map(t => ({ tierId: t.id, tierName: t.name, price: t.price, quantity: cart[t.id] }))
    if (tiers.length === 0) return

    setCheckoutLoading(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: id, tiers }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else alert(data.error ?? 'Something went wrong.')
    } catch { alert('Something went wrong.') }
    finally { setCheckoutLoading(false) }
  }

  /* Free RSVP */
  async function handleFreeRSVP(tier: TicketTier) {
    if (!session) { router.push('/login'); return }
    setCheckoutLoading(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: id, tiers: [{ tierId: tier.id, tierName: tier.name, price: 0, quantity: 1 }] }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch { alert('Something went wrong.') }
    finally { setCheckoutLoading(false) }
  }

  /* Share */
  function handleShare() {
    if (navigator.share) navigator.share({ title: event?.title ?? 'Event', url: window.location.href })
    else navigator.clipboard.writeText(window.location.href).then(() => alert('Link copied!'))
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
      if (res.ok) { setCommentText(''); fetchComments() }
    } catch { /* swallow */ }
    setCommentSubmitting(false)
  }

  /* ── Render ─────────────────────────────────────────────────────────────── */

  if (loading) return <EventSkeleton />

  if (notFound || !event) {
    return (
      <div style={{ minHeight: '100svh', background: '#000', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 }}>
        <p style={{ fontSize: 18, fontWeight: 700, color: 'rgba(255,255,255,0.5)' }}>Event not found</p>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.3)' }}>This event may have ended or been removed.</p>
        <button className="btn-primary" onClick={() => router.push('/')} style={{ marginTop: 12 }}>Back to Home</button>
      </div>
    )
  }

  const flyerSrc = event.flyer_url ?? event.image_url
  const dateStr = event.date
    ? new Date(event.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    : null
  const timeStr = [event.time, event.end_time].filter(Boolean).join(' - ')
  const hasPaidTiers = event.ticket_tiers.some(t => t.price > 0)
  const hasFreeOnlyTiers = event.ticket_tiers.length > 0 && !hasPaidTiers
  const allSoldOut = event.ticket_tiers.every(t => t.capacity !== null && t.sold_count >= t.capacity)

  return (
    <div style={{ minHeight: '100svh', background: '#000', color: '#fff', paddingBottom: 96 }}>

      {/* ── Flyer hero ──────────────────────────────────────────────────────── */}
      <div style={{ position: 'relative', width: '100%', aspectRatio: '4/5', maxHeight: '75svh', overflow: 'hidden', background: '#111' }}>
        {flyerSrc ? (
          <Image src={flyerSrc} alt={event.title} fill style={{ objectFit: 'cover' }} priority />
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(160deg,#1a0a0a,#0a0a0a)' }} />
        )}
        {/* Dark gradient at bottom */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.85) 100%)' }} />

        {/* Back */}
        <button
          onClick={() => router.back()}
          style={{
            position: 'absolute', top: 16, left: 16, zIndex: 10,
            width: 36, height: 36, borderRadius: '50%',
            background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff',
          }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
        </button>

        {/* Share + Save */}
        <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 10, display: 'flex', gap: 8 }}>
          <button onClick={handleShare} style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
          </button>
          <button onClick={handleSave} style={{ width: 36, height: 36, borderRadius: '50%', background: saved ? 'rgba(224,48,48,0.7)' : 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)', border: `1px solid ${saved ? 'rgba(224,48,48,0.8)' : 'rgba(255,255,255,0.12)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', transition: 'all 0.2s' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
          </button>
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────────────────────── */}
      <div className="wrap" style={{ paddingTop: 20, maxWidth: 680 }}>

        {/* Host row */}
        {event.host && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <a href={`/profile/${event.host.username}`} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
              {event.host.avatar_url ? (
                <Image src={event.host.avatar_url} alt={event.host.display_name} width={28} height={28} style={{ borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#fff' }}>
                  {event.host.display_name[0] ?? '?'}
                </div>
              )}
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>
                Hosted by <strong style={{ color: '#fff' }}>{event.host.display_name}</strong>
              </span>
            </a>
            <button
              onClick={handleFollow}
              style={{
                fontSize: 12, fontWeight: 700, padding: '5px 14px', borderRadius: 20, cursor: 'pointer',
                background: following ? 'rgba(255,255,255,0.1)' : 'var(--red)',
                border: following ? '1px solid rgba(255,255,255,0.15)' : '1px solid var(--red)',
                color: '#fff', fontFamily: 'var(--font)', transition: 'all 0.15s',
              }}>
              {following ? 'Following' : 'Follow'}
            </button>
          </div>
        )}

        {/* Title */}
        <h1 style={{ fontSize: 'clamp(26px, 6vw, 42px)', fontWeight: 900, letterSpacing: '-0.025em', lineHeight: 1.1, color: '#fff', marginBottom: 10 }}>
          {event.title}
        </h1>

        {/* Date + time in red */}
        {dateStr && (
          <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--red)', marginBottom: 6 }}>
            {dateStr}{timeStr ? ` · ${timeStr}` : ''}
          </p>
        )}

        {/* Location */}
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          {event.location}
        </p>

        {/* Badges */}
        {(event.event_type || event.age_policy || event.dress_code) && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
            {event.event_type && <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', textTransform: 'capitalize' }}>{event.event_type.replace(/_/g, ' ')}</span>}
            {event.age_policy && <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}>{event.age_policy}</span>}
            {event.dress_code && <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}>{event.dress_code}</span>}
          </div>
        )}

        {/* Social stats */}
        <div style={{ display: 'flex', gap: 20, marginBottom: 28, paddingBottom: 24, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <button onClick={handleLike} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: liked ? 'var(--red)' : 'rgba(255,255,255,0.5)', fontFamily: 'var(--font)', fontSize: 13, transition: 'color 0.15s' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill={liked ? 'var(--red)' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            {likeCount}
          </button>
          <button onClick={handleSave} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: saved ? '#fff' : 'rgba(255,255,255,0.5)', fontFamily: 'var(--font)', fontSize: 13, transition: 'color 0.15s' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
            {saveCount}
          </button>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            {event.sold_count ?? 0} going
          </span>
        </div>

        {/* ── About ───────────────────────────────────────────────────────── */}
        {event.description && (
          <div style={{ marginBottom: 28, paddingBottom: 28, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 12 }}>About</h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>{event.description}</p>
          </div>
        )}

        {/* ── Ticket widget ───────────────────────────────────────────────── */}
        {event.ticket_tiers.length > 0 && (
          <div style={{ marginBottom: 28, paddingBottom: 28, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 16 }}>Tickets</h2>

            {/* Tier list */}
            <div style={{ background: '#111', borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden', marginBottom: hasPaidTiers ? 12 : 0 }}>
              {event.ticket_tiers.map((tier, i) => {
                const isSoldOut = tier.capacity !== null && tier.sold_count >= tier.capacity
                const qty = cart[tier.id] ?? 0
                const { fee } = tier.price > 0 ? calculateFee(tier.price) : { fee: 0 }
                const inclFees = tier.price + fee

                return (
                  <div key={tier.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '16px 18px',
                    borderBottom: i < event.ticket_tiers.length - 1 ? '1px solid rgba(255,255,255,0.07)' : 'none',
                    opacity: isSoldOut ? 0.5 : 1,
                  }}>
                    {/* Left: name + price */}
                    <div>
                      <p style={{
                        fontSize: 15, fontWeight: 700, color: isSoldOut ? 'rgba(255,255,255,0.5)' : '#fff',
                        textDecoration: isSoldOut ? 'line-through' : 'none', marginBottom: tier.price > 0 ? 3 : 0,
                      }}>
                        {tier.name}
                      </p>
                      {tier.price > 0 && !isSoldOut && (
                        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>
                          {fmt(tier.price)} <span style={{ color: 'rgba(255,255,255,0.3)' }}>· {fmt(inclFees)} incl. fees</span>
                        </p>
                      )}
                      {tier.price === 0 && !isSoldOut && (
                        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>Free</p>
                      )}
                    </div>

                    {/* Right: controls */}
                    {isSoldOut ? (
                      <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>Sold out</span>
                    ) : tier.price === 0 ? (
                      <button
                        onClick={() => handleFreeRSVP(tier)}
                        disabled={checkoutLoading}
                        style={{
                          padding: '8px 18px', borderRadius: 20, fontSize: 13, fontWeight: 700,
                          background: 'var(--red)', color: '#fff', border: 'none', cursor: 'pointer',
                          fontFamily: 'var(--font)', transition: 'background 0.15s',
                        }}>
                        {checkoutLoading ? '…' : 'RSVP Free'}
                      </button>
                    ) : (
                      /* Quantity controls */
                      <div style={{ display: 'flex', alignItems: 'center', gap: qty > 0 ? 10 : 0 }}>
                        {qty > 0 && (
                          <>
                            <button
                              onClick={() => setQty(tier.id, qty - 1)}
                              style={{
                                width: 36, height: 36, borderRadius: 10,
                                background: '#2a2a2a', border: '1px solid rgba(255,255,255,0.15)',
                                color: '#fff', fontSize: 18, fontWeight: 300, cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'background 0.15s',
                              }}>
                              −
                            </button>
                            <span style={{ fontSize: 15, fontWeight: 700, minWidth: 16, textAlign: 'center' }}>{qty}</span>
                          </>
                        )}
                        <button
                          onClick={() => setQty(tier.id, qty + 1)}
                          style={{
                            width: 36, height: 36, borderRadius: 10,
                            background: '#2a2a2a', border: '1px solid rgba(255,255,255,0.15)',
                            color: '#fff', fontSize: 18, fontWeight: 300, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'background 0.15s',
                          }}>
                          +
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Cart summary (only when cart has items) */}
            {hasPaidTiers && cartCount > 0 && (
              <>
                {/* Discount code */}
                <div style={{ marginBottom: 12 }}>
                  <input
                    value={discountCode}
                    onChange={e => setDiscountCode(e.target.value)}
                    placeholder="Discount code"
                    style={{
                      width: '100%', padding: '13px 16px',
                      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 12, color: '#fff', fontSize: 14, fontFamily: 'var(--font)',
                      outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                </div>

                {/* Order summary */}
                <div style={{
                  background: '#111', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 16, padding: '16px 18px', marginBottom: 14,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>
                    <span>Subtotal · {cartCount} ticket{cartCount !== 1 ? 's' : ''}</span>
                    <span>{fmt(cartSubtotal)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 14, color: 'rgba(255,255,255,0.35)' }}>
                    <span>Processing fees</span>
                    <span>{fmt(cartFee)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 800, color: '#fff', paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    <span>Total</span>
                    <span>{fmt(cartTotal)}</span>
                  </div>
                </div>

                {/* Continue to payment */}
                <button
                  onClick={handleCheckout}
                  disabled={checkoutLoading}
                  style={{
                    width: '100%', padding: '16px', borderRadius: 14,
                    background: 'var(--red)', color: '#fff', fontWeight: 800, fontSize: 16,
                    border: 'none', cursor: 'pointer', fontFamily: 'var(--font)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    transition: 'background 0.15s',
                  }}>
                  {checkoutLoading ? <span className="btn-spinner" /> : 'Continue to payment'}
                </button>
              </>
            )}
          </div>
        )}

        {/* ── Location ────────────────────────────────────────────────────── */}
        <div style={{ marginBottom: 28, paddingBottom: 28, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 10 }}>Location</h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: 600, marginBottom: 14 }}>{event.location}</p>
          {/* Map link */}
          <a
            href={`https://maps.google.com/?q=${encodeURIComponent(event.location)}`}
            target="_blank" rel="noopener noreferrer"
            style={{
              display: 'block', height: 200, background: '#111',
              border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14,
              overflow: 'hidden', textDecoration: 'none', cursor: 'pointer',
              position: 'relative',
            }}>
            {/* Static map via Google Maps embed */}
            <img
              src={`https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(event.location)}&zoom=14&size=680x200&scale=2&style=element:geometry%7Ccolor:0x212121&style=element:labels.text.stroke%7Ccolor:0x212121&style=element:labels.text.fill%7Ccolor:0x757575&style=feature:road%7Celement:geometry%7Ccolor:0x2c2c2c&markers=color:red%7C${encodeURIComponent(event.location)}&key=`}
              alt="Map"
              style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(1) brightness(0.5)' }}
              onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 8,
              background: 'rgba(0,0,0,0.6)',
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>View on Google Maps →</span>
            </div>
          </a>
        </div>

        {/* ── Comments ────────────────────────────────────────────────────── */}
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 16 }}>Comments</h2>

          {commentsLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}><div className="dash-spinner" /></div>
          ) : comments.length === 0 ? (
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.3)', marginBottom: 20 }}>No comments yet. Be the first!</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20 }}>
              {comments.map(c => (
                <div key={c.id} style={{ display: 'flex', gap: 12 }}>
                  {c.user.image ? (
                    <Image src={c.user.image} alt={c.user.name} width={32} height={32} style={{ borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.5)', flexShrink: 0 }}>
                      {c.user.name[0] ?? '?'}
                    </div>
                  )}
                  <div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', marginBottom: 3 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{c.user.name}</span>
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{timeAgo(c.created_at)}</span>
                    </div>
                    <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>{c.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {session ? (
            <form onSubmit={handleComment} style={{ display: 'flex', gap: 10 }}>
              <input
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                placeholder="Add a comment…"
                maxLength={280}
                style={{
                  flex: 1, padding: '11px 14px',
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 10, color: '#fff', fontSize: 14, fontFamily: 'var(--font)', outline: 'none',
                }}
              />
              <button type="submit" disabled={!commentText.trim() || commentSubmitting} style={{
                width: 42, height: 42, borderRadius: 10, background: 'var(--red)', border: 'none',
                color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, opacity: (!commentText.trim() || commentSubmitting) ? 0.4 : 1, transition: 'opacity 0.15s',
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              </button>
            </form>
          ) : (
            <a href="/login" style={{ fontSize: 14, color: 'var(--red)', fontWeight: 600, textDecoration: 'none' }}>
              Sign in to comment →
            </a>
          )}
        </div>

      </div>

      {/* ── Sticky bottom CTA ───────────────────────────────────────────────── */}
      {event.ticket_tiers.length > 0 && !allSoldOut && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
          padding: '12px 16px 24px',
          background: 'linear-gradient(to top, rgba(0,0,0,0.98) 0%, rgba(0,0,0,0.8) 100%)',
          backdropFilter: 'blur(10px)',
        }}>
          {hasFreeOnlyTiers ? (
            <button
              onClick={() => handleFreeRSVP(event.ticket_tiers[0])}
              disabled={checkoutLoading}
              style={{
                width: '100%', maxWidth: 480, margin: '0 auto', display: 'flex',
                alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '16px', borderRadius: 16, background: 'var(--red)',
                color: '#fff', fontWeight: 800, fontSize: 16, border: 'none',
                cursor: 'pointer', fontFamily: 'var(--font)',
              }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/></svg>
              {checkoutLoading ? 'Loading…' : 'RSVP Free'}
            </button>
          ) : (
            <button
              onClick={cartCount > 0 ? handleCheckout : undefined}
              disabled={checkoutLoading}
              style={{
                width: '100%', maxWidth: 480, margin: '0 auto', display: 'flex',
                alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '16px', borderRadius: 16, background: 'var(--red)',
                color: '#fff', fontWeight: 800, fontSize: 16, border: 'none',
                cursor: cartCount > 0 ? 'pointer' : 'default',
                fontFamily: 'var(--font)',
                opacity: cartCount > 0 ? 1 : 0.85,
              }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/></svg>
              {checkoutLoading ? 'Loading…' : cartCount > 0
                ? `Continue to payment · ${fmt(cartTotal)}`
                : lowestPriceWithFees !== null
                  ? lowestPriceWithFees === 0 ? 'Get Tickets · Free' : `Get Tickets · from ${fmt(lowestPriceWithFees)}`
                  : 'Get Tickets'
              }
            </button>
          )}
        </div>
      )}
    </div>
  )
}
