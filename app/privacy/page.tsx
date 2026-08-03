import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy — Metlanta',
  description: 'How Metlanta collects, uses, and protects your information.',
}

export default function PrivacyPage() {
  return (
    <div className="legal-page">
      <div className="legal-nav">
        <Link href="/" className="legal-back">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          Metlanta
        </Link>
      </div>

      <div className="legal-wrap">
        <div className="legal-header">
          <p className="legal-eyebrow">Last updated August 3, 2026</p>
          <h1 className="legal-title">Privacy Policy</h1>
          <p className="legal-intro">
            Metlanta, Inc. (&ldquo;Metlanta,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) operates metlanta.app. This policy explains what data we collect, how we use it, and your rights.
          </p>
        </div>

        <div className="legal-body">

          <section className="legal-section">
            <h2>1. Information We Collect</h2>
            <h3>Account Information</h3>
            <p>When you register, we collect your name, email address, phone number, and profile information (username, bio, photo).</p>
            <h3>Event & Ticket Data</h3>
            <p>When you buy a ticket or create an event, we collect transaction details, the event you attended or hosted, and your ticket history.</p>
            <h3>Payment Information</h3>
            <p>Payments are processed by Stripe. We do not store your full card number, CVV, or bank account details — Stripe handles all sensitive payment data under their own PCI-DSS compliance.</p>
            <h3>Usage Data</h3>
            <p>We automatically collect IP address, browser type, device identifiers, pages viewed, and interactions (likes, saves, follows) to improve the platform.</p>
            <h3>Location</h3>
            <p>With your permission, we may use approximate location to show nearby events. We do not track your precise location in the background.</p>
          </section>

          <section className="legal-section">
            <h2>2. How We Use Your Information</h2>
            <ul>
              <li>Provide, operate, and improve the platform</li>
              <li>Process ticket purchases and host payouts</li>
              <li>Send transactional emails and SMS (ticket confirmations, event reminders)</li>
              <li>Personalize your event feed and recommendations</li>
              <li>Prevent fraud, abuse, and unauthorized access</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>3. Sharing Your Information</h2>
            <p>We do not sell your personal data. We share it only with:</p>
            <ul>
              <li><strong>Stripe</strong> — payment processing and host payouts</li>
              <li><strong>Supabase</strong> — secure database and authentication infrastructure</li>
              <li><strong>Twilio</strong> — SMS OTP verification and event notifications</li>
              <li><strong>Vercel</strong> — hosting and serverless infrastructure</li>
              <li><strong>Law enforcement</strong> — when required by a valid legal process</li>
            </ul>
            <p>Event hosts can see the names and email addresses of attendees who purchased tickets to their events.</p>
          </section>

          <section className="legal-section">
            <h2>4. Data Retention</h2>
            <p>We retain your account and transaction data for as long as your account is active, and for up to 7 years after account deletion for legal and financial compliance. You may request deletion of non-financial data at any time.</p>
          </section>

          <section className="legal-section">
            <h2>5. Your Rights</h2>
            <p>Depending on your location, you may have the right to:</p>
            <ul>
              <li>Access a copy of the personal data we hold about you</li>
              <li>Correct inaccurate data</li>
              <li>Delete your account and personal data (subject to legal retention requirements)</li>
              <li>Opt out of marketing communications</li>
              <li>Data portability (California residents — CCPA)</li>
            </ul>
            <p>To exercise any of these rights, email us at <a href="mailto:privacy@metlanta.app">privacy@metlanta.app</a>.</p>
          </section>

          <section className="legal-section">
            <h2>6. Cookies</h2>
            <p>We use session cookies to keep you logged in and analytics cookies (Vercel Analytics) to understand usage patterns. We do not use third-party advertising cookies. You can disable cookies in your browser, but some features may not function correctly.</p>
          </section>

          <section className="legal-section">
            <h2>7. Children</h2>
            <p>Metlanta is not directed to children under 13. We do not knowingly collect personal data from users under 13. If we learn we have collected data from a child under 13, we will delete it promptly. Contact us at <a href="mailto:privacy@metlanta.app">privacy@metlanta.app</a> if you believe a child has submitted data.</p>
          </section>

          <section className="legal-section">
            <h2>8. Security</h2>
            <p>We use industry-standard measures including HTTPS, encrypted databases, and row-level security policies. No system is 100% secure — if you discover a vulnerability, please disclose it responsibly to <a href="mailto:support@metlanta.app">support@metlanta.app</a>.</p>
          </section>

          <section className="legal-section">
            <h2>9. Changes to This Policy</h2>
            <p>We may update this policy from time to time. When we do, we&apos;ll update the &ldquo;Last updated&rdquo; date above and, for material changes, notify you by email or in-app notice.</p>
          </section>

          <section className="legal-section">
            <h2>10. Contact</h2>
            <p>Questions about this policy? Reach us at:</p>
            <p>
              Metlanta, Inc.<br />
              Atlanta, Georgia<br />
              <a href="mailto:privacy@metlanta.app">privacy@metlanta.app</a>
            </p>
          </section>

        </div>
      </div>
    </div>
  )
}
