'use client'

import { motion } from 'framer-motion'
import AnimatedSection, { AnimatedGroup, itemVariants } from '@/components/ui/AnimatedSection'

const FEATURES = [
  {
    icon: '💬',
    title: 'Event Chats',
    body: 'Every event has a crew chat. Meet the people going before you even show up — hype the night, coordinate meetups, make friends before the first song drops.',
    accent: '#FF5C1B',
  },
  {
    icon: '✨',
    title: 'Party Profiles',
    body: 'Your profile shows your vibe, your events, your reputation. The more you host and go, the more people know your name. Build your social standing event by event.',
    accent: '#8B5CF6',
  },
  {
    icon: '🤝',
    title: 'Vibe Matching',
    body: 'Find people who match your energy. Metlanta shows you who at the event has the same taste, same vibe, same school — no more showing up not knowing anyone.',
    accent: '#22C55E',
  },
  {
    icon: '🎓',
    title: 'School & After Prom Events',
    body: 'Made for students. Host after proms, homecoming parties, and school events with built-in ticketing, age verification, and a student-first social audience.',
    accent: '#F59E0B',
  },
  {
    icon: '🎟️',
    title: 'Live RSVP Feed',
    body: 'Watch the hype build in real time. See who from your school is going, which events are sold out, and where your friends are pulling up.',
    accent: '#EC4899',
  },
  {
    icon: '🌐',
    title: 'Party Communities',
    body: 'Join your school&apos;s party crew, your neighborhood&apos;s collective, or build your own community from scratch. Every good promoter started somewhere.',
    accent: '#06B6D4',
  },
]

export default function SocialFeatures() {
  return (
    <section id="features" className="relative py-24 lg:py-32 overflow-hidden">
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,92,27,0.3) 50%, transparent 100%)' }}
        aria-hidden
      />
      <div className="absolute top-[-200px] right-[-100px] w-[600px] h-[600px] blob-purple pointer-events-none" aria-hidden />

      <div className="section-wrapper relative z-10">
        <AnimatedSection className="text-center mb-16 max-w-2xl mx-auto">
          <div className="section-label">Social Features</div>
          <h2 className="text-[clamp(32px,5vw,52px)] font-extrabold tracking-tight mb-4">
            It&apos;s not an event listing.
            <br />
            <span className="gradient-text-purple">It&apos;s social media for parties.</span>
          </h2>
          <p className="text-t2 text-lg leading-relaxed">
            Metlanta is what happens when Instagram, Partiful, and Eventbrite have a kid
            who actually goes to parties. Every feature is built to make your party life richer.
          </p>
        </AnimatedSection>

        <AnimatedGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <motion.div
              key={f.title}
              variants={itemVariants}
              className="card-hover rounded-2xl p-6 border"
              style={{ background: '#0f0f0f', borderColor: 'rgba(255,255,255,0.07)' }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-5"
                style={{ background: `${f.accent}14`, border: `1px solid ${f.accent}20` }}
              >
                {f.icon}
              </div>
              <h3 className="text-base font-bold text-t1 mb-2">{f.title}</h3>
              <p className="text-sm text-t2 leading-relaxed">{f.body}</p>
              <div className="mt-5 h-[1px] w-12 rounded-full" style={{ background: f.accent }} />
            </motion.div>
          ))}
        </AnimatedGroup>

        {/* Bottom callout */}
        <AnimatedSection className="mt-16" delay={0.2}>
          <div
            className="rounded-2xl p-8 md:p-10 text-center border relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(255,92,27,0.06) 0%, rgba(139,92,246,0.06) 100%)',
              borderColor: 'rgba(255,255,255,0.08)',
            }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(255,92,27,0.08) 0%, transparent 70%)' }}
              aria-hidden
            />
            <div className="relative z-10">
              <div className="section-label justify-center flex">The Difference</div>
              <h3 className="text-2xl md:text-3xl font-extrabold text-t1 mb-3 tracking-tight">
                Other apps show you events.
                <br />
                <span className="gradient-text">Metlanta makes you part of them.</span>
              </h3>
              <p className="text-t2 max-w-xl mx-auto text-base leading-relaxed">
                Stop scrolling alone. Start showing up, connecting, and building the party reputation you actually want.
              </p>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
