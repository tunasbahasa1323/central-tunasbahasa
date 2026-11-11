create table if not exists public.tu_task_comments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tu_tasks(id) on delete cascade,
  author_name text not null default 'Admin',
  comment text not null,
  created_at timestamptz not null default now()
);

alter table public.tu_task_comments enable row level security;
create policy "Prototype task comment access" on public.tu_task_comments
  for all to anon, authenticated using (true) with check (true);
create index if not exists tu_task_comments_task_idx
  on public.tu_task_comments(task_id, created_at desc);