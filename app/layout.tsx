import type { Metadata, Viewport } from 'next'
import { Outfit, Bebas_Neue } from 'next/font/google'
import './globals.css'

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

export const metadata: Metadata = {
  metadataBase: new URL('https://metlanta.com'),
  title: 'Metlanta — The Social Event Platform',
  description:
    'Discover events, connect with people who match your vibe, and experience nightlife like never before. Metlanta is the first social layer built for real-world experiences.',
  keywords: [
    'Metlanta',
    'Atlanta events',
    'social events',
    'nightlife Atlanta',
    'event discovery',
    'day parties ATL',
    'event platform',
    'social networking events',
  ],
  authors: [{ name: 'Metlanta' }],
  creator: 'Metlanta',
  publisher: 'Metlanta',
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://metlanta.com',
    siteName: 'Metlanta',
    title: 'Metlanta — The Social Event Platform',
    description:
      'The first social layer built for real-world experiences. Discover events, connect with people, and experience nightlife differently.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Metlanta — The Social Event Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Metlanta — The Social Event Platform',
    description:
      'The first social layer built for real-world experiences. Discover events, connect with people, and experience nightlife differently.',
    images: ['/og-image.png'],
    creator: '@metlanta',
  },
  icons: {
    icon: '/favicon.svg',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#050505',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${outfit.variable} ${bebas.variable}`}>
      <body style={{ margin: 0, background: '#000', color: '#fff' }}>
        {children}
      </body>
    </html>
  )
}
