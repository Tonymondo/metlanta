import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service — Metlanta',
  description: 'The terms governing your use of the Metlanta platform.',
}

export default function TermsPage() {
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
          <h1 className="legal-title">Terms of Service</h1>
          <p className="legal-intro">
            These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of Metlanta, operated by Metlanta, Inc. (&ldquo;Metlanta,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;). By using Metlanta you agree to these Terms.
          </p>
        </div>

        <div className="legal-body">

          <section className="legal-section">
            <h2>1. Eligibility</h2>
            <p>You must be at least 13 years old to create an account. If you are under 18, you confirm that you have parental or guardian consent to use the platform. Age-restricted events (18+, 21+) may require additional verification at the venue.</p>
          </section>

          <section className="legal-section">
            <h2>2. Accounts</h2>
            <p>You are responsible for maintaining the security of your account credentials. You may not share your account or use another person&apos;s account. Notify us immediately at <a href="mailto:support@metlanta.app">support@metlanta.app</a> if you suspect unauthorized access.</p>
          </section>

          <section className="legal-section">
            <h2>3. Tickets & Purchases</h2>
            <h3>Buying Tickets</h3>
            <p>Tickets purchased on Metlanta are final unless the event is cancelled by the host. All sales are processed by Stripe. Platform fees are added at checkout and are non-refundable.</p>
            <h3>Refund Policy</h3>
            <ul>
              <li><strong>Event cancelled by host:</strong> Full refund including platform fees, processed within 5–10 business days.</li>
              <li><strong>Buyer-initiated cancellation:</strong> Refunds are at the host&apos;s sole discretion. Contact the event host directly through your ticket page.</li>
              <li><strong>No-shows:</strong> Non-refundable.</li>
            </ul>
            <h3>Ticket Transfers</h3>
            <p>Tickets are non-transferable unless the event host enables this option. Reselling tickets at above face value (&ldquo;scalping&rdquo;) is prohibited and will result in account termination.</p>
          </section>

          <section className="legal-section">
            <h2>4. Hosting Events</h2>
            <p>By creating an event on Metlanta you agree to:</p>
            <ul>
              <li>Provide accurate information about the event (date, venue, capacity, age restrictions)</li>
              <li>Honor all tickets sold through the platform</li>
              <li>Comply with all applicable local, state, and federal laws, including event permits, noise ordinances, and occupancy limits</li>
              <li>Not host events that promote illegal activity, hate speech, or violence</li>
              <li>Complete Stripe Connect onboarding before collecting paid ticket revenue</li>
            </ul>
            <h3>Host Fees</h3>
            <p>Hosting is free. Attendees pay a tiered platform fee per paid ticket: 22% on tickets under $25, 20% on $25–$50, 17% on $50–$100, and 15% on $100+. Free tickets and RSVPs have no fees.</p>
            <h3>Payouts</h3>
            <p>Revenue is held in your connected Stripe account and paid out per Stripe&apos;s standard payout schedule (typically 2 business days after funds are captured). Metlanta is not responsible for delays caused by Stripe.</p>
          </section>

          <section className="legal-section">
            <h2>5. User Conduct</h2>
            <p>You agree not to:</p>
            <ul>
              <li>Post false, misleading, or fraudulent event information</li>
              <li>Harass, threaten, or harm other users</li>
              <li>Attempt to access, scrape, or reverse-engineer the platform</li>
              <li>Use the platform to distribute spam or unauthorized advertising</li>
              <li>Circumvent any access controls or security measures</li>
            </ul>
            <p>Violations may result in immediate account suspension or termination.</p>
          </section>

          <section className="legal-section">
            <h2>6. Content</h2>
            <p>You retain ownership of content you upload (event photos, flyers, descriptions). By posting content, you grant Metlanta a non-exclusive, royalty-free license to display and distribute it within the platform and for promotional purposes (social media, marketing). You represent that you own or have the right to use all content you post.</p>
          </section>

          <section className="legal-section">
            <h2>7. Disclaimers & Liability</h2>
            <p>Metlanta is a marketplace connecting event hosts and attendees. We are not responsible for the content, safety, quality, or legality of events listed on the platform. Events are run by independent hosts, and Metlanta does not endorse any event.</p>
            <p>TO THE MAXIMUM EXTENT PERMITTED BY LAW, METLANTA PROVIDES THE PLATFORM &ldquo;AS IS&rdquo; AND DISCLAIMS ALL WARRANTIES. OUR TOTAL LIABILITY TO YOU FOR ANY CLAIM ARISING FROM THESE TERMS SHALL NOT EXCEED THE GREATER OF (A) $100 OR (B) THE AMOUNT YOU PAID IN FEES TO METLANTA IN THE 12 MONTHS PRIOR TO THE CLAIM.</p>
          </section>

          <section className="legal-section">
            <h2>8. Dispute Resolution</h2>
            <p>Any dispute between you and Metlanta shall first be attempted to be resolved through good-faith negotiation. If unresolved, disputes shall be submitted to binding arbitration in Atlanta, Georgia, under the rules of the American Arbitration Association. You waive the right to participate in a class action lawsuit against Metlanta.</p>
          </section>

          <section className="legal-section">
            <h2>9. Governing Law</h2>
            <p>These Terms are governed by the laws of the State of Georgia, USA, without regard to conflict of law principles.</p>
          </section>

          <section className="legal-section">
            <h2>10. Changes to These Terms</h2>
            <p>We may update these Terms from time to time. Continued use of the platform after changes constitutes acceptance of the revised Terms. For material changes, we will provide at least 14 days&apos; notice by email or in-app notification.</p>
          </section>

          <section className="legal-section">
            <h2>11. Contact</h2>
            <p>
              Metlanta, Inc.<br />
              Atlanta, Georgia<br />
              <a href="mailto:support@metlanta.app">support@metlanta.app</a>
            </p>
          </section>

        </div>
      </div>
    </div>
  )
}
