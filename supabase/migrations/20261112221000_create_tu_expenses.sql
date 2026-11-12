create table if not exists public.tu_expenses (
  id uuid primary key default gen_random_uuid(),
  description text not null,
  category text not null default 'operational',
  amount integer not null check (amount > 0),
  incurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.tu_expenses enable row level security;
create policy "Prototype TurkiUp expense access" on public.tu_expenses
  for all to anon, authenticated using (true) with check (true);
