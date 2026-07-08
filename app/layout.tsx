import type { Metadata, Viewport } from 'next'
import { Outfit, Bebas_Neue, Instrument_Serif } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'
import './landing.css'
import { Providers } from './providers'

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800'],
})

const bebas = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bebas',
  display: 'swap',
})

const instrumentSerif = Instrument_Serif({
  weight: '400',
  style: ['italic'],
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://metlanta.app'),
  title: 'Metlanta — Atlanta\'s Social Event Marketplace',
  description:
    'Discover parties, kickbacks, after proms, and day parties in Atlanta. Buy tickets or host your own event and get paid same night.',
  keywords: [
    'Metlanta', 'Atlanta events', 'social events', 'nightlife Atlanta',
    'event ticketing', 'day parties ATL', 'after prom Atlanta',
    'host events Atlanta', 'ticket platform',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://metlanta.app',
    siteName: 'Metlanta',
    title: 'Metlanta — Atlanta\'s Social Event Marketplace',
    description: 'Discover or host Atlanta\'s hottest events. Stripe-powered tickets. Same-night payouts.',
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@metlanta',
  },
  icons: { icon: '/favicon.ico' },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0A0A0A',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${outfit.variable} ${bebas.variable} ${instrumentSerif.variable}`}>
      <body style={{ margin: 0, background: '#0A0A0A', color: '#fff' }}>
        <Providers>{children}</Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
