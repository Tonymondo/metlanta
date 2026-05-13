'use client'

import Link from 'next/link'
import AnimatedSection from '@/components/ui/AnimatedSection'

const INCLUDED = [
  'Unlimited event pages',
  'Custom ticket tiers (General, VIP, Early Bird, Free)',
  'Live sales dashboard',
  'QR code check-in',
  'Same-night payouts via Stripe',
  'Share link + embed',
  'Guest list management',
  'Event analytics',
]

export default function Pricing() {
  return (
    <section id="pricing" className="relative py-24 lg:py-32 overflow-hidden">
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(224,48,48,0.05) 0%, transparent 70%)' }}
        aria-hidden
      />

      <div className="section-wrapper relative z-10">
        <AnimatedSection className="text-center mb-12">
          <div className="label mb-4">Pricing</div>
          <h2 className="text-[clamp(30px,5vw,52px)] font-extrabold tracking-tight mb-4">
            Simple. No surprises.
          </h2>
          <p className="text-lg max-w-sm mx-auto" style={{ color: '#888' }}>
            Free to create. We only make money when you do.
          </p>
        </AnimatedSection>

        <AnimatedSection>
          <div className="max-w-lg mx-auto">
            <div className="card rounded-2xl overflow-hidden">
              {/* Top band */}
              <div className="px-6 py-8 text-center" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="label mb-3">All hosts</div>
                <div className="flex items-baseline justify-center gap-1 mb-2">
                  <span className="text-[clamp(48px,8vw,72px)] font-extrabold tracking-tight" style={{ color: '#F0F0F0', lineHeight: 1 }}>
                    Free
                  </span>
                </div>
                <p className="text-sm" style={{ color: '#888' }}>
                  to create events and list on Metlanta
                </p>

                <div
                  className="inline-flex items-center gap-2 mt-5 px-4 py-2.5 rounded-xl text-sm font-semibold"
                  style={{ background: 'rgba(224,48,48,0.1)', border: '1px solid rgba(224,48,48,0.2)', color: '#F0F0F0' }}
                >
                  <span style={{ color: 'var(--red)' }}>5%</span>
                  &nbsp;+ payment processing on paid tickets only
                </div>
              </div>

              {/* Features list */}
              <div className="px-6 py-7">
                <p className="text-[10px] font-bold uppercase tracking-[2px] mb-4" style={{ color: '#444' }}>
                  Everything included
                </p>
                <ul className="space-y-3">
                  {INCLUDED.map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      <span className="text-sm" style={{ color: '#888' }}>{item}</span>
                    </li>
                  ))}
                </ul>

                <Link href="#host" className="btn btn-red w-full mt-8 justify-center">
                  Create Your First Event
                </Link>
                <p className="text-center text-xs mt-3" style={{ color: '#444' }}>
                  No credit card needed to start
                </p>
              </div>
            </div>

            {/* FAQ note */}
            <p className="text-center text-sm mt-6" style={{ color: '#555' }}>
              Stripe handles all payments. You get paid directly. We take{' '}
              <span style={{ color: '#888' }}>5%</span> of each paid ticket sale.
              Free RSVPs are always 100% free for everyone.
            </p>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
