alter table public.tu_order_costs
  add column if not exists order_item_id uuid references public.tu_order_items(id) on delete set null,
  add column if not exists source text not null default 'finance' check (source in ('finance', 'staff')),
  add column if not exists approval_status text not null default 'approved' check (approval_status in ('pending', 'approved', 'rejected')),
  add column if not exists approved_at timestamptz,
  add column if not exists approved_by text;

create index if not exists tu_order_costs_order_item_idx on public.tu_order_costs(order_item_id);
