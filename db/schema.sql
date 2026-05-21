-- LUCA Amsterdam — Database schema
-- Run this in Supabase SQL editor, then run seed.sql.
-- Idempotent: safe to re-run during development.

-- ─────────────────────────────  EXTENSIONS  ─────────────────────────────
create extension if not exists "pgcrypto";
create extension if not exists "citext";

-- ─────────────────────────────  ENUMS  ─────────────────────────────
do $$ begin
  create type booking_status as enum ('pending','confirmed','cancelled','no_show','completed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type customer_source as enum ('web','import','admin','hermes');
exception when duplicate_object then null; end $$;

do $$ begin
  create type admin_role as enum ('admin','viewer');
exception when duplicate_object then null; end $$;

do $$ begin
  create type agent_status as enum ('active','paused','revoked');
exception when duplicate_object then null; end $$;

do $$ begin
  create type import_status as enum ('uploaded','previewed','committed','failed');
exception when duplicate_object then null; end $$;

-- ─────────────────────────────  TABLES  ─────────────────────────────

create table if not exists services (
  id            text primary key,
  category      text not null,
  name_nl       text not null,
  name_en       text not null,
  desc_nl       text,
  desc_en       text,
  note_nl       text,
  note_en       text,
  duration_min  int not null check (duration_min > 0),
  price_cents   int not null check (price_cents >= 0),
  requires_guests boolean not null default false,
  max_guests    int not null default 1,
  daily_capacity int,                              -- nullable = uncapped
  combo_parts   text[] default '{}',
  active        boolean not null default true,
  sort_order    int not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists addons (
  id           text primary key,
  name_nl      text not null,
  name_en      text not null,
  desc_nl      text,
  desc_en      text,
  price_cents  int not null check (price_cents >= 0),
  service_ids  text[] not null default '{}',
  active       boolean not null default true,
  sort_order   int not null default 0
);

create table if not exists customers (
  id                  uuid primary key default gen_random_uuid(),
  email               citext unique not null,
  phone               text,
  full_name           text,
  language            text not null default 'nl' check (language in ('nl','en')),
  marketing_consent   boolean not null default false,
  source              customer_source not null default 'web',
  tags                text[] not null default '{}',
  notes               text,
  first_seen_at       timestamptz not null default now(),
  last_seen_at        timestamptz not null default now(),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists customers_phone_idx on customers (phone) where phone is not null;
create index if not exists customers_tags_idx on customers using gin (tags);
create index if not exists customers_last_seen_idx on customers (last_seen_at desc);

create or replace function gen_booking_reference() returns text language sql
  set search_path = public, pg_temp as $$
  select 'LUC-' || upper(substr(replace(gen_random_uuid()::text,'-',''), 1, 6));
$$;

create or replace function gen_cancel_token() returns text language sql
  set search_path = public, pg_temp as $$
  select replace(gen_random_uuid()::text,'-','') || replace(gen_random_uuid()::text,'-','');
$$;

create table if not exists bookings (
  id                uuid primary key default gen_random_uuid(),
  reference         text unique not null default gen_booking_reference(),
  customer_id       uuid not null references customers(id) on delete cascade,
  service_id        text not null references services(id),
  start_at          timestamptz not null,
  end_at            timestamptz not null,
  guests            int not null default 1 check (guests >= 1),
  total_cents       int not null check (total_cents >= 0),
  addon_ids         text[] not null default '{}',
  status            booking_status not null default 'confirmed',
  source            text not null default 'web',
  notes             text,
  admin_notes       text,
  cancel_token      text not null default gen_cancel_token(),
  cancelled_at      timestamptz,
  cancelled_reason  text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  check (end_at > start_at)
);

create index if not exists bookings_start_at_idx on bookings (start_at);
create index if not exists bookings_status_idx on bookings (status);
create index if not exists bookings_customer_idx on bookings (customer_id);
create index if not exists bookings_service_start_idx on bookings (service_id, start_at) where status in ('pending','confirmed');

create table if not exists import_jobs (
  id              uuid primary key default gen_random_uuid(),
  filename        text,
  status          import_status not null default 'uploaded',
  row_count       int not null default 0,
  insertable      int not null default 0,
  duplicate_count int not null default 0,
  invalid_count   int not null default 0,
  inserted_count  int not null default 0,
  mapping         jsonb,
  preview         jsonb,
  error           text,
  tag             text,
  created_by      uuid references auth.users(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists import_jobs_created_at_idx on import_jobs (created_at desc);

create table if not exists hermes_agents (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  description     text,
  api_key_hash    text not null unique,
  api_key_prefix  text not null,                   -- first 8 chars for UI display
  scopes          text[] not null default array['past_clients:read','activity:write'],
  status          agent_status not null default 'active',
  last_seen_at    timestamptz,
  created_by      uuid references auth.users(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists hermes_agents_status_idx on hermes_agents (status);

create table if not exists hermes_activity (
  id           uuid primary key default gen_random_uuid(),
  agent_id     uuid not null references hermes_agents(id) on delete cascade,
  kind         text not null,                      -- 'message_sent','reply_received','booking_recovered','campaign_started','note'
  customer_id  uuid references customers(id) on delete set null,
  payload      jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now()
);

create index if not exists hermes_activity_agent_idx on hermes_activity (agent_id, created_at desc);
create index if not exists hermes_activity_kind_idx on hermes_activity (kind);
create index if not exists hermes_activity_customer_idx on hermes_activity (customer_id) where customer_id is not null;

create table if not exists admin_profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  full_name    text,
  role         admin_role not null default 'admin',
  created_at   timestamptz not null default now()
);

-- ─────────────────────────────  TIMESTAMP TRIGGERS  ─────────────────────────────
create or replace function touch_updated_at() returns trigger language plpgsql
  set search_path = public, pg_temp as $$
begin
  new.updated_at = now();
  return new;
end $$;

do $$
declare t text;
begin
  for t in select unnest(array['services','customers','bookings','import_jobs','hermes_agents']) loop
    execute format('drop trigger if exists trg_%s_touch on %s', t, t);
    execute format('create trigger trg_%s_touch before update on %s for each row execute function touch_updated_at()', t, t);
  end loop;
end $$;

-- ─────────────────────────────  CUSTOMER UPSERT HELPER  ─────────────────────────────
create or replace function upsert_customer(
  p_email text,
  p_full_name text default null,
  p_phone text default null,
  p_language text default 'nl',
  p_consent boolean default false,
  p_source customer_source default 'web'
) returns customers language plpgsql
  set search_path = public, pg_temp as $$
declare
  c customers;
begin
  insert into customers (email, full_name, phone, language, marketing_consent, source)
  values (p_email, p_full_name, p_phone, coalesce(p_language,'nl'), coalesce(p_consent,false), p_source)
  on conflict (email) do update set
    full_name = coalesce(excluded.full_name, customers.full_name),
    phone     = coalesce(excluded.phone, customers.phone),
    language  = coalesce(excluded.language, customers.language),
    marketing_consent = customers.marketing_consent or excluded.marketing_consent,
    last_seen_at = now(),
    updated_at   = now()
  returning * into c;
  return c;
end $$;

-- ─────────────────────────────  ADMIN HELPER  ─────────────────────────────
create or replace function is_admin() returns boolean language sql security definer
  set search_path = public, pg_temp as $$
  select exists (select 1 from admin_profiles where id = auth.uid());
$$;
-- Only RLS policies and the server should call this; not callable from anon REST.
revoke execute on function public.is_admin() from anon, authenticated, public;
grant  execute on function public.is_admin() to service_role;

-- ─────────────────────────────  RLS  ─────────────────────────────
alter table services         enable row level security;
alter table addons           enable row level security;
alter table customers        enable row level security;
alter table bookings         enable row level security;
alter table import_jobs      enable row level security;
alter table hermes_agents    enable row level security;
alter table hermes_activity  enable row level security;
alter table admin_profiles   enable row level security;

-- Drop existing policies (idempotent re-run)
do $$
declare r record;
begin
  for r in select schemaname, tablename, policyname from pg_policies
           where schemaname='public'
             and tablename in ('services','addons','customers','bookings','import_jobs','hermes_agents','hermes_activity','admin_profiles')
  loop
    execute format('drop policy %I on %I.%I', r.policyname, r.schemaname, r.tablename);
  end loop;
end $$;

-- Services + addons: publicly readable (active rows only via view), admins manage
create policy services_select_public on services for select using (active = true);
create policy services_admin_all on services for all using (is_admin()) with check (is_admin());

create policy addons_select_public on addons for select using (active = true);
create policy addons_admin_all on addons for all using (is_admin()) with check (is_admin());

-- Customers + bookings: admin-only via RLS. Anonymous writes happen via service-role functions.
create policy customers_admin_all on customers for all using (is_admin()) with check (is_admin());
create policy bookings_admin_all on bookings for all using (is_admin()) with check (is_admin());
create policy import_jobs_admin_all on import_jobs for all using (is_admin()) with check (is_admin());
create policy hermes_agents_admin_all on hermes_agents for all using (is_admin()) with check (is_admin());
create policy hermes_activity_admin_all on hermes_activity for all using (is_admin()) with check (is_admin());

-- admin_profiles: only own row visible to authed user; admins see all
create policy admin_profiles_self on admin_profiles for select using (auth.uid() = id or is_admin());
create policy admin_profiles_admin_write on admin_profiles for all using (is_admin()) with check (is_admin());

-- ─────────────────────────────  VIEWS  ─────────────────────────────
-- security_invoker=true means the view respects RLS on underlying tables
-- (admin role sees everything via the *_admin_all policies; anon sees nothing).
drop view if exists booking_with_customer;
create view booking_with_customer with (security_invoker = true) as
  select b.*,
         c.email     as customer_email,
         c.full_name as customer_name,
         c.phone     as customer_phone,
         c.language  as customer_language,
         s.name_nl   as service_name_nl,
         s.name_en   as service_name_en,
         s.category  as service_category,
         s.duration_min as service_duration_min
    from bookings b
    join customers c on c.id = b.customer_id
    join services  s on s.id = b.service_id;

grant select on booking_with_customer to authenticated;
