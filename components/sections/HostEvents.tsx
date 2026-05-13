'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import AnimatedSection from '@/components/ui/AnimatedSection'

const BENEFITS = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
      </svg>
    ),
    title: 'Live in 5 minutes',
    body: 'Build your event page, set ticket tiers, and go live before you finish your lunch break.',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
      </svg>
    ),
    title: 'Stripe-powered payouts',
    body: 'Multiple ticket tiers. Real-time sales tracking. Payout to your bank the same night your event drops.',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
    title: 'Build your rep',
    body: 'Every event adds to your host profile. Attendees rate the function. Your name grows on and off the platform.',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>
      </svg>
    ),
    title: 'Share one link',
    body: 'One URL for your event page, ticket purchase, and guest list. Drop it in your bio and let it work.',
  },
]

function DashboardPreview() {
  return (
    <div className="relative">
      <div
        className="absolute -inset-8 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(224,48,48,0.08) 0%, transparent 70%)' }}
        aria-hidden
      />

      <div className="glass rounded-2xl p-5" style={{ maxWidth: '340px', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="text-[10px] mb-1" style={{ color: '#555' }}>Your Event Dashboard</div>
            <div className="text-sm font-bold" style={{ color: '#F0F0F0' }}>Senior After Prom 2026</div>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
            <div className="live-dot" style={{ width: '6px', height: '6px' }} />
            <span className="text-[9px] font-bold text-green-400">Live</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2.5 mb-5">
          {[
            { label: 'Sold', value: '412', delta: '+18 today' },
            { label: 'Revenue', value: '$7.2K', delta: '+$310 today' },
            { label: 'Capacity', value: '82%', delta: '500 cap' },
          ].map((s) => (
            <div key={s.label} className="rounded-xl p-2.5 text-center" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <div className="text-base font-bold" style={{ color: '#F0F0F0' }}>{s.value}</div>
              <div className="text-[8px] uppercase tracking-wide" style={{ color: '#444' }}>{s.label}</div>
              <div className="text-[9px] text-green-400 mt-0.5">{s.delta}</div>
            </div>
          ))}
        </div>

        <div className="text-[9px] uppercase tracking-widest font-semibold mb-2" style={{ color: '#444' }}>Ticket Tiers</div>
        {[
          { tier: 'Early Bird', sold: 150, cap: 150, price: '$25', color: '#22C55E' },
          { tier: 'General',   sold: 230, cap: 300, price: '$40', color: 'var(--red)' },
          { tier: 'VIP Table', sold: 32,  cap: 50,  price: '$100', color: '#A78BFA' },
        ].map((t) => (
          <div key={t.tier} className="mb-2.5">
            <div className="flex justify-between text-[10px] mb-1">
              <span className="font-semibold" style={{ color: '#F0F0F0' }}>{t.tier}</span>
              <span style={{ color: '#555' }}>{t.sold}/{t.cap} · {t.price}</span>
            </div>
            <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div
                className="h-full rounded-full"
                style={{ width: `${(t.sold / t.cap) * 100}%`, background: t.color }}
              />
            </div>
          </div>
        ))}

        <div className="flex gap-2 mt-4">
          <button
            className="flex-1 py-2.5 rounded-xl text-[11px] font-bold text-white"
            style={{ background: 'var(--red)' }}
          >
            Promote Event
          </button>
          <button
            className="flex-1 py-2.5 rounded-xl text-[11px] font-semibold border"
            style={{ background: 'transparent', borderColor: 'rgba(255,255,255,0.1)', color: '#F0F0F0' }}
          >
            Guest List
          </button>
        </div>
      </div>

      <motion.div
        animate={{ y: [0, -7, 0] }}
        transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-3 -right-4 glass rounded-xl px-3.5 py-2.5"
        style={{ border: '1px solid rgba(34,197,94,0.2)', minWidth: '155px' }}
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
          <div>
            <div className="text-[10px] font-bold" style={{ color: '#F0F0F0' }}>New ticket sold!</div>
            <div className="text-[9px]" style={{ color: '#555' }}>VIP · @aaliyah.t · just now</div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default function HostEvents() {
  return (
    <section id="host" className="relative py-24 lg:py-32 overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(180deg, #050505 0%, rgba(224,48,48,0.02) 50%, #050505 100%)' }}
        aria-hidden
      />

      <div className="section-wrapper relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">

          {/* Left: copy */}
          <div>
            <AnimatedSection>
              <div className="label mb-4">For Young Promoters & Creators</div>
              <h2 className="text-[clamp(30px,5vw,52px)] font-extrabold tracking-tight mb-5">
                Go from throwing
                <br />
                kickbacks to running
                <br />
                <span className="gradient-text">sold-out events.</span>
              </h2>
              <p className="text-lg leading-relaxed mb-10" style={{ color: '#888' }}>
                Whether it&apos;s your first after prom or your twentieth day party —
                Metlanta gives every young promoter the tools and audience to level up fast.
              </p>
            </AnimatedSection>

            <div className="space-y-4">
              {BENEFITS.map((b, i) => (
                <AnimatedSection key={b.title} delay={i * 0.1}>
                  <div className="flex items-start gap-4">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: 'rgba(224,48,48,0.08)', border: '1px solid rgba(224,48,48,0.15)' }}
                    >
                      {b.icon}
                    </div>
                    <div>
                      <div className="text-sm font-bold mb-1" style={{ color: '#F0F0F0' }}>{b.title}</div>
                      <div className="text-sm leading-relaxed" style={{ color: '#888' }}>{b.body}</div>
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>

            <AnimatedSection delay={0.4} className="mt-10">
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="#host" className="btn btn-red">
                  Start Hosting Free
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </Link>
                <Link href="#pricing" className="btn btn-ghost">
                  See Pricing
                </Link>
              </div>
              <p className="text-xs mt-3" style={{ color: '#444' }}>
                Free to list · 5% platform fee on ticket sales only · No monthly fees
              </p>
            </AnimatedSection>
          </div>

          {/* Right: dashboard preview */}
          <AnimatedSection direction="left" className="flex justify-center lg:justify-end">
            <DashboardPreview />
          </AnimatedSection>
        </div>
      </div>
    </section>
  )
}
