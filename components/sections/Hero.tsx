'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.25, 0.4, 0.25, 1] } },
}

function TicketCard() {
  return (
    <div className="glass rounded-2xl overflow-hidden w-72 animate-float" style={{ animationDelay: '0s' }}>
      {/* Event image banner */}
      <div
        className="h-28 relative flex items-end p-3"
        style={{ background: 'linear-gradient(135deg, #1a0000 0%, #2d0808 60%, #080808 100%)' }}
      >
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(circle at 70% 40%, rgba(224,48,48,0.18) 0%, transparent 65%)' }}
          aria-hidden
        />
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
          <span className="tag tag-red">After Prom</span>
          <span className="tag tag-white">All Ages</span>
        </div>
        <div className="relative z-10">
          <div className="text-[10px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: 'var(--red)' }}>
            Sat May 10 · Doors 10PM
          </div>
          <div className="text-sm font-bold text-t1">After Prom Experience ATL</div>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex -space-x-1.5">
            {['#E03030', '#444', '#666', '#333'].map((c, i) => (
              <div key={i} className="w-6 h-6 rounded-full border border-bg" style={{ background: c }} />
            ))}
            <span className="text-[10px] text-t2 ml-2 self-center">2.4k going</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="live-dot" />
            <span className="text-[10px] font-semibold text-green-400">On sale</span>
          </div>
        </div>

        <div className="flex gap-2">
          {[
            { tier: 'Early Bird', price: '$25', color: '#22C55E', sold: true },
            { tier: 'General', price: '$35', color: 'var(--red)', sold: false },
            { tier: 'VIP', price: '$80', color: '#A78BFA', sold: false },
          ].map((t) => (
            <div
              key={t.tier}
              className="flex-1 rounded-xl p-2 text-center"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', opacity: t.sold ? 0.5 : 1 }}
            >
              <div className="text-[9px] text-t3 uppercase tracking-wide mb-0.5">{t.tier}</div>
              <div className="text-xs font-bold" style={{ color: t.sold ? '#888' : t.color }}>
                {t.sold ? 'Sold' : t.price}
              </div>
            </div>
          ))}
        </div>

        <button
          className="btn btn-red w-full mt-3 justify-center"
          style={{ padding: '11px', fontSize: '13px', borderRadius: '10px' }}
        >
          Get Tickets
        </button>
      </div>
    </div>
  )
}

function SalesCard() {
  return (
    <motion.div
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      className="glass rounded-xl px-4 py-3"
      style={{ border: '1px solid rgba(34,197,94,0.2)', minWidth: '170px' }}
    >
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-400 animate-blink flex-shrink-0" />
        <div>
          <div className="text-[11px] font-bold text-t1">Ticket sold!</div>
          <div className="text-[9px] text-t2">General · @zay.atl · 12s ago</div>
        </div>
      </div>
    </motion.div>
  )
}

function StatsCard() {
  return (
    <motion.div
      animate={{ y: [0, 6, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
      className="glass rounded-xl px-4 py-3"
      style={{ border: '1px solid rgba(224,48,48,0.18)', minWidth: '150px' }}
    >
      <div className="text-[10px] text-t3 uppercase tracking-wide mb-1">Tonight&apos;s revenue</div>
      <div className="text-lg font-bold text-t1">$3,840</div>
      <div className="text-[10px] text-green-400">↑ 128 tickets sold</div>
    </motion.div>
  )
}

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden grid-bg"
      style={{ paddingTop: '80px' }}
    >
      {/* Ambient red glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(224,48,48,0.07) 0%, transparent 65%)' }}
        aria-hidden
      />

      <div className="section-wrapper relative z-10 w-full">
        <div className="flex flex-col lg:flex-row items-center gap-14 lg:gap-10 py-16 lg:py-20">

          {/* Left: copy */}
          <div className="flex-1 text-center lg:text-left max-w-xl mx-auto lg:mx-0">
            <motion.div variants={stagger} initial="hidden" animate="visible">

              <motion.div variants={fadeUp} className="mb-5 flex justify-center lg:justify-start">
                <div
                  className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[2.5px] px-3 py-1.5 rounded-full"
                  style={{ background: 'rgba(224,48,48,0.1)', color: 'var(--red)', border: '1px solid rgba(224,48,48,0.2)' }}
                >
                  <span className="w-1.5 h-1.5 rounded-full animate-blink" style={{ background: 'var(--red)' }} />
                  Social Ticketing for the Party Generation
                </div>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                className="text-[clamp(38px,6.5vw,72px)] font-extrabold leading-[1.06] tracking-tight mb-6"
              >
                Throw Parties.
                <br />
                Sell Tickets.
                <br />
                <span className="gradient-text">Build Your Name.</span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="text-[clamp(15px,1.8vw,17px)] leading-relaxed mb-5 max-w-md mx-auto lg:mx-0"
                style={{ color: '#888' }}
              >
                Metlanta is the platform for young promoters, DJs, and hosts.
                Create your event, set ticket tiers, and sell out your function
                — whether it&apos;s an after prom or a Saturday kickback.
              </motion.p>

              {/* Event type pills */}
              <motion.div
                variants={fadeUp}
                className="flex flex-wrap gap-2 justify-center lg:justify-start mb-8"
              >
                {['After Proms', 'Day Parties', 'Kickbacks', 'Functions', 'School Events'].map((tag) => (
                  <span key={tag} className="tag tag-white">{tag}</span>
                ))}
              </motion.div>

              <motion.div
                variants={fadeUp}
                className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start"
              >
                <Link href="#host" className="btn btn-red">
                  Start Hosting Free
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </Link>
                <Link href="#events" className="btn btn-ghost">
                  Explore Events
                </Link>
              </motion.div>

              <motion.p
                variants={fadeUp}
                className="text-xs mt-4 text-center lg:text-left"
                style={{ color: '#444' }}
              >
                Free to list · 5% fee on ticket sales only · No monthly costs
              </motion.p>
            </motion.div>
          </div>

          {/* Right: floating cards */}
          <div className="hidden lg:flex relative w-[320px] xl:w-[360px] h-[500px] flex-shrink-0">
            <div className="absolute top-8 right-0 z-20">
              <TicketCard />
            </div>
            <div className="absolute top-[80px] -left-8 z-30">
              <SalesCard />
            </div>
            <div className="absolute bottom-16 left-0 z-20">
              <StatsCard />
            </div>
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse 70% 60% at 55% 50%, rgba(224,48,48,0.06) 0%, transparent 70%)' }}
              aria-hidden
            />
          </div>
        </div>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent, #080808)' }}
        aria-hidden
      />
    </section>
  )
}
