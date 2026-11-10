create sequence if not exists public.tu_customer_code_seq;

alter table public.tu_customers
  add column if not exists customer_code text;

with numbered_customers as (
  select id, row_number() over (order by created_at, id) as number
  from public.tu_customers
  where customer_code is null
)
update public.tu_customers as customer
set customer_code = 'CUS-' || lpad(numbered_customers.number::text, 3, '0')
from numbered_customers
where customer.id = numbered_customers.id;

select setval(
  'public.tu_customer_code_seq',
  coalesce(
    (select max(nullif(regexp_replace(customer_code, '[^0-9]', '', 'g'), ''))::bigint from public.tu_customers),
    1
  ),
  exists (select 1 from public.tu_customers where customer_code is not null)
);

alter table public.tu_customers
  alter column customer_code set default ('CUS-' || lpad(nextval('public.tu_customer_code_seq')::text, 3, '0')),
  alter column customer_code set not null;

create unique index if not exists tu_customers_customer_code_key
  on public.tu_customers (customer_code);
