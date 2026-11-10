create extension if not exists pgcrypto;

create table if not exists public.cm_business_sectors (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.cm_employees (
  id uuid primary key default gen_random_uuid(),
  employee_code text not null unique check (employee_code ~ '^BLB-[0-9]{6}-(MG|OP)-[0-9]{3}$'),
  nama_lengkap text not null,
  nik text not null unique,
  email text unique,
  tempat_lahir text,
  tanggal_lahir date,
  jenis_kelamin text check (jenis_kelamin in ('Laki-laki', 'Perempuan')),
  alamat text,
  no_wa text unique,
  no_tlp text,
  role text not null default 'staff' check (role in ('superadmin', 'manager', 'staff')),
  password text not null default 'Tuba2023',
  is_active boolean not null default true,
  nama_bank text,
  nomor_rekening text,
  nama_pemilik_rekening text,
  cabang_bank text,
  created_at timestamptz not null default now()
);

create table if not exists public.cm_user_sectors (
  user_id uuid not null references public.cm_employees(id) on delete cascade,
  sector_id uuid not null references public.cm_business_sectors(id) on delete cascade,
  primary key (user_id, sector_id)
);

insert into public.cm_business_sectors (name, description)
values
  ('Tunas Bahasa', 'Sektor jasa pendidikan dan bahasa'),
  ('TurkiUp', 'Sektor agensi dan layanan TurkiUp'),
  ('Alkapreloved', 'Sektor bisnis preloved')
on conflict (name) do nothing;

alter table public.cm_business_sectors enable row level security;
alter table public.cm_employees enable row level security;
alter table public.cm_user_sectors enable row level security;

create policy "Authenticated users can read active sectors"
  on public.cm_business_sectors for select to authenticated
  using (is_active = true);

create policy "Authenticated users can read employees"
  on public.cm_employees for select to authenticated
  using (true);

create policy "Authenticated users can read employee sectors"
  on public.cm_user_sectors for select to authenticated
  using (true);

create policy "Authenticated users can create employees"
  on public.cm_employees for insert to authenticated
  with check (true);

create policy "Authenticated users can create employee sectors"
  on public.cm_user_sectors for insert to authenticated
  with check (true);
