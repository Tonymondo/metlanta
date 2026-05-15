'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

/* ── Types ────────────────────────────────────────────────────────────────── */

interface ExploreEvent {
  id: string
  title: string
  date: string
  time: string | null
  location: string
  event_type: string | null
  flyer_url: string | null
  image_url: string | null
  min_price: number
  like_count: number
  save_count: number
  sold_count: number
}

/* ── Constants ────────────────────────────────────────────────────────────── */

const EVENT_GRADIENTS: Record<string, string> = {
  after_prom:   'linear-gradient(160deg, #2d0808 0%, #0d0000 100%)',
  day_party:    'linear-gradient(160deg, #1a0a1e 0%, #050008 100%)',
  nightlife:    'linear-gradient(160deg, #1a1400 0%, #060500 100%)',
  kickback:     'linear-gradient(160deg, #050d05 0%, #030808 100%)',
  pop_up:       'linear-gradient(160deg, #1e1000 0%, #070400 100%)',
  school_event: 'linear-gradient(160deg, #070010 0%, #10001a 100%)',
}

const FILTER_CHIPS = [
  { label: 'ALL', value: '' },
  { label: 'After Prom', value: 'after_prom' },
  { label: 'Day Party', value: 'day_party' },
  { label: 'Nightlife', value: 'nightlife' },
  { label: 'Kickback', value: 'kickback' },
  { label: 'Pop Up', value: 'pop_up' },
]

/* ── Explore card ─────────────────────────────────────────────────────────── */

function ExploreCard({ event }: { event: ExploreEvent }) {
  const router = useRouter()
  const bg = EVENT_GRADIENTS[event.event_type ?? ''] ?? 'linear-gradient(160deg, #141414 0%, #0a0a0a 100%)'
  const coverSrc = event.flyer_url ?? event.image_url
  const dateStr = event.date
    ? new Date(event.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : '—'

  return (
    <button
      className="explore-card"
      onClick={() => router.push(`/events/${event.id}`)}
      aria-label={event.title}
    >
      {/* Cover image / gradient */}
      <div className="explore-card-cover" style={!coverSrc ? { background: bg } : {}}>
        {coverSrc && (
          <Image
            src={coverSrc}
            alt={event.title}
            fill
            className="explore-card-img"
          />
        )}
        <div className="explore-card-overlay" />

        {/* Type badge */}
        {event.event_type && (
          <span className="explore-card-type">{event.event_type.replace(/_/g, ' ')}</span>
        )}

        {/* Bottom info overlay */}
        <div className="explore-card-info">
          <p className="explore-card-title">{event.title}</p>
          <div className="explore-card-meta-row">
            <span className="explore-card-date">{dateStr}</span>
            <span className="explore-card-price">
              {event.min_price === 0 ? 'Free' : `from $${event.min_price}`}
            </span>
          </div>
          <div className="explore-card-social">
            <span className="explore-card-social-item">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              {event.like_count}
            </span>
            <span className="explore-card-social-item">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
              </svg>
              {event.save_count}
            </span>
          </div>
        </div>
      </div>
    </button>
  )
}

/* ── Skeleton card ────────────────────────────────────────────────────────── */

function SkeletonCard() {
  return <div className="explore-card explore-card-skeleton" aria-hidden />
}

/* ── Page ─────────────────────────────────────────────────────────────────── */

export default function ExplorePage() {
  const [events, setEvents] = useState<ExploreEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [filter, setFilter] = useState('')
  const [sort, setSort] = useState<'upcoming' | 'popular'>('upcoming')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  /* Fetch events — reset on filter/sort change */
  const fetchEvents = useCallback(async (pageNum: number, reset = false) => {
    if (pageNum === 1) setLoading(true)
    else setLoadingMore(true)

    const params = new URLSearchParams()
    if (filter) params.set('type', filter)
    params.set('sort', sort)
    params.set('page', String(pageNum))

    try {
      const res = await fetch(`/api/explore?${params}`)
      const data = await res.json()
      const incoming: ExploreEvent[] = data.events ?? []
      if (reset || pageNum === 1) {
        setEvents(incoming)
      } else {
        setEvents((prev) => [...prev, ...incoming])
      }
      setHasMore(incoming.length >= 12)
    } catch {
      if (pageNum === 1) setEvents([])
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [filter, sort])

  /* Reset + fetch when filter/sort changes */
  useEffect(() => {
    setPage(1)
    setHasMore(true)
    fetchEvents(1, true)
  }, [filter, sort]) // eslint-disable-line react-hooks/exhaustive-deps

  /* Intersection observer for load more */
  useEffect(() => {
    const el = loadMoreRef.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !loadingMore && !loading) {
          const next = page + 1
          setPage(next)
          fetchEvents(next)
        }
      },
      { threshold: 0.1 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [hasMore, loadingMore, loading, page, fetchEvents])

  return (
    <div className="explore-page">

      {/* ── Fixed filter bar ────────────────────────────────────────────────── */}
      <div className="explore-filter-bar">
        <div className="explore-filter-inner">
          <div className="explore-chips">
            {FILTER_CHIPS.map((chip) => (
              <button
                key={chip.value}
                className={`explore-chip${filter === chip.value ? ' active' : ''}`}
                onClick={() => setFilter(chip.value)}
              >
                {chip.label}
              </button>
            ))}
          </div>

          <div className="explore-sort">
            <button
              className={`explore-sort-btn${sort === 'upcoming' ? ' active' : ''}`}
              onClick={() => setSort('upcoming')}
            >
              Upcoming
            </button>
            <button
              className={`explore-sort-btn${sort === 'popular' ? ' active' : ''}`}
              onClick={() => setSort('popular')}
            >
              Popular
            </button>
          </div>
        </div>
      </div>

      {/* ── Grid ────────────────────────────────────────────────────────────── */}
      <div className="wrap">
        <div className="explore-header">
          <h1 className="explore-title">Explore Atlanta</h1>
          <p className="explore-sub">The hottest events in the city.</p>
        </div>

        {loading ? (
          <div className="explore-grid">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : events.length === 0 ? (
          <div className="explore-empty">
            <div className="empty-icon-wrap">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </div>
            <p className="empty-title">No events right now.</p>
            <p className="empty-sub">Check back soon.</p>
          </div>
        ) : (
          <>
            <div className="explore-grid">
              {events.map((e) => (
                <ExploreCard key={e.id} event={e} />
              ))}
            </div>

            {/* Load more sentinel */}
            <div ref={loadMoreRef} className="explore-load-more">
              {loadingMore && <div className="dash-spinner" />}
              {!hasMore && events.length > 0 && (
                <p className="explore-end-msg">You've seen it all.</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
