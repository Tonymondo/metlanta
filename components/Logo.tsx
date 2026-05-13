'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'

interface LogoProps {
  variant?: 'default' | 'icon-only' | 'wordmark-only'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const SIZES = {
  sm: { h: 34, fontSize: '14px', gap: '9px' },
  md: { h: 42, fontSize: '18px', gap: '11px' },
  lg: { h: 54, fontSize: '24px', gap: '14px' },
  xl: { h: 80, fontSize: '36px', gap: '18px' },
}

export default function Logo({ variant = 'default', size = 'md', className = '' }: LogoProps) {
  const [hovered, setHovered] = useState(false)
  const { h, fontSize, gap } = SIZES[size]

  return (
    <div
      className={`flex items-center select-none cursor-pointer ${className}`}
      style={{ gap }}
      aria-label="Metlanta"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {variant !== 'wordmark-only' && (
        <motion.div
          animate={{ scale: hovered ? 1.04 : 1 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          style={{
            background: '#ffffff',
            borderRadius: Math.round(h * 0.2),
            padding: `${Math.round(h * 0.07)}px ${Math.round(h * 0.13)}px`,
            display: 'flex',
            alignItems: 'center',
            flexShrink: 0,
          }}
        >
          <Image
            src="/logo.png"
            alt="Metlanta logo mark"
            height={h}
            width={Math.round(h * 2.2)}
            style={{ objectFit: 'contain', display: 'block' }}
            priority
          />
        </motion.div>
      )}

      {variant !== 'icon-only' && (
        <span
          style={{
            fontFamily: 'var(--font-bebas), Impact, sans-serif',
            fontSize,
            fontWeight: 400,
            letterSpacing: '2.5px',
            color: '#FFFFFF',
            lineHeight: 1,
            textTransform: 'uppercase',
          }}
        >
          Metlanta
        </span>
      )}
    </div>
  )
}

/* ─── App Icon (square badge for splash / favicon preview) ──────────────── */
export function LogoIcon({ size = 72 }: { size?: number }) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      style={{
        background: '#ffffff',
        borderRadius: Math.round(size * 0.16),
        padding: `${Math.round(size * 0.08)}px ${Math.round(size * 0.12)}px`,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
      }}
      animate={{ scale: hovered ? 1.05 : 1 }}
      transition={{ duration: 0.22 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Image
        src="/logo.png"
        alt="Metlanta"
        width={size}
        height={Math.round(size * 0.5)}
        style={{ objectFit: 'contain' }}
      />
    </motion.div>
  )
}

/* ─── Splash Screen ──────────────────────────────────────────────────────── */
export function LogoSplash() {
  return (
    <div className="flex flex-col items-center gap-5">
      <div style={{ background: '#fff', borderRadius: 16, padding: '10px 20px', display: 'inline-flex' }}>
        <Image
          src="/logo.png"
          alt="Metlanta"
          width={220}
          height={100}
          style={{ objectFit: 'contain' }}
          priority
        />
      </div>
      <div className="text-center">
        <div
          style={{
            fontFamily: 'var(--font-bebas), Impact, sans-serif',
            fontSize: '40px',
            fontWeight: 400,
            letterSpacing: '5px',
            color: '#FFFFFF',
            lineHeight: 1,
            marginBottom: '8px',
          }}
        >
          METLANTA
        </div>
        <div
          style={{
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '3.5px',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.28)',
            fontFamily: 'var(--font-outfit), system-ui, sans-serif',
          }}
        >
          Throw Parties. Sell Tickets. Build Your Name.
        </div>
      </div>
    </div>
  )
}
