create table if not exists general_expenses (
  id          uuid primary key default gen_random_uuid(),
  description text not null,
  amount      numeric(10,2) not null,
  date        date not null default current_date,
  category    text,
  vendor      text,
  notes       text,
  created_at  timestamptz not null default now()
);

alter table general_expenses enable row level security;

create policy "owner_all" on general_expenses
  for all using (auth.uid() is not null)
  with check (auth.uid() is not null);
