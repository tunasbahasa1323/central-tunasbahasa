create table if not exists public.tu_order_costs (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.tu_orders(id) on delete cascade,
  task_id uuid references public.tu_tasks(id) on delete set null,
  cost_type text not null default 'operational',
  description text not null,
  amount integer not null check (amount > 0),
  vendor_or_staff text not null default '',
  incurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.tu_order_costs enable row level security;
create policy "Prototype TurkiUp order cost access" on public.tu_order_costs
  for all to anon, authenticated using (true) with check (true);
create index if not exists tu_order_costs_order_idx on public.tu_order_costs(order_id);
create index if not exists tu_order_costs_incurred_idx on public.tu_order_costs(incurred_at desc);