'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'

/* ── FAQ data ────────────────────────────────────────────────────────────── */

const FAQS = [
  {
    category: 'Buying Tickets',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z"/>
      </svg>
    ),
    questions: [
      { q: 'How do I buy tickets?', a: 'Find an event you like on the homepage, select your ticket tier, and click "Get Tickets." You\'ll be taken to a secure checkout. After payment, your ticket is confirmed and appears in My Tickets.' },
      { q: 'Where are my tickets?', a: 'All your confirmed tickets are in My Tickets (accessible from the menu). You\'ll also receive a confirmation email with your ticket details.' },
      { q: 'Can I get a refund?', a: 'Ticket purchases are final unless the host cancels the event. If an event is cancelled, you\'ll receive a full refund within 5–10 business days.' },
    ],
  },
  {
    category: 'Hosting Events',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    questions: [
      { q: 'How do I create an event?', a: 'Sign up or log in, upgrade to a Host account from your dashboard, then click "Create Event." Fill in your event details, set ticket tiers and prices, and your event goes live immediately.' },
      { q: 'What fees does Metlanta charge?', a: 'Metlanta charges a tiered platform fee (15–22%) on each paid ticket sold. Free RSVPs are always free. There are no monthly fees or upfront costs.' },
      { q: 'How do I check in guests?', a: 'Guests show their QR code ticket at the door. You can scan tickets directly from your host dashboard using the built-in QR scanner.' },
      { q: 'When do I get paid?', a: 'Connect your Stripe account in the dashboard. Revenue routes directly to your bank. Stripe typically deposits within 2 business days after your event.' },
    ],
  },
  {
    category: 'Payments & Security',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    questions: [
      { q: 'Is my payment information secure?', a: 'Yes. All payments are processed by Stripe, a PCI-DSS Level 1 certified payment processor. Metlanta never sees or stores your card information.' },
      { q: 'What payment methods do you accept?', a: 'Metlanta accepts all major credit and debit cards (Visa, Mastercard, Amex, Discover) via Stripe. Apple Pay and Google Pay are also supported where available.' },
    ],
  },
  {
    category: 'At the Event',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
    questions: [
      { q: 'How do I show my ticket?', a: 'Open My Tickets in the Metlanta app and show your QR code to the host or door staff. Keep your screen brightness high for fastest scanning.' },
      { q: 'What if my phone dies?', a: 'Screenshot your ticket QR code before the event as a backup. You can also provide your name and email to the host to verify your purchase.' },
    ],
  },
]

const QUICK_LINKS = [
  { label: 'Find Events', href: '/#events', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg> },
  { label: 'My Tickets', href: '/tickets', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z"/></svg> },
  { label: 'Host Events', href: '/dashboard', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
  { label: 'Marketplace', href: '/marketplace', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
]

/* ── FAQ item ─────────────────────────────────────────────────────────────── */

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <button className="faq-item" onClick={() => setOpen((v) => !v)}>
      <div className="faq-question">
        <span>{q}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.22s' }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>
      {open && <p className="faq-answer">{a}</p>}
    </button>
  )
}

/* ── Support ticket modal ────────────────────────────────────────────────── */

function generateCaptcha() {
  const a = Math.floor(Math.random() * 10) + 1
  const b = Math.floor(Math.random() * 10) + 1
  return { question: `${a} + ${b}`, answer: a + b }
}

function SupportModal({ onClose }: { onClose: () => void }) {
  const captcha = useMemo(() => generateCaptcha(), [])
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [captchaAnswer, setCaptchaAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          message,
          captchaAnswer,
          captchaQuestion: captcha.question,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Something went wrong'); return }
      setDone(true)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box support-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        {done ? (
          <div className="support-done">
            <div className="support-done-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h2 className="modal-title">Ticket submitted</h2>
            <p style={{ color: '#666', fontSize: 14, textAlign: 'center', marginTop: 8 }}>
              We&apos;ll get back to you at support@metlanta.com within 24 hours.
            </p>
            <button className="btn btn-red" style={{ marginTop: 20, width: '100%', justifyContent: 'center' }} onClick={onClose}>
              Close
            </button>
          </div>
        ) : (
          <>
            <h2 className="modal-title">New Support Ticket</h2>

            {/* Warning box */}
            <div className="support-warning">
              <div className="support-warning-head">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span>Before submitting:</span>
              </div>
              <ul>
                <li>Be specific — vague tickets can&apos;t be resolved</li>
                <li>Describe what happened and what you expected</li>
                <li>Include relevant details (event name, order ID, etc.)</li>
              </ul>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 4 }}>
              <div>
                <label className="support-label">SUBJECT</label>
                <input
                  className="input"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Brief description of your issue"
                  required
                  maxLength={120}
                />
              </div>

              <div>
                <label className="support-label">MESSAGE</label>
                <textarea
                  className="input"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your issue in detail…"
                  rows={5}
                  required
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div className="support-captcha">
                <p className="support-captcha-label">VERIFY YOU&apos;RE HUMAN</p>
                <p className="support-captcha-q">What is {captcha.question}?</p>
                <input
                  className="input"
                  value={captchaAnswer}
                  onChange={(e) => setCaptchaAnswer(e.target.value)}
                  placeholder="Enter answer"
                  required
                  style={{ marginTop: 10 }}
                />
              </div>

              {error && <p style={{ color: 'var(--red)', fontSize: 13 }}>{error}</p>}

              <button type="submit" className="btn btn-red" disabled={loading} style={{ justifyContent: 'center', marginTop: 4 }}>
                {loading ? 'Submitting…' : 'Create Ticket'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

/* ── Page ─────────────────────────────────────────────────────────────────── */

export default function HelpPage() {
  const router = useRouter()
  const [showSupport, setShowSupport] = useState(false)

  return (
    <div className="acc-page">
      <div className="acc-header">
        <button className="acc-back" onClick={() => router.back()}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
        </button>
        <h1 className="acc-title">Help Center</h1>
      </div>

      <div className="help-content">
        <div className="help-hero">
          <div className="help-hero-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <h2 className="help-hero-title">Help Center</h2>
          <p className="help-hero-sub">Everything you need to know about Metlanta</p>
        </div>

        <div className="help-quick-links">
          {QUICK_LINKS.map((l) => (
            <a key={l.label} href={l.href} className="help-quick-btn">
              {l.icon}
              <span>{l.label}</span>
            </a>
          ))}
        </div>

        <div className="help-sections">
          {FAQS.map((section) => (
            <div key={section.category} className="faq-section">
              <div className="faq-section-header">
                {section.icon}
                <h3 className="faq-section-title">{section.category}</h3>
              </div>
              <div className="faq-list">
                {section.questions.map((item) => (
                  <FAQItem key={item.q} q={item.q} a={item.a} />
                ))}
              </div>
            </div>
          ))}

          <div className="help-terms">
            <h3 className="help-terms-title">Terms & Policies</h3>
            <p className="help-terms-body">
              By using Metlanta, you agree to our terms of service. Metlanta charges a tiered platform fee on all paid ticket sales. Ticket purchases are final unless the event is cancelled by the host.
            </p>
            <p className="help-terms-body" style={{ marginTop: 10 }}>
              Event hosts are responsible for their event policies, including refunds, age restrictions, and venue rules.
            </p>
            <a href="#" className="help-terms-link">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
              Read Full Terms of Service
            </a>
          </div>

          <div className="help-contact">
            <p>Still need help?</p>
            <button className="btn btn-red" style={{ marginTop: 12 }} onClick={() => setShowSupport(true)}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              Open Support Ticket
            </button>
          </div>
        </div>
      </div>

      {showSupport && <SupportModal onClose={() => setShowSupport(false)} />}
    </div>
  )
}
