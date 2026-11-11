create sequence if not exists public.tu_order_code_seq;

create table if not exists public.tu_orders (
  id uuid primary key default gen_random_uuid(),
  order_code text not null default ('TRK-' || to_char(now(), 'YYYYMM') || '-' || lpad(nextval('public.tu_order_code_seq')::text, 3, '0')),
  customer_id uuid references public.tu_customers(id) on delete set null,
  customer_name text not null,
  customer_phone text not null default '',
  dp integer not null default 0 check (dp >= 0),
  status text not null default 'unpaid' check (status in ('paid', 'partial', 'unpaid')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tu_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.tu_orders(id) on delete cascade,
  service_id uuid references public.tu_services(id) on delete set null,
  service_name text not null,
  quantity integer not null default 1 check (quantity > 0),
  amount integer not null default 0 check (amount >= 0),
  discount integer not null default 0 check (discount >= 0),
  staff_name text not null default '',
  staff_initials text not null default '',
  created_at timestamptz not null default now()
);

alter table public.tu_orders enable row level security;
alter table public.tu_order_items enable row level security;

drop policy if exists "Prototype can read TurkiUp orders" on public.tu_orders;
drop policy if exists "Prototype can manage TurkiUp orders" on public.tu_orders;
drop policy if exists "Prototype can read TurkiUp order items" on public.tu_order_items;
drop policy if exists "Prototype can manage TurkiUp order items" on public.tu_order_items;

create policy "Prototype can read TurkiUp orders" on public.tu_orders for select to anon, authenticated using (true);
create policy "Prototype can manage TurkiUp orders" on public.tu_orders for all to anon, authenticated using (true) with check (true);
create policy "Prototype can read TurkiUp order items" on public.tu_order_items for select to anon, authenticated using (true);
create policy "Prototype can manage TurkiUp order items" on public.tu_order_items for all to anon, authenticated using (true) with check (true);

create index if not exists tu_order_items_order_id_idx on public.tu_order_items(order_id);
create index if not exists tu_orders_created_at_idx on public.tu_orders(created_at desc);
