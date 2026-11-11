create table if not exists public.tu_order_payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.tu_orders(id) on delete cascade,
  amount integer not null check (amount > 0),
  payment_type text not null default 'partial' check (payment_type in ('partial', 'paid')),
  paid_at timestamptz not null default now(),
  payment_method text not null default 'transfer',
  proof_url text,
  proof_public_id text,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.tu_order_payments enable row level security;

drop policy if exists "Prototype can read TurkiUp order payments" on public.tu_order_payments;
drop policy if exists "Prototype can manage TurkiUp order payments" on public.tu_order_payments;

create policy "Prototype can read TurkiUp order payments"
  on public.tu_order_payments for select to anon, authenticated using (true);
create policy "Prototype can manage TurkiUp order payments"
  on public.tu_order_payments for all to anon, authenticated using (true) with check (true);

create index if not exists tu_order_payments_order_id_idx on public.tu_order_payments(order_id);
