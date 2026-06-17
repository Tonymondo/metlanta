'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Logo from './Logo'

const NAV_LINKS = [
  { label: 'Explore Events', href: '#events' },
  { label: 'Marketplace', href: '/marketplace' },
  { label: 'Hosts', href: '#host' },
  { label: 'Pricing', href: '#pricing' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? 'rgba(8,8,8,0.94)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
        }}
      >
        <div className="section-wrapper">
          <nav className="flex items-center justify-between h-16">
            <Link href="/" aria-label="Metlanta home">
              <Logo size="sm" />
            </Link>

            {/* Desktop nav */}
            <ul className="hidden md:flex items-center gap-7">
              {NAV_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm font-medium transition-colors duration-200"
                    style={{ color: '#888' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#F0F0F0')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#888')}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-3">
              <Link
                href="#login"
                className="text-sm font-medium transition-colors"
                style={{ color: '#888' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#F0F0F0')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#888')}
              >
                Log In
              </Link>
              <Link href="#host" className="btn btn-red btn-sm">
                Start Hosting
              </Link>
            </div>

            {/* Mobile hamburger */}
            <button
              className="md:hidden flex flex-col gap-[5px] p-2 -mr-2"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
            >
              <span
                className="block h-[2px] w-6 transition-all duration-300 origin-center"
                style={{
                  background: '#F0F0F0',
                  transform: menuOpen ? 'translateY(7px) rotate(45deg)' : 'none',
                }}
              />
              <span
                className="block h-[2px] w-6 transition-all duration-300"
                style={{ background: '#F0F0F0', opacity: menuOpen ? 0 : 1 }}
              />
              <span
                className="block h-[2px] w-6 transition-all duration-300 origin-center"
                style={{
                  background: '#F0F0F0',
                  transform: menuOpen ? 'translateY(-7px) rotate(-45deg)' : 'none',
                }}
              />
            </button>
          </nav>
        </div>
      </header>

      {/* Mobile menu */}
      <div
        className="fixed inset-0 z-40 md:hidden transition-all duration-300"
        style={{
          background: 'rgba(8,8,8,0.97)',
          backdropFilter: 'blur(20px)',
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? 'all' : 'none',
          transform: menuOpen ? 'translateY(0)' : 'translateY(-8px)',
        }}
      >
        <div className="flex flex-col items-center justify-center h-full gap-7 px-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="display text-4xl tracking-widest text-t1 transition-colors"
              style={{ color: '#F0F0F0' }}
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-6 flex flex-col gap-3 w-full max-w-xs">
            <Link
              href="#host"
              onClick={() => setMenuOpen(false)}
              className="btn btn-red text-center"
            >
              Start Hosting Free
            </Link>
            <Link
              href="#login"
              onClick={() => setMenuOpen(false)}
              className="btn btn-ghost text-center"
            >
              Log In
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
