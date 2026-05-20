create table if not exists income_entries (
  id          uuid primary key default gen_random_uuid(),
  description text not null,
  amount      numeric(10,2) not null,
  date        date not null default current_date,
  category    text,
  notes       text,
  created_at  timestamptz not null default now()
);

alter table income_entries enable row level security;

create policy "owner_all" on income_entries
  for all using (auth.uid() is not null)
  with check (auth.uid() is not null);
