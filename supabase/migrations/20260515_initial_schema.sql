-- Silver — Schema inicial
-- Ejecutar en Supabase SQL Editor

-- Habilitar extensiones
create extension if not exists "uuid-ossp";

-- ─── Clientes (Bralto) ───────────────────────────────────────────
create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  monthly_amount numeric(10,2) not null,
  tier text not null check (tier in ('anchor','high','mid','entry','custom')),
  status text not null default 'active' check (status in ('active','paused','churned')),
  category text,
  start_date date not null default current_date,
  churn_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── Gastos fijos ────────────────────────────────────────────────
create table if not exists fixed_expenses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  monthly_amount numeric(10,2) not null,
  category text not null check (category in ('infrastructure','tools','personal','team','marketing','other')),
  scope text not null default 'bralto' check (scope in ('personal','bralto','both')),
  active boolean not null default true,
  notes text,
  created_at timestamptz not null default now()
);

-- ─── Metas mensuales ─────────────────────────────────────────────
create table if not exists monthly_goals (
  id uuid primary key default gen_random_uuid(),
  month date not null unique,
  mrr_target numeric(10,2) not null,
  new_clients_target int not null default 0,
  ad_spend_budget numeric(10,2) not null default 0,
  narrative text,
  notes text,
  created_at timestamptz not null default now()
);

-- ─── Snapshots mensuales ──────────────────────────────────────────
create table if not exists monthly_snapshots (
  id uuid primary key default gen_random_uuid(),
  month date not null unique,
  mrr_actual numeric(10,2) not null,
  expenses_actual numeric(10,2) not null,
  ad_spend_actual numeric(10,2) not null default 0,
  new_clients_actual int not null default 0,
  churned_clients_actual int not null default 0,
  notes text,
  created_at timestamptz not null default now()
);

-- ─── Campañas de ads ─────────────────────────────────────────────
create table if not exists ad_campaigns (
  id uuid primary key default gen_random_uuid(),
  platform text not null check (platform in ('meta','linkedin','google','other')),
  name text not null,
  start_date date not null,
  end_date date,
  total_spend numeric(10,2) not null default 0,
  leads_generated int not null default 0,
  clients_closed int not null default 0,
  mrr_generated numeric(10,2) not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ─── Trigger: updated_at automático en clients ────────────────────
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger clients_updated_at
  before update on clients
  for each row execute function set_updated_at();

-- ─── RLS ─────────────────────────────────────────────────────────
alter table clients enable row level security;
alter table fixed_expenses enable row level security;
alter table monthly_goals enable row level security;
alter table monthly_snapshots enable row level security;
alter table ad_campaigns enable row level security;

-- Policy: solo el usuario autenticado accede a sus datos
-- Reemplaza YOUR_USER_ID con el UUID de tu usuario de Supabase Auth
-- O usa la approach de email match:

create policy "owner_all" on clients
  for all using (auth.uid() is not null)
  with check (auth.uid() is not null);

create policy "owner_all" on fixed_expenses
  for all using (auth.uid() is not null)
  with check (auth.uid() is not null);

create policy "owner_all" on monthly_goals
  for all using (auth.uid() is not null)
  with check (auth.uid() is not null);

create policy "owner_all" on monthly_snapshots
  for all using (auth.uid() is not null)
  with check (auth.uid() is not null);

create policy "owner_all" on ad_campaigns
  for all using (auth.uid() is not null)
  with check (auth.uid() is not null);
