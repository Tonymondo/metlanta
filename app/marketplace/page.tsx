'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'dj', label: 'DJ' },
  { id: 'venue', label: 'Venue' },
  { id: 'photographer', label: 'Photographer' },
  { id: 'decorator', label: 'Decorator' },
  { id: 'security', label: 'Security' },
  { id: 'catering', label: 'Catering' },
  { id: 'other', label: 'Other' },
]

const CATEGORY_ICONS: Record<string, string> = {
  dj: '🎧',
  venue: '🏠',
  photographer: '📸',
  decorator: '✨',
  security: '🛡️',
  catering: '🍽️',
  other: '⚡',
}

interface Service {
  id: string
  title: string
  provider_name: string
  category: string
  description: string
  price_per_event: number | null
  location: string | null
  image_url: string | null
  contact_info: string
  created_at: string
}

interface ListForm {
  title: string
  category: string
  description: string
  price_per_event: string
  location: string
  contact_info: string
}

function ServiceCard({ service, onContact }: { service: Service; onContact: (s: Service) => void }) {
  const catLabel = CATEGORIES.find((c) => c.id === service.category)?.label ?? service.category
  const icon = CATEGORY_ICONS[service.category] ?? '⚡'

  return (
    <div className="mkt-card">
      {/* Image */}
      <div className="mkt-card-img">
        {service.image_url ? (
          <Image src={service.image_url} alt={service.title} fill style={{ objectFit: 'cover' }} />
        ) : (
          <div className="mkt-card-placeholder">
            <span style={{ fontSize: 40 }}>{icon}</span>
          </div>
        )}
        <span className="mkt-cat-badge">{catLabel}</span>
      </div>

      {/* Body */}
      <div className="mkt-card-body">
        <p className="mkt-card-title">{service.title}</p>
        <p className="mkt-card-provider">{service.provider_name}</p>
        <p className="mkt-card-desc">{service.description}</p>

        <div className="mkt-card-foot">
          <div>
            {service.location && (
              <span className="mkt-card-loc">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                {service.location}
              </span>
            )}
            {service.price_per_event && (
              <span className="mkt-card-price">${service.price_per_event}/event</span>
            )}
          </div>
          <button className="mkt-view-btn" onClick={() => onContact(service)}>View</button>
        </div>
      </div>
    </div>
  )
}

function ContactModal({ service, onClose }: { service: Service; onClose: () => void }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box mkt-contact-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
        <h2 className="modal-title">{service.title}</h2>
        <p className="mkt-modal-provider">{service.provider_name}</p>
        {service.image_url && (
          <div className="mkt-modal-img">
            <Image src={service.image_url} alt={service.title} fill style={{ objectFit: 'cover', borderRadius: 12 }} />
          </div>
        )}
        <p className="mkt-modal-desc">{service.description}</p>
        <div className="mkt-modal-meta">
          {service.location && (
            <div className="mkt-modal-row">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              {service.location}
            </div>
          )}
          {service.price_per_event && (
            <div className="mkt-modal-row">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
              ${service.price_per_event}/event
            </div>
          )}
        </div>
        <div className="mkt-modal-contact">
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#555', marginBottom: 8 }}>Contact</p>
          <p style={{ color: '#ccc', fontSize: 15 }}>{service.contact_info}</p>
        </div>
      </div>
    </div>
  )
}

function ListModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState<ListForm>({
    title: '', category: 'dj', description: '', price_per_event: '', location: '', contact_info: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/marketplace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Failed to submit'); return }
      onCreated()
      onClose()
    } catch {
      setError('Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
        <button className="modal-close" onClick={onClose}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
        <h2 className="modal-title">List Your Service</h2>
        <p style={{ color: '#666', fontSize: 13, marginBottom: 20 }}>Reach thousands of Atlanta event hosts.</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="mkt-form-label">Service Title *</label>
            <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Book DJ Infiltrator" required />
          </div>
          <div>
            <label className="mkt-form-label">Category *</label>
            <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mkt-form-label">Description *</label>
            <textarea className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe your service, experience, what's included…" rows={3} required style={{ resize: 'vertical' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label className="mkt-form-label">Price per Event ($)</label>
              <input className="input" type="number" min="0" value={form.price_per_event} onChange={(e) => setForm({ ...form, price_per_event: e.target.value })} placeholder="200" />
            </div>
            <div>
              <label className="mkt-form-label">Location</label>
              <input className="input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Atlanta, GA" />
            </div>
          </div>
          <div>
            <label className="mkt-form-label">Contact Info * <span style={{ color: '#555', fontWeight: 400 }}>(phone, email, or @handle)</span></label>
            <input className="input" value={form.contact_info} onChange={(e) => setForm({ ...form, contact_info: e.target.value })} placeholder="@yourhandle · (404) 000-0000" required />
          </div>

          {error && <p style={{ color: 'var(--red)', fontSize: 13 }}>{error}</p>}

          <button type="submit" className="btn btn-red" disabled={loading} style={{ marginTop: 4, justifyContent: 'center' }}>
            {loading ? 'Submitting…' : 'List My Service'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function MarketplacePage() {
  const { data: session } = useSession()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [contactTarget, setContactTarget] = useState<Service | null>(null)
  const [showList, setShowList] = useState(false)

  const fetchServices = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (category !== 'all') params.set('category', category)
    if (search.trim()) params.set('q', search.trim())
    try {
      const res = await fetch(`/api/marketplace?${params}`)
      const data = await res.json()
      setServices(data.services ?? [])
    } catch {
      setServices([])
    } finally {
      setLoading(false)
    }
  }, [category, search])

  useEffect(() => {
    const t = setTimeout(() => { fetchServices() }, search ? 350 : 0)
    return () => clearTimeout(t)
  }, [fetchServices, search])

  return (
    <div className="mkt-page">
      {/* Header */}
      <div className="mkt-header">
        <div className="mkt-header-inner">
          <a href="/" className="mkt-back">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
          </a>
          <div>
            <h1 className="mkt-title">Marketplace</h1>
            <p className="mkt-sub">Find professionals to elevate your events</p>
          </div>
        </div>
      </div>

      <div className="mkt-body">
        {/* Search + CTA */}
        <div className="mkt-search-row">
          <div className="mkt-search-wrap">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              className="mkt-search-input"
              placeholder="Search services, DJs, venues…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            className="btn btn-red btn-sm"
            onClick={() => {
              if (!session) { window.location.href = '/login'; return }
              setShowList(true)
            }}
          >
            + List Your Service
          </button>
        </div>

        {/* Category filters */}
        <div className="mkt-cats">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              className={`mkt-cat-btn${category === c.id ? ' active' : ''}`}
              onClick={() => setCategory(c.id)}
            >
              {c.id !== 'all' && <span>{CATEGORY_ICONS[c.id]}</span>}
              {c.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="mkt-loading">
            <div className="dash-spinner" />
          </div>
        ) : services.length === 0 ? (
          <div className="mkt-empty">
            <p className="mkt-empty-title">No services found</p>
            <p className="mkt-empty-sub">
              {search || category !== 'all' ? 'Try a different search or category.' : 'Be the first to list a service in Atlanta.'}
            </p>
            <button className="btn btn-red btn-sm" style={{ marginTop: 16 }} onClick={() => setShowList(true)}>
              List Your Service
            </button>
          </div>
        ) : (
          <div className="mkt-grid">
            {services.map((s) => (
              <ServiceCard key={s.id} service={s} onContact={setContactTarget} />
            ))}
          </div>
        )}
      </div>

      {contactTarget && (
        <ContactModal service={contactTarget} onClose={() => setContactTarget(null)} />
      )}
      {showList && (
        <ListModal onClose={() => setShowList(false)} onCreated={fetchServices} />
      )}
    </div>
  )
}
