-- ============================================================
-- Metlanta — Database Schema
-- Run this in Supabase SQL editor (Dashboard → SQL Editor)
-- ============================================================

-- Users (synced from NextAuth on every login)
create table if not exists users (
  id          uuid primary key default gen_random_uuid(),
  email       text unique not null,
  name        text,
  image       text,
  role        text not null default 'attendee',  -- attendee | host | admin
  created_at  timestamptz default now()
);

-- Host profiles (one per host user)
create table if not exists host_profiles (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references users(id) on delete cascade unique,
  display_name  text,
  bio           text,
  instagram     text,
  verified      boolean default false,
  stripe_account_id text,
  created_at    timestamptz default now()
);

-- Events
create table if not exists events (
  id           uuid primary key default gen_random_uuid(),
  host_id      uuid references users(id) on delete cascade,
  title        text not null,
  description  text,
  date         date not null,
  time         text,
  end_time     text,
  location     text not null,
  city         text not null default 'Atlanta',
  state        text not null default 'GA',
  capacity     integer not null default 100,
  status       text not null default 'draft',  -- draft | live | ended | cancelled
  image_url    text,
  event_type   text,  -- kickback | day_party | nightlife | after_prom | pop_up | school_event
  age_policy   text,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

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
  id                      uuid primary key default gen_random_uuid(),
  event_id                uuid references events(id),
  tier_id                 uuid references ticket_tiers(id),
  buyer_email             text not null,
  buyer_name              text,
  phone_number            text,
  stripe_session_id       text unique,
  stripe_payment_intent   text,
  amount_paid             numeric(10,2) not null,
  platform_fee            numeric(10,2) not null,
  host_payout             numeric(10,2) not null,
  status                  text not null default 'pending',  -- pending | confirmed | refunded
  created_at              timestamptz default now()
);

-- If tickets table already exists, add phone_number column:
-- alter table tickets add column if not exists phone_number text;

-- Indexes for performance
create index if not exists events_status_idx       on events(status);
create index if not exists events_host_id_idx      on events(host_id);
create index if not exists events_date_idx         on events(date);
create index if not exists ticket_tiers_event_idx  on ticket_tiers(event_id);
create index if not exists tickets_event_idx       on tickets(event_id);
create index if not exists tickets_session_idx     on tickets(stripe_session_id);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger events_updated_at
  before update on events
  for each row execute procedure update_updated_at();

-- RPC: increment sold_count atomically
create or replace function increment_sold_count(tier_id uuid, qty integer)
returns void as $$
begin
  update ticket_tiers set sold_count = sold_count + qty where id = tier_id;
end;
$$ language plpgsql security definer;
