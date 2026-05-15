-- ============================================================
-- Metlanta — Safe Migration (run in Supabase SQL Editor)
-- Uses IF NOT EXISTS everywhere — safe to run on existing DB
-- ============================================================

-- Users table (NextAuth syncs here on every login)
create table if not exists users (
  id          uuid primary key default gen_random_uuid(),
  email       text unique not null,
  name        text,
  image       text,
  role        text not null default 'attendee',
  created_at  timestamptz default now()
);

-- Host profiles
create table if not exists host_profiles (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid references users(id) on delete cascade unique,
  display_name      text,
  bio               text,
  instagram         text,
  verified          boolean default false,
  stripe_account_id text,
  created_at        timestamptz default now()
);

-- Add missing columns to events table (safe if already exists)
alter table events add column if not exists host_id      uuid references users(id) on delete cascade;
alter table events add column if not exists date         date;
alter table events add column if not exists time         text;
alter table events add column if not exists end_time     text;
alter table events add column if not exists location     text;
alter table events add column if not exists city         text not null default 'Atlanta';
alter table events add column if not exists state        text not null default 'GA';
alter table events add column if not exists capacity     integer not null default 100;
alter table events add column if not exists status       text not null default 'draft';
alter table events add column if not exists image_url    text;
alter table events add column if not exists event_type   text;
alter table events add column if not exists age_policy   text;
alter table events add column if not exists updated_at   timestamptz default now();

-- Ticket tiers
create table if not exists ticket_tiers (
  id          uuid primary key default gen_random_uuid(),
  event_id    uuid references events(id) on delete cascade,
  name        text not null,
  price       numeric(10,2) not null default 0,
  capacity    integer,
  sold_count  integer not null default 0,
  sort_order  integer default 0,
  created_at  timestamptz default now()
);

-- Tickets (purchases)
create table if not exists tickets (
  id                    uuid primary key default gen_random_uuid(),
  event_id              uuid references events(id),
  tier_id               uuid references ticket_tiers(id),
  buyer_email           text not null default '',
  buyer_name            text,
  phone_number          text,
  stripe_session_id     text unique,
  stripe_payment_intent text,
  amount_paid           numeric(10,2) not null default 0,
  platform_fee          numeric(10,2) not null default 0,
  host_payout           numeric(10,2) not null default 0,
  status                text not null default 'pending',
  created_at            timestamptz default now()
);

-- Add phone_number if tickets table already existed without it
alter table tickets add column if not exists phone_number text;

-- Indexes
create index if not exists events_status_idx      on events(status);
create index if not exists events_host_id_idx     on events(host_id);
create index if not exists events_date_idx        on events(date);
create index if not exists ticket_tiers_event_idx on ticket_tiers(event_id);
create index if not exists tickets_event_idx      on tickets(event_id);
create index if not exists tickets_session_idx    on tickets(stripe_session_id);

-- Auto-update updated_at trigger
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists events_updated_at on events;
create trigger events_updated_at
  before update on events
  for each row execute procedure update_updated_at();

-- Atomic sold_count increment (used by Stripe webhook)
create or replace function increment_sold_count(tier_id uuid, qty integer)
returns void as $$
begin
  update ticket_tiers set sold_count = sold_count + qty where id = tier_id;
end;
$$ language plpgsql security definer;
