# Metlanta — App Store & Launch Readiness Checklist

---

## DEVELOPER ACCOUNTS

| Account | Cost | URL |
|---|---|---|
| Apple Developer Program | $99/year | developer.apple.com/programs |
| Google Play Developer | $25 one-time | play.google.com/console |
| Stripe (payments) | Free + % fees | stripe.com |
| Firebase / Supabase | Free tier available | firebase.google.com / supabase.com |

---

## IOS APP STORE CHECKLIST

### Before Submission
- [ ] Enroll in Apple Developer Program ($99/year)
- [ ] Create App ID in Apple Developer portal
- [ ] Enable required capabilities: Push Notifications, Sign in with Apple
- [ ] Set up Provisioning Profiles (Development + Distribution)
- [ ] Create App Store Connect listing

### App Icon Requirements (iOS)
- [ ] 1024×1024px PNG — App Store listing (no transparency, no rounded corners)
- [ ] Xcode will auto-generate all other sizes from 1024px asset
- [ ] Use Metlanta globe+M mark on solid #050505 background
- [ ] No text in icon (policy: icon must be clean symbol)

### Screenshot Requirements (iOS)
Required sizes:
- [ ] iPhone 6.7" (1290×2796): iPhone 15 Pro Max
- [ ] iPhone 6.5" (1242×2688): iPhone 11 Pro Max (used for older devices)
- [ ] iPad Pro 12.9" (2048×2732): if supporting iPad

Screenshot content (6 max, first 3 most important):
1. Hero — "Where Events Become Communities" + event feed
2. Event discovery with vibe filters
3. Social features — event chat + connections
4. Host dashboard / ticket creation
5. Profile + vibe matching
6. City energy / community screen

### TestFlight Steps
1. Archive build in Xcode → Product → Archive
2. Upload to App Store Connect via Xcode Organizer
3. Enable TestFlight for internal testers (up to 100)
4. Add external testers (up to 10,000) — requires basic review
5. Collect feedback for 2–4 weeks before App Store submission

### App Store Submission
- [ ] App name: "Metlanta" (check availability)
- [ ] Subtitle (30 chars): "Your Social Event Platform"
- [ ] Keywords (100 chars): "events,atlanta,nightlife,party,social,tickets,community,clubs"
- [ ] Description: Feature-focused, emoji-accented, benefit-led
- [ ] Privacy Policy URL: metlanta.com/privacy
- [ ] Support URL: metlanta.com/support
- [ ] Age Rating: 17+ (alcohol references in nightlife events)
- [ ] Category: Primary = Social Networking, Secondary = Entertainment

---

## GOOGLE PLAY LAUNCH CHECKLIST

### Before Submission
- [ ] Create Google Play Developer account ($25 one-time)
- [ ] Set up Play Console listing
- [ ] Generate signed APK or AAB (Android App Bundle — required)

### App Icon Requirements (Android)
- [ ] 512×512px PNG — Play Store icon
- [ ] Adaptive icon: 108×108dp with 72×72dp safe zone
- [ ] Feature Graphic: 1024×500px banner image

### Screenshot Requirements (Android)
- [ ] Phone screenshots: 2–8 images (minimum 320dp wide)
- [ ] Tablet: optional but recommended
- Same content strategy as iOS

### Play Store Submission
- [ ] Content rating questionnaire (IARC)
- [ ] Privacy Policy URL required
- [ ] Data safety section (declare all data collected)
- [ ] Target audience & content (17+)

---

## LEGAL PAGES REQUIRED

Both app stores require these — create before submission:

### Privacy Policy (metlanta.com/privacy)
Must cover:
- What data you collect (name, email, location, event history, social graph)
- How data is stored and for how long
- Third-party services (Stripe, Firebase/Supabase, analytics)
- User rights (delete account, export data)
- CCPA compliance (California users)
- COPPA compliance (no users under 13)
- Contact email: privacy@metlanta.com

### Terms of Service (metlanta.com/terms)
Must cover:
- User conduct (no harassment, no fraud)
- Event organizer responsibilities
- Ticket refund policy
- Platform liability limits
- Age requirements (13+ platform, 18+/21+ for age-restricted events)
- Stripe payment terms reference
- Dispute resolution / arbitration clause
- Governing law (Georgia, USA)

Recommended: Use Termly or Iubenda to generate legally compliant versions (~$10/month), then customize.

---

## PUSH NOTIFICATION REQUIREMENTS

### iOS (APNs)
- [ ] Enable Push Notifications capability in Xcode
- [ ] Generate APNs key in Apple Developer portal
- [ ] Upload key to notification service (Firebase FCM, OneSignal, or custom)

### Android (FCM)
- [ ] Add `google-services.json` to Android project
- [ ] Firebase Cloud Messaging is free

### Notification Strategy
| Trigger | Message |
|---|---|
| Event tomorrow | "🔥 [Event Name] is tomorrow — you're going!" |
| Friend joins event | "Jordan just RSVPed to Project X — they're going!" |
| New event chat message | "3 new messages in Project X chat" |
| Tickets selling fast | "⚡ Only 50 GA tickets left for After Dark" |
| New event in user's area | "New day party just dropped in Midtown" |

---

## RECOMMENDED TECH STACK

### Frontend
- **Framework**: Next.js 14 (App Router) ← already using
- **Styling**: Tailwind CSS ← already using
- **Animations**: Framer Motion ← already using
- **State**: Zustand (lightweight) or Jotai
- **Mobile App**: React Native (Expo) — share business logic with web

### Backend
- **Primary**: Supabase (Postgres + Auth + Realtime + Storage) — best for social features
  - Real-time event chats via Supabase Realtime
  - Row-level security for social data
  - Built-in Auth (email, phone, OAuth)
- **Alternative**: Firebase (Firestore + Auth) — easier real-time but less relational

### Payments
- **Stripe** — already planned
  - Stripe Connect for payouts to event hosts
  - Stripe Checkout for ticket purchases
  - Webhook server for ticket confirmation

### File Storage
- Supabase Storage (S3-compatible) — event photos, profile pictures

### Search
- Algolia or Meilisearch — fast event/user search with filters

### Email
- **Resend** ($20/month) — transactional email (tickets, confirmations)
- **SendGrid** — alternative

### SMS / Push
- **OneSignal** — free tier, excellent push notification service
- **Twilio** — SMS for phone verification

---

## HOSTING STACK

| Service | What | Cost |
|---|---|---|
| **Vercel** | Next.js web app | Free → $20/mo Pro |
| **Supabase** | Database + Auth + Realtime | Free → $25/mo Pro |
| **Stripe** | Payments | 2.9% + 30¢ per transaction |
| **Cloudflare** | DNS + CDN + DDoS protection | Free |
| **OneSignal** | Push notifications | Free (up to 10K subscribers) |
| **Resend** | Email | Free (3K/month) |
| **Sentry** | Error monitoring | Free tier |

### Domain & Email
- Buy `metlanta.com` on Namecheap or Cloudflare Registrar (~$12/year)
- Set up `@metlanta.com` emails via Google Workspace ($6/user/month)
  - hello@metlanta.com, support@metlanta.com, press@metlanta.com

---

## DATABASE SCHEMA (STARTER)

```sql
-- Core tables
users (id, email, phone, display_name, avatar_url, bio, vibe_tags[], location, created_at)
events (id, host_id, title, description, date, venue, vibe_tag, age_restriction, capacity, status)
ticket_tiers (id, event_id, name, price, quantity, sold_count)
tickets (id, tier_id, user_id, stripe_payment_id, qr_code, status)
rsvps (id, event_id, user_id, status, created_at)
friendships (id, user_a_id, user_b_id, status, created_at)
event_chats (id, event_id, user_id, message, created_at) -- Realtime
communities (id, name, description, created_by, member_count)
```

---

## ANALYTICS SETUP

| Tool | Purpose | Cost |
|---|---|---|
| **Posthog** | Product analytics, funnels, session replay | Free self-host or $0-$450/mo |
| **Google Analytics 4** | Web traffic, acquisition | Free |
| **Mixpanel** | Event tracking, retention | Free tier |
| **Sentry** | Error tracking + performance | Free tier |

### Key Metrics to Track from Day 1
- Registration → First event view → RSVP → Ticket purchase (conversion funnel)
- D1, D7, D30 retention
- Events per user per month
- Chat message rate (engagement signal)
- Host event creation → publish rate
- Ticket sales volume + GMV

---

## CRASH REPORTING

- **Sentry** — `npm install @sentry/nextjs` + `sentry.io` — best for Next.js
- **Firebase Crashlytics** — for mobile (React Native)
- Set up alerts for: crash rate >1%, new error types, P95 latency spikes

---

## PRE-LAUNCH CHECKLIST

### Technical
- [ ] All pages pass Lighthouse score ≥90 on mobile
- [ ] Core Web Vitals: LCP <2.5s, FID <100ms, CLS <0.1
- [ ] HTTPS everywhere (Vercel handles automatically)
- [ ] robots.txt and sitemap.xml
- [ ] OG images for all key pages
- [ ] 404 and error pages styled
- [ ] Accessibility: all images have alt text, keyboard navigation works

### Business
- [ ] Privacy Policy + Terms of Service live
- [ ] Domain + email set up
- [ ] Stripe account verified for payouts
- [ ] Social accounts secured: @metlanta on IG, TikTok, X
- [ ] Press kit ready (logo files, founder bios, screenshots)
- [ ] Launch email sequence ready (Mailchimp / Resend)

### Growth
- [ ] Waitlist capture with email automation
- [ ] Referral mechanics ("Invite 3 friends, skip the line")
- [ ] Creator / promoter outreach started (10 launch partners)
- [ ] Launch city strategy: go deep in Atlanta before expanding

---

## DEPLOYMENT STEPS

### Web (Vercel)
```bash
# Connect GitHub repo to Vercel
vercel --prod

# Set environment variables in Vercel dashboard:
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
```

### Mobile (Expo + EAS)
```bash
npm install -g eas-cli
eas build --platform ios --profile production
eas submit --platform ios  # submits to App Store
eas build --platform android --profile production
eas submit --platform android
```

---

## TIMELINE (RECOMMENDED)

| Week | Milestone |
|---|---|
| 1–2 | Finalize web app, set up Supabase, basic auth |
| 3–4 | Event creation + ticketing (Stripe) working |
| 5–6 | Social features: chats, profiles, connections |
| 7–8 | React Native app (Expo) — mirror web features |
| 9 | TestFlight beta — 200 testers in Atlanta |
| 10 | Fix bugs, polish UI, App Store submission |
| 11 | App Store review (1–3 business days) |
| 12 | **LAUNCH** — coordinated IG/TikTok push |

---

*Built in Atlanta. Made to scale nationally.*
