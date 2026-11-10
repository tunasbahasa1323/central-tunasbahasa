-- Prototype-only access: the app currently has no Supabase Auth session.
-- Replace these policies with authenticated/role-based policies before production.

drop policy if exists "Authenticated users can read employees" on public.cm_employees;
drop policy if exists "Authenticated users can create employees" on public.cm_employees;
drop policy if exists "Authenticated users can read employee sectors" on public.cm_user_sectors;
drop policy if exists "Authenticated users can create employee sectors" on public.cm_user_sectors;
drop policy if exists "Authenticated users can read active sectors" on public.cm_business_sectors;

create policy "Prototype can read employees"
  on public.cm_employees for select to anon, authenticated
  using (true);

create policy "Prototype can create employees"
  on public.cm_employees for insert to anon, authenticated
  with check (true);

create policy "Prototype can read employee sectors"
  on public.cm_user_sectors for select to anon, authenticated
  using (true);

create policy "Prototype can create employee sectors"
  on public.cm_user_sectors for insert to anon, authenticated
  with check (true);

create policy "Prototype can read active sectors"
  on public.cm_business_sectors for select to anon, authenticated
  using (is_active = true);
