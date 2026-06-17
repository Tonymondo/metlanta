-- ============================================================
-- Metlanta v3 Migration
-- Adds: marketplace_services, support_tickets, promoters, event_staff
-- ============================================================

-- ── Marketplace ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS marketplace_services (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES users(id) ON DELETE SET NULL,
  provider_name    TEXT NOT NULL,
  title            TEXT NOT NULL,
  category         TEXT NOT NULL,  -- dj | venue | photographer | decorator | security | catering | other
  description      TEXT NOT NULL,
  price_per_event  NUMERIC(10,2),
  location         TEXT,
  image_url        TEXT,
  contact_info     TEXT NOT NULL,
  is_approved      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_marketplace_category  ON marketplace_services(category);
CREATE INDEX IF NOT EXISTS idx_marketplace_approved  ON marketplace_services(is_approved);
CREATE INDEX IF NOT EXISTS idx_marketplace_user_id   ON marketplace_services(user_id);

ALTER TABLE marketplace_services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "marketplace_public_read"  ON marketplace_services;
CREATE POLICY "marketplace_public_read"  ON marketplace_services FOR SELECT USING (is_approved = true);

DROP POLICY IF EXISTS "marketplace_owner_manage" ON marketplace_services;
CREATE POLICY "marketplace_owner_manage" ON marketplace_services FOR ALL USING (TRUE);

-- ── Support Tickets ───────────────────────────────────────────

CREATE TABLE IF NOT EXISTS support_tickets (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  user_email  TEXT,
  subject     TEXT NOT NULL,
  message     TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'open',  -- open | in_progress | resolved | closed
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_status  ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id) WHERE user_id IS NOT NULL;

ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "support_deny_all" ON support_tickets;
CREATE POLICY "support_deny_all" ON support_tickets FOR ALL USING (FALSE);

-- ── Promoters ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS promoters (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id         UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  host_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_id          UUID REFERENCES users(id) ON DELETE SET NULL,
  name             TEXT NOT NULL,
  code             TEXT NOT NULL,
  commission_rate  NUMERIC(5,4) NOT NULL DEFAULT 0.10,
  click_count      INTEGER NOT NULL DEFAULT 0,
  sale_count       INTEGER NOT NULL DEFAULT 0,
  commission_earned NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (event_id, code)
);

CREATE INDEX IF NOT EXISTS idx_promoters_event_id ON promoters(event_id);
CREATE INDEX IF NOT EXISTS idx_promoters_code     ON promoters(code);
CREATE INDEX IF NOT EXISTS idx_promoters_host_id  ON promoters(host_id);

ALTER TABLE promoters ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "promoters_deny_all" ON promoters;
CREATE POLICY "promoters_deny_all" ON promoters FOR ALL USING (FALSE);

-- ── Event Staff ───────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS event_staff (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id   UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role       TEXT NOT NULL DEFAULT 'door_staff',  -- manager | promoter | door_staff
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (event_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_event_staff_event_id ON event_staff(event_id);
CREATE INDEX IF NOT EXISTS idx_event_staff_user_id  ON event_staff(user_id);

ALTER TABLE event_staff ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "event_staff_deny_all" ON event_staff;
CREATE POLICY "event_staff_deny_all" ON event_staff FOR ALL USING (FALSE);

-- ── RPC: increment promoter click count ──────────────────────

CREATE OR REPLACE FUNCTION increment_promoter_clicks(p_code TEXT, p_event_id UUID)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE promoters SET click_count = click_count + 1
  WHERE code = p_code AND event_id = p_event_id;
END;
$$;
