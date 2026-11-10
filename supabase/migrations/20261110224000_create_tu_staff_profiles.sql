create table if not exists public.tu_staff_profiles (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null unique references public.cm_employees(id) on delete cascade,
  role text not null default 'Staff',
  specialization text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.tu_staff_profiles enable row level security;

drop policy if exists "Prototype can read TurkiUp staff profiles" on public.tu_staff_profiles;
drop policy if exists "Prototype can manage TurkiUp staff profiles" on public.tu_staff_profiles;

create policy "Prototype can read TurkiUp staff profiles"
  on public.tu_staff_profiles for select to anon, authenticated
  using (true);

create policy "Prototype can manage TurkiUp staff profiles"
  on public.tu_staff_profiles for all to anon, authenticated
  using (true)
  with check (true);
