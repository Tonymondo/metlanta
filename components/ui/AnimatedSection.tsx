'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

interface AnimatedSectionProps {
  children: React.ReactNode
  className?: string
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
  once?: boolean
}

export default function AnimatedSection({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  once = true,
}: AnimatedSectionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once, margin: '-80px 0px' })

  const directionMap = {
    up: { y: 24 },
    down: { y: -24 },
    left: { x: 24 },
    right: { x: -24 },
    none: {},
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, ...directionMap[direction] }}
      animate={isInView ? { opacity: 1, y: 0, x: 0 } : {}}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.25, 0.4, 0.25, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function AnimatedGroup({
  children,
  className = '',
  stagger = 0.1,
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  stagger?: number
  delay?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-60px 0px' })

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={{
        visible: {
          transition: {
            staggerChildren: stagger,
            delayChildren: delay,
          },
        },
        hidden: {},
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.25, 0.4, 0.25, 1] },
  },
}
