create or replace function public.create_tu_tasks_after_payment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  item record;
  task_id uuid;
begin
  if new.status not in ('partial', 'paid') then
    return new;
  end if;

  for item in
    select oi.id, oi.service_name
    from public.tu_order_items oi
    where oi.order_id = new.id
  loop
    insert into public.tu_tasks (order_id, order_item_id, title, status)
    select new.id, item.id, item.service_name, 'waiting_assignment'
    where not exists (
      select 1
      from public.tu_tasks t
      where t.order_item_id = item.id
    )
    returning id into task_id;

    if task_id is not null then
      insert into public.tu_task_stages (task_id, stage_name, stage_order, status)
      values (task_id, item.service_name, 1, 'pending');
      task_id := null;
    end if;
  end loop;

  return new;
end;
$$;

drop trigger if exists tu_orders_create_tasks_after_payment on public.tu_orders;
create trigger tu_orders_create_tasks_after_payment
after insert or update of status on public.tu_orders
for each row
execute function public.create_tu_tasks_after_payment();

-- Backfill tasks for qualifying orders that existed before this trigger.
insert into public.tu_tasks (order_id, order_item_id, title, status)
select o.id, oi.id, oi.service_name, 'waiting_assignment'
from public.tu_orders o
join public.tu_order_items oi on oi.order_id = o.id
where o.status in ('partial', 'paid')
  and not exists (
    select 1 from public.tu_tasks t where t.order_item_id = oi.id
  );

insert into public.tu_task_stages (task_id, stage_name, stage_order, status)
select t.id, t.title, 1, 'pending'
from public.tu_tasks t
where not exists (
  select 1 from public.tu_task_stages s where s.task_id = t.id
);