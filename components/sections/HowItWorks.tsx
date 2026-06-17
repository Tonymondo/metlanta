'use client'

import AnimatedSection, { AnimatedGroup, itemVariants } from '@/components/ui/AnimatedSection'
import { motion } from 'framer-motion'

const STEPS = [
  {
    num: '01',
    title: 'Create your event',
    body: 'Build a professional event page in under 5 minutes. Set ticket tiers, upload your flyer, and configure your Stripe payout.',
    checks: [
      'Upload event flyer or banner',
      'Set multiple ticket tiers (Free, GA, VIP)',
      'Configure venue, date & capacity',
      'Connect Stripe to receive payouts',
    ],
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
        <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"/>
      </svg>
    ),
  },
  {
    num: '02',
    title: 'Share everywhere',
    body: 'Your event gets its own shareable link. Post it anywhere — Instagram, TikTok, Twitter, group chats — and recruit promoters.',
    checks: [
      'Unique shareable event link',
      'Share directly to Instagram & TikTok',
      'Invite promoters with referral links',
      'Track clicks and conversions in real time',
    ],
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="18" cy="5" r="3"/>
        <circle cx="6" cy="12" r="3"/>
        <circle cx="18" cy="19" r="3"/>
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
      </svg>
    ),
  },
  {
    num: '03',
    title: 'Sell out. Get paid.',
    body: 'Watch ticket sales roll in from your dashboard. Check guests in with QR codes. Stripe deposits land directly in your account.',
    checks: [
      'Live ticket sales dashboard',
      'QR code guest check-in app',
      'Real-time revenue & analytics',
      'Stripe payout straight to your bank',
    ],
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23"/>
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>
    ),
  },
]

const CheckIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}>
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-24 lg:py-36 overflow-hidden">
      {/* Ambient background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 50%, rgba(224,48,48,0.035) 0%, transparent 70%)' }}
        aria-hidden
      />

      <div className="section-wrapper relative z-10">
        {/* Header */}
        <AnimatedSection className="text-center mb-16 lg:mb-20">
          <div className="label mb-4">How It Works</div>
          <h2 className="text-[clamp(32px,5.5vw,60px)] font-extrabold tracking-tight mb-5 leading-none">
            From idea to sold out<br />
            <span className="gradient-text">in three steps.</span>
          </h2>
          <p className="text-base lg:text-lg leading-relaxed max-w-sm mx-auto" style={{ color: '#666' }}>
            No experience needed. If you can post a story, you can run an event.
          </p>
        </AnimatedSection>

        {/* Steps */}
        <AnimatedGroup className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 relative">

          {/* Desktop connector arrows */}
          <div className="hidden md:flex absolute top-[52px] left-[calc(33%+8px)] right-[calc(33%+8px)] items-center pointer-events-none z-10" aria-hidden>
            {[0, 1].map((i) => (
              <div key={i} className="flex-1 flex items-center justify-center">
                <svg width="40" height="14" viewBox="0 0 40 14" fill="none" style={{ opacity: 0.35 }}>
                  <line x1="0" y1="7" x2="32" y2="7" stroke="#E03030" strokeWidth="1.5" strokeDasharray="4 3"/>
                  <path d="M30 3l6 4-6 4" stroke="#E03030" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            ))}
          </div>

          {STEPS.map((step, idx) => (
            <motion.div
              key={step.num}
              variants={itemVariants}
              className="relative rounded-2xl p-7 overflow-hidden group"
              style={{
                background: '#0f0f0f',
                border: '1px solid rgba(255,255,255,0.07)',
                transition: 'border-color 0.25s, box-shadow 0.25s',
              }}
              whileHover={{
                borderColor: 'rgba(224,48,48,0.25)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(224,48,48,0.1)',
              }}
            >
              {/* Giant faded step number */}
              <div
                className="display absolute -right-2 -top-4 text-[120px] leading-none select-none pointer-events-none"
                style={{
                  color: 'transparent',
                  WebkitTextStroke: '1px rgba(224,48,48,0.07)',
                  fontFamily: 'var(--font-bebas)',
                  letterSpacing: '-2px',
                }}
                aria-hidden
              >
                {step.num}
              </div>

              {/* Icon + step number row */}
              <div className="flex items-center gap-3 mb-5 relative z-10">
                <div style={{
                  width: 48, height: 48,
                  borderRadius: 14,
                  background: 'rgba(224,48,48,0.08)',
                  border: '1px solid rgba(224,48,48,0.18)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--red)',
                  flexShrink: 0,
                }}>
                  {step.icon}
                </div>
                <div style={{
                  fontSize: 11, fontWeight: 700, letterSpacing: '2px',
                  textTransform: 'uppercase', color: 'var(--red)', opacity: 0.7,
                }}>
                  Step {idx + 1}
                </div>
              </div>

              {/* Title */}
              <h3 className="text-[18px] font-extrabold mb-2 leading-tight relative z-10" style={{ color: '#F0F0F0', letterSpacing: '-0.3px' }}>
                {step.title}
              </h3>

              {/* Body */}
              <p className="text-[13px] leading-relaxed mb-5 relative z-10" style={{ color: '#666' }}>
                {step.body}
              </p>

              {/* Divider */}
              <div className="relative z-10 mb-5" style={{ height: 1, background: 'rgba(255,255,255,0.05)' }} />

              {/* Checklist */}
              <ul className="relative z-10 space-y-2">
                {step.checks.map((check) => (
                  <li key={check} className="flex items-start gap-2.5">
                    <CheckIcon />
                    <span style={{ fontSize: 13, color: '#999', lineHeight: 1.5 }}>{check}</span>
                  </li>
                ))}
              </ul>

              {/* Bottom accent line on hover */}
              <div
                className="absolute bottom-0 left-0 right-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: 'linear-gradient(90deg, transparent, var(--red), transparent)' }}
                aria-hidden
              />
            </motion.div>
          ))}
        </AnimatedGroup>

        {/* CTA */}
        <AnimatedSection className="text-center mt-12 lg:mt-16">
          <a href="/dashboard" className="btn btn-red inline-flex">
            Start Hosting — It&apos;s Free
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </a>
          <p className="mt-3 text-xs" style={{ color: '#444' }}>No monthly fees · 15% per paid ticket · Stripe payouts</p>
        </AnimatedSection>
      </div>
    </section>
  )
}
