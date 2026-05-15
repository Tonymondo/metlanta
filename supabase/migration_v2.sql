-- ============================================================
-- Metlanta v2 Migration
-- Safe to run on an existing database — all additions are
-- idempotent using IF NOT EXISTS / ADD COLUMN IF NOT EXISTS.
-- ============================================================

-- ── 1. Column additions to existing tables ────────────────────

-- users
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_complete BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- host_profiles
ALTER TABLE host_profiles ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;
ALTER TABLE host_profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE host_profiles ADD COLUMN IF NOT EXISTS banner_url TEXT;
ALTER TABLE host_profiles ADD COLUMN IF NOT EXISTS twitter TEXT;
ALTER TABLE host_profiles ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE host_profiles ADD COLUMN IF NOT EXISTS follower_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE host_profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;

-- events
ALTER TABLE events ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;
ALTER TABLE events ADD COLUMN IF NOT EXISTS flyer_url TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS like_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE events ADD COLUMN IF NOT EXISTS save_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE events ADD COLUMN IF NOT EXISTS comment_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE events ADD COLUMN IF NOT EXISTS view_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE events ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT FALSE;

-- tickets
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS checked_in BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMPTZ;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE SET NULL;

-- Update role enum to include 'promoter' if not already present
-- (Postgres enums require a DO block for idempotent addition)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'promoter'
      AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')
  ) THEN
    ALTER TYPE user_role ADD VALUE 'promoter';
  END IF;
EXCEPTION
  WHEN undefined_object THEN
    -- user_role is stored as TEXT — no action needed
    NULL;
END;
$$;

-- ── 2. New tables ─────────────────────────────────────────────

-- event_likes
CREATE TABLE IF NOT EXISTS event_likes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id    UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (event_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_event_likes_event_id ON event_likes(event_id);
CREATE INDEX IF NOT EXISTS idx_event_likes_user_id  ON event_likes(user_id);

-- event_saves
CREATE TABLE IF NOT EXISTS event_saves (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id    UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (event_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_event_saves_event_id ON event_saves(event_id);
CREATE INDEX IF NOT EXISTS idx_event_saves_user_id  ON event_saves(user_id);

-- event_comments
CREATE TABLE IF NOT EXISTS event_comments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id    UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text        TEXT NOT NULL CHECK (char_length(text) <= 500),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_event_comments_event_id ON event_comments(event_id);
CREATE INDEX IF NOT EXISTS idx_event_comments_user_id  ON event_comments(user_id);

-- follows
CREATE TABLE IF NOT EXISTS follows (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (follower_id, following_id)
);

CREATE INDEX IF NOT EXISTS idx_follows_follower_id  ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON follows(following_id);

-- sms_blasts
CREATE TABLE IF NOT EXISTS sms_blasts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id    UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  host_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message     TEXT NOT NULL,
  sent_count  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sms_blasts_event_id ON sms_blasts(event_id);
CREATE INDEX IF NOT EXISTS idx_sms_blasts_host_id  ON sms_blasts(host_id);

-- ── 3. RPC functions for atomic counters ──────────────────────

-- increment_like_count
CREATE OR REPLACE FUNCTION increment_like_count(event_id UUID, delta INTEGER)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE events
  SET like_count = GREATEST(0, like_count + delta)
  WHERE id = event_id;
END;
$$;

-- increment_save_count
CREATE OR REPLACE FUNCTION increment_save_count(event_id UUID, delta INTEGER)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE events
  SET save_count = GREATEST(0, save_count + delta)
  WHERE id = event_id;
END;
$$;

-- increment_comment_count
CREATE OR REPLACE FUNCTION increment_comment_count(event_id UUID, delta INTEGER)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE events
  SET comment_count = GREATEST(0, comment_count + delta)
  WHERE id = event_id;
END;
$$;

-- increment_view_count
CREATE OR REPLACE FUNCTION increment_view_count(event_id UUID, delta INTEGER DEFAULT 1)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE events
  SET view_count = GREATEST(0, view_count + delta)
  WHERE id = event_id;
END;
$$;

-- increment_follower_count
CREATE OR REPLACE FUNCTION increment_follower_count(profile_user_id UUID, delta INTEGER)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE host_profiles
  SET follower_count = GREATEST(0, follower_count + delta)
  WHERE user_id = profile_user_id;
END;
$$;

-- increment_sold_count (already in v1, recreate safely)
CREATE OR REPLACE FUNCTION increment_sold_count(tier_id UUID, qty INTEGER DEFAULT 1)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE ticket_tiers
  SET sold_count = sold_count + qty
  WHERE id = tier_id;
END;
$$;

-- ── 4. Indexes for performance ────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_events_status_date  ON events(status, date);
CREATE INDEX IF NOT EXISTS idx_events_host_id       ON events(host_id);
CREATE INDEX IF NOT EXISTS idx_events_city          ON events(city);
CREATE INDEX IF NOT EXISTS idx_events_is_featured   ON events(is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_events_slug          ON events(slug) WHERE slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tickets_event_id     ON tickets(event_id);
CREATE INDEX IF NOT EXISTS idx_tickets_user_id      ON tickets(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tickets_status       ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_users_username       ON users(username) WHERE username IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_host_profiles_username ON host_profiles(username) WHERE username IS NOT NULL;

-- ── 5. Row Level Security policies ───────────────────────────

-- Enable RLS on new tables
ALTER TABLE event_likes    ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_saves    ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows        ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_blasts     ENABLE ROW LEVEL SECURITY;

-- event_likes: anyone can read, authenticated users manage their own
DROP POLICY IF EXISTS "event_likes_select" ON event_likes;
CREATE POLICY "event_likes_select" ON event_likes FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "event_likes_insert" ON event_likes;
CREATE POLICY "event_likes_insert" ON event_likes FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "event_likes_delete" ON event_likes;
CREATE POLICY "event_likes_delete" ON event_likes FOR DELETE USING (auth.uid()::text = user_id::text);

-- event_saves: authenticated users manage their own
DROP POLICY IF EXISTS "event_saves_select" ON event_saves;
CREATE POLICY "event_saves_select" ON event_saves FOR SELECT USING (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "event_saves_insert" ON event_saves;
CREATE POLICY "event_saves_insert" ON event_saves FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "event_saves_delete" ON event_saves;
CREATE POLICY "event_saves_delete" ON event_saves FOR DELETE USING (auth.uid()::text = user_id::text);

-- event_comments: anyone can read, authenticated users can insert their own
DROP POLICY IF EXISTS "event_comments_select" ON event_comments;
CREATE POLICY "event_comments_select" ON event_comments FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "event_comments_insert" ON event_comments;
CREATE POLICY "event_comments_insert" ON event_comments FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- follows: authenticated users manage their own
DROP POLICY IF EXISTS "follows_select" ON follows;
CREATE POLICY "follows_select" ON follows FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "follows_insert" ON follows;
CREATE POLICY "follows_insert" ON follows FOR INSERT WITH CHECK (auth.uid()::text = follower_id::text);

DROP POLICY IF EXISTS "follows_delete" ON follows;
CREATE POLICY "follows_delete" ON follows FOR DELETE USING (auth.uid()::text = follower_id::text);

-- sms_blasts: only service role accesses (API routes use service client)
DROP POLICY IF EXISTS "sms_blasts_deny_all" ON sms_blasts;
CREATE POLICY "sms_blasts_deny_all" ON sms_blasts FOR ALL USING (FALSE);
