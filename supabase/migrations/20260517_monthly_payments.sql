-- Tabla de pagos mensuales por cliente
-- Ejecutar en Supabase SQL Editor

create table if not exists monthly_payments (
  id           uuid primary key default gen_random_uuid(),
  client_id    uuid not null references clients(id) on delete cascade,
  month        date not null, -- primer día del mes, ej. 2026-05-01
  paid_at      timestamptz,
  amount       numeric(10,2),
  notes        text,
  created_at   timestamptz not null default now(),
  unique(client_id, month)
);

alter table monthly_payments enable row level security;

create policy "owner_all" on monthly_payments
  for all using (auth.uid() is not null)
  with check (auth.uid() is not null);
