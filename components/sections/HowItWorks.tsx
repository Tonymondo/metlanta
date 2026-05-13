'use client'

import AnimatedSection, { AnimatedGroup, itemVariants } from '@/components/ui/AnimatedSection'
import { motion } from 'framer-motion'

const STEPS = [
  {
    num: '01',
    title: 'Create your event',
    body: 'Name it, set a date, pick a venue. Add a description, flyer image, and age policy. Your event page goes live in under 5 minutes.',
    tags: ['Event Page', 'Flyer Upload', 'Age Policy', 'Venue'],
  },
  {
    num: '02',
    title: 'Set your ticket prices',
    body: 'Run early bird drops, general admission, VIP sections, and free RSVP lists. You control the tiers, caps, and deadlines.',
    tags: ['Early Bird', 'General', 'VIP', 'Free RSVP', 'Capacity Limits'],
  },
  {
    num: '03',
    title: 'Share the link and sell out',
    body: 'One link for everything. Share to Instagram, group chats, school pages. Track sales live. Payout hits same night.',
    tags: ['Share Link', 'Live Dashboard', 'Same-Night Payout', 'Stripe'],
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-24 lg:py-32 overflow-hidden">
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(224,48,48,0.04) 0%, transparent 70%)' }}
        aria-hidden
      />

      <div className="section-wrapper relative z-10">
        <AnimatedSection className="text-center mb-16">
          <div className="label mb-4">How It Works</div>
          <h2 className="text-[clamp(30px,5vw,52px)] font-extrabold tracking-tight mb-4">
            From idea to sold out
            <br />
            <span className="gradient-text">in three steps</span>
          </h2>
          <p className="text-lg leading-relaxed max-w-md mx-auto" style={{ color: '#888' }}>
            No experience needed. If you can share an Instagram story, you can run an event on Metlanta.
          </p>
        </AnimatedSection>

        <AnimatedGroup className="grid grid-cols-1 md:grid-cols-3 gap-5 relative">
          {/* Connector line */}
          <div
            className="hidden md:block absolute top-[42px] left-[33%] right-[33%] h-[1px] pointer-events-none"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(224,48,48,0.25), rgba(224,48,48,0.25), transparent)' }}
            aria-hidden
          />

          {STEPS.map((step) => (
            <motion.div
              key={step.num}
              variants={itemVariants}
              className="card card-hover relative rounded-2xl p-6"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="step-num display">{step.num}</div>
              </div>

              <h3 className="text-lg font-bold mb-3 leading-tight" style={{ color: '#F0F0F0' }}>
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed mb-5" style={{ color: '#888' }}>
                {step.body}
              </p>

              <div className="flex flex-wrap gap-1.5">
                {step.tags.map((tag) => (
                  <span key={tag} className="tag tag-red">{tag}</span>
                ))}
              </div>
            </motion.div>
          ))}
        </AnimatedGroup>
      </div>
    </section>
  )
}
