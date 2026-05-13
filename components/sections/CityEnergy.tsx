'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import AnimatedSection from '@/components/ui/AnimatedSection'

const STATS = [
  { value: '1K+', label: 'Events / week' },
  { value: '50K+', label: 'Members & growing' },
  { value: '50+', label: 'Cities' },
  { value: '4.9★', label: 'App rating' },
]

const EVENT_TYPES = [
  'After Proms', 'Day Parties', 'Kickbacks', 'Rooftop Events',
  'School Parties', 'Pop-up Concerts', 'Block Parties', 'House Parties',
  'Club Nights', 'Cookouts', 'Birthday Events', 'Tailgates',
]

export default function CityEnergy() {
  const sectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['-6%', '6%'])

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative py-28 lg:py-40 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #050505 0%, #0a0508 50%, #050505 100%)' }}
    >
      {/* Parallax layer */}
      <motion.div className="absolute inset-0 pointer-events-none" style={{ y }} aria-hidden>
        <div className="absolute top-[10%] left-[5%] w-48 h-48 rounded-2xl opacity-20"
          style={{ background: 'linear-gradient(135deg, #1a0800, #3d1400)' }} />
        <div className="absolute top-[20%] right-[8%] w-64 h-64 rounded-2xl opacity-15"
          style={{ background: 'linear-gradient(135deg, #0d001a, #1a0033)' }} />
        <div className="absolute bottom-[15%] left-[12%] w-56 h-56 rounded-2xl opacity-20"
          style={{ background: 'linear-gradient(135deg, #001a0d, #0d3319)' }} />
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(255,92,27,0.05) 0%, transparent 70%)' }}
        />
      </motion.div>

      <div className="absolute top-0 inset-x-0 h-20 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, #050505, transparent)' }} aria-hidden />
      <div className="absolute bottom-0 inset-x-0 h-20 pointer-events-none"
        style={{ background: 'linear-gradient(to top, #050505, transparent)' }} aria-hidden />

      <div className="section-wrapper relative z-10 text-center">
        <AnimatedSection>
          <div className="section-label justify-center flex mb-4">Everywhere You Party</div>

          <h2 className="text-[clamp(40px,8vw,90px)] font-extrabold tracking-tight leading-[0.95] mb-6">
            <span className="font-display text-t1" style={{ fontFamily: 'var(--font-bebas)', letterSpacing: '3px' }}>
              YOUR CITY.
            </span>
            <br />
            <span className="gradient-text">YOUR PARTY.</span>
          </h2>

          <p className="text-t2 text-lg leading-relaxed max-w-xl mx-auto mb-12">
            From high school after proms to college day parties to city-wide nightlife —
            Metlanta is the platform where every generation of party-throwers builds
            their reputation and finds their crew.
          </p>
        </AnimatedSection>

        {/* Stats */}
        <AnimatedSection delay={0.15} className="mb-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl p-6 border"
                style={{ background: 'rgba(15,15,15,0.7)', borderColor: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(10px)' }}
              >
                <div className="text-[clamp(28px,4vw,42px)] font-extrabold tracking-tight mb-1 gradient-text">
                  {s.value}
                </div>
                <div className="text-xs font-semibold text-t2 uppercase tracking-wider">{s.label}</div>
              </div>
            ))}
          </div>
        </AnimatedSection>

        {/* Event type tags */}
        <AnimatedSection delay={0.25}>
          <p className="text-xs text-t3 uppercase tracking-widest font-semibold mb-4">
            Every type of party, one platform
          </p>
          <div className="flex flex-wrap justify-center gap-2.5">
            {EVENT_TYPES.map((n) => (
              <span
                key={n}
                className="text-sm font-medium px-4 py-2 rounded-full border transition-all hover:border-accent hover:text-accent cursor-default"
                style={{ background: 'rgba(15,15,15,0.6)', borderColor: 'rgba(255,255,255,0.08)', color: '#888' }}
              >
                {n}
              </span>
            ))}
            <span
              className="text-sm font-medium px-4 py-2 rounded-full border"
              style={{ background: 'rgba(255,92,27,0.08)', borderColor: 'rgba(255,92,27,0.2)', color: '#FF5C1B' }}
            >
              + Whatever You Make It
            </span>
          </div>
        </AnimatedSection>

        {/* Teen/school callout */}
        <AnimatedSection delay={0.35} className="mt-14">
          <div
            className="rounded-2xl p-8 md:p-10 text-center border relative overflow-hidden max-w-2xl mx-auto"
            style={{ background: 'linear-gradient(135deg, rgba(255,92,27,0.06) 0%, rgba(139,92,246,0.06) 100%)', borderColor: 'rgba(255,255,255,0.08)' }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(255,92,27,0.08) 0%, transparent 70%)' }}
              aria-hidden
            />
            <div className="relative z-10">
              <div className="text-2xl mb-3">🎓</div>
              <h3 className="text-xl md:text-2xl font-extrabold text-t1 mb-3 tracking-tight">
                Built for the Next Generation of Party Throwers
              </h3>
              <p className="text-t2 text-base leading-relaxed">
                Whether you&apos;re hosting your first after prom, running school events, or building
                toward being the promoter everyone knows — Metlanta gives you the platform and audience
                to go from unknown to unforgettable.
              </p>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
