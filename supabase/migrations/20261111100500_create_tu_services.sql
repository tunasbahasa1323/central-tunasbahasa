create sequence if not exists public.tu_service_code_seq;

create table if not exists public.tu_services (
  id uuid primary key default gen_random_uuid(),
  service_code text not null default ('SVC-' || lpad(nextval('public.tu_service_code_seq')::text, 3, '0')),
  name text not null,
  category text not null default '',
  description text not null default '',
  base_price integer not null default 0 check (base_price >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.tu_services enable row level security;

drop policy if exists "Prototype can read TurkiUp services" on public.tu_services;
drop policy if exists "Prototype can manage TurkiUp services" on public.tu_services;

create policy "Prototype can read TurkiUp services"
  on public.tu_services for select to anon, authenticated using (true);

create policy "Prototype can manage TurkiUp services"
  on public.tu_services for all to anon, authenticated using (true) with check (true);

create unique index if not exists tu_services_service_code_key on public.tu_services (service_code);
