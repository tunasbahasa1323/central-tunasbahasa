create table if not exists public.tu_tasks (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.tu_orders(id) on delete cascade,
  order_item_id uuid references public.tu_order_items(id) on delete cascade,
  title text not null,
  status text not null default 'waiting_assignment' check (status in ('waiting_assignment','assigned','in_progress','done')),
  active_staff_id uuid references public.cm_employees(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.tu_task_stages (
  id uuid primary key default gen_random_uuid(), task_id uuid not null references public.tu_tasks(id) on delete cascade,
  stage_name text not null, stage_order integer not null default 1, status text not null default 'pending' check (status in ('pending','in_progress','completed')),
  staff_id uuid references public.cm_employees(id) on delete set null, assigned_at timestamptz, started_at timestamptz, completed_at timestamptz, notes text not null default '', created_at timestamptz not null default now()
);
create table if not exists public.tu_task_handoffs (
  id uuid primary key default gen_random_uuid(), task_id uuid not null references public.tu_tasks(id) on delete cascade,
  from_staff_id uuid references public.cm_employees(id) on delete set null, to_staff_id uuid references public.cm_employees(id) on delete set null,
  from_stage_id uuid references public.tu_task_stages(id) on delete set null, to_stage_id uuid references public.tu_task_stages(id) on delete set null,
  handoff_note text not null default '', handed_off_at timestamptz not null default now(), accepted_at timestamptz
);
create table if not exists public.tu_task_status_history (
  id uuid primary key default gen_random_uuid(), task_id uuid not null references public.tu_tasks(id) on delete cascade,
  stage_id uuid references public.tu_task_stages(id) on delete set null, from_status text, to_status text not null, changed_by uuid references public.cm_employees(id) on delete set null, notes text not null default '', created_at timestamptz not null default now()
);
alter table public.tu_tasks enable row level security; alter table public.tu_task_stages enable row level security; alter table public.tu_task_handoffs enable row level security; alter table public.tu_task_status_history enable row level security;
create policy "Prototype task access" on public.tu_tasks for all to anon, authenticated using (true) with check (true);
create policy "Prototype stage access" on public.tu_task_stages for all to anon, authenticated using (true) with check (true);
create policy "Prototype handoff access" on public.tu_task_handoffs for all to anon, authenticated using (true) with check (true);
create policy "Prototype task history access" on public.tu_task_status_history for all to anon, authenticated using (true) with check (true);
create index if not exists tu_tasks_order_idx on public.tu_tasks(order_id);
