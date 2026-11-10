create table if not exists public.tu_customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text not null default '',
  address text not null default '',
  rt_rw text not null default '',
  village text not null default '',
  district text not null default '',
  city text not null default '',
  province text not null default '',
  postal_code text not null default '',
  source text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.tu_customers enable row level security;

drop policy if exists "Prototype can read TurkiUp customers" on public.tu_customers;
drop policy if exists "Prototype can manage TurkiUp customers" on public.tu_customers;

create policy "Prototype can read TurkiUp customers"
  on public.tu_customers for select to anon, authenticated
  using (true);

create policy "Prototype can manage TurkiUp customers"
  on public.tu_customers for all to anon, authenticated
  using (true)
  with check (true);
