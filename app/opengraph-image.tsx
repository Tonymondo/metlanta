import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Metlanta — Every great night starts on Metlanta'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#050505',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'flex-end',
          padding: '64px 72px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Ambient glow */}
        <div
          style={{
            position: 'absolute',
            top: -100,
            left: -100,
            width: 600,
            height: 600,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(224,48,48,0.18) 0%, transparent 65%)',
          }}
        />

        {/* Headline */}
        <div
          style={{
            fontSize: 108,
            fontWeight: 900,
            color: '#ffffff',
            lineHeight: 0.92,
            textTransform: 'uppercase',
            letterSpacing: '0.01em',
            marginBottom: 32,
          }}
        >
          <div>Every great</div>
          <div>night starts</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
            <span>on</span>
            <span style={{ color: '#E03030', fontStyle: 'italic' }}>metlanta.</span>
          </div>
        </div>

        {/* Subtext */}
        <div
          style={{
            fontSize: 20,
            color: 'rgba(255,255,255,0.45)',
            marginBottom: 48,
            maxWidth: 560,
            lineHeight: 1.6,
          }}
        >
          Find and host events in Atlanta. Buy tickets in seconds, get paid the same night.
        </div>

        {/* Bottom row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: 'rgba(255,255,255,0.3)',
              letterSpacing: '2px',
              textTransform: 'uppercase',
            }}
          >
            metlanta.app
          </div>
          <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#E03030' }} />
          <div
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: 'rgba(255,255,255,0.25)',
            }}
          >
            Atlanta&apos;s Social Event Marketplace
          </div>
        </div>
      </div>
    ),
    { ...size },
  )
}
