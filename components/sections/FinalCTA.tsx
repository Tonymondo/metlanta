'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import AnimatedSection from '@/components/ui/AnimatedSection'
import Link from 'next/link'

export default function FinalCTA() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setSubmitted(true)
    setEmail('')
  }

  return (
    <section
      id="download"
      className="relative py-28 lg:py-40 overflow-hidden"
      style={{ background: '#080808' }}
    >
      {/* Glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(224,48,48,0.1) 0%, transparent 65%)' }}
        aria-hidden
      />
      <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" aria-hidden />

      <div className="section-wrapper relative z-10 text-center">
        <AnimatedSection className="max-w-2xl mx-auto">
          <div className="label mb-5 justify-center flex">Ready to run your first function?</div>

          <h2 className="text-[clamp(36px,7vw,68px)] font-extrabold tracking-tight leading-tight mb-5">
            Your first event
            <br />
            <span className="gradient-text">starts tonight.</span>
          </h2>

          <p className="text-lg leading-relaxed max-w-md mx-auto mb-10" style={{ color: '#888' }}>
            No experience. No upfront cost. Just your idea, a date,
            and the drive to throw something people won&apos;t forget.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
            <Link href="#host" className="btn btn-red" style={{ fontSize: '16px', padding: '15px 32px' }}>
              Create Your Event — It&apos;s Free
            </Link>
            <Link href="#events" className="btn btn-ghost" style={{ fontSize: '16px' }}>
              Explore Events First
            </Link>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 max-w-xs mx-auto mb-8">
            <div className="divider flex-1" />
            <span className="text-xs uppercase tracking-widest" style={{ color: '#333' }}>or</span>
            <div className="divider flex-1" />
          </div>

          {/* Email waitlist */}
          {!submitted ? (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-sm mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="input flex-1"
              />
              <button type="submit" className="btn btn-red whitespace-nowrap">
                Join Waitlist
              </button>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl"
              style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span className="text-sm font-semibold text-green-400">
                You&apos;re on the list — we&apos;ll hit you when we launch!
              </span>
            </motion.div>
          )}

          <p className="text-xs mt-4" style={{ color: '#333' }}>
            No spam. Launch updates and early host access only.
          </p>
        </AnimatedSection>
      </div>
    </section>
  )
}
