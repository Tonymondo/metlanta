'use client'

import { motion } from 'framer-motion'
import AnimatedSection, { AnimatedGroup, itemVariants } from '@/components/ui/AnimatedSection'

const TESTIMONIALS = [
  {
    name: 'Jordan R.',
    handle: '@jray_atl',
    role: 'Event Promoter',
    color: '#FF5C1B',
    rating: 5,
    text: "Metlanta completely changed how I promote events. My last party sold out 3 days early because of the social reach. The event chat alone had people connecting before they even showed up.",
  },
  {
    name: 'Nia Clarke',
    handle: '@nia.c',
    role: 'Metlanta Member',
    color: '#8B5CF6',
    rating: 5,
    text: "I'm introverted but love going out. Finding people to link with used to be the hardest part. Metlanta solved that — I literally made 4 new friends at Sunday Funday through the app before I arrived.",
  },
  {
    name: 'Marcus Davis',
    handle: '@_mdr',
    role: 'Creative Director',
    color: '#22C55E',
    rating: 5,
    text: "As a creative I needed a platform that matched the culture. Metlanta hits different — it's not corporate, it's not generic. It actually feels like it was built for Atlanta.",
  },
  {
    name: 'Aaliyah T.',
    handle: '@aali.t',
    role: 'Nightlife Enthusiast',
    color: '#F59E0B',
    rating: 5,
    text: "The vibe matching feature is lowkey genius. I went to an event last week and literally everyone I connected with on Metlanta had the same taste in music. We ended up at an after-party together.",
  },
  {
    name: 'Chris Okafor',
    handle: '@chrisokafor',
    role: 'Brand Manager',
    color: '#EC4899',
    rating: 5,
    text: "We partnered with Metlanta for our brand activation and the results were insane. 900 RSVPs, 60% showed up — that conversion rate doesn't happen on any other platform.",
  },
  {
    name: 'Destiny W.',
    handle: '@desw',
    role: 'Community Host',
    color: '#06B6D4',
    rating: 5,
    text: "I host monthly community events and Metlanta gave my brand a real platform. The analytics are actually useful — I can see who's engaging, not just who bought a ticket.",
  },
]

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5 mb-3" aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill={i < count ? '#F59E0B' : 'rgba(255,255,255,0.1)'}>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </div>
  )
}

export default function Testimonials() {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(139,92,246,0.04) 0%, transparent 70%)',
        }}
        aria-hidden
      />

      <div className="section-wrapper relative z-10">
        {/* Header */}
        <AnimatedSection className="text-center mb-14">
          <div className="section-label justify-center flex">Social Proof</div>
          <h2 className="text-[clamp(28px,4vw,48px)] font-extrabold tracking-tight mb-4">
            Real people.
            <span className="gradient-text"> Real vibes.</span>
          </h2>
          <p className="text-t2 text-base max-w-md mx-auto leading-relaxed">
            From promoters to first-timers — Metlanta is building Atlanta&apos;s most active social event community.
          </p>
        </AnimatedSection>

        {/* Testimonial grid */}
        <AnimatedGroup className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {TESTIMONIALS.map((t) => (
            <motion.div
              key={t.handle}
              variants={itemVariants}
              className="card-hover rounded-2xl p-6 border flex flex-col"
              style={{
                background: '#0f0f0f',
                borderColor: 'rgba(255,255,255,0.07)',
              }}
            >
              {/* Top: user */}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-content-center text-sm font-bold text-black flex-shrink-0"
                  style={{ background: t.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  aria-hidden
                >
                  {t.name[0]}
                </div>
                <div>
                  <div className="text-sm font-bold text-t1">{t.name}</div>
                  <div className="text-xs text-t2">{t.handle} · {t.role}</div>
                </div>
              </div>

              <Stars count={t.rating} />

              <p className="text-sm text-t2 leading-relaxed flex-1 italic">
                &ldquo;{t.text}&rdquo;
              </p>

              {/* Bottom accent */}
              <div
                className="mt-4 h-[1px] w-8 rounded-full"
                style={{ background: t.color }}
              />
            </motion.div>
          ))}
        </AnimatedGroup>

        {/* Trust bar */}
        <AnimatedSection className="mt-14" delay={0.2}>
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-8 py-6 rounded-2xl border"
            style={{
              background: 'rgba(15,15,15,0.5)',
              borderColor: 'rgba(255,255,255,0.06)',
            }}
          >
            {[
              { val: '4.9 / 5', label: 'App Rating' },
              { val: '12,400+', label: 'Waitlist Members' },
              { val: '98%', label: 'Would Recommend' },
              { val: '200+', label: 'Events Hosted' },
            ].map((s, i) => (
              <div key={s.label} className="flex items-center gap-8">
                <div className="text-center">
                  <div className="text-xl font-extrabold text-t1 gradient-text">{s.val}</div>
                  <div className="text-xs text-t3 uppercase tracking-wider">{s.label}</div>
                </div>
                {i < 3 && (
                  <div className="hidden sm:block w-px h-8" style={{ background: 'rgba(255,255,255,0.08)' }} />
                )}
              </div>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
