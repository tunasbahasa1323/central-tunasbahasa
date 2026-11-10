-- Standardize employee IDs to BLB-YYYYMM-DIVISION-NNN.
-- Run after the base employee schema migration.

alter table public.cm_employees
  drop constraint if exists cm_employees_employee_code_check;

-- Use temporary unique values so the final codes cannot collide during the rewrite.
update public.cm_employees
set employee_code = 'TMP-' || id::text;

with numbered as (
  select
    id,
    format(
      'BLB-%s-%s-%s',
      to_char(created_at at time zone 'Asia/Jakarta', 'YYYYMM'),
      case when role in ('superadmin', 'manager') then 'MG' else 'OP' end,
      lpad(row_number() over (
        partition by to_char(created_at at time zone 'Asia/Jakarta', 'YYYYMM'),
                     case when role in ('superadmin', 'manager') then 'MG' else 'OP' end
        order by created_at, id
      )::text, 3, '0')
    ) as new_code
  from public.cm_employees
)
update public.cm_employees as employees
set employee_code = numbered.new_code
from numbered
where employees.id = numbered.id;

alter table public.cm_employees
  add constraint cm_employees_employee_code_check
  check (employee_code ~ '^BLB-[0-9]{6}-(MG|OP)-[0-9]{3}$');
