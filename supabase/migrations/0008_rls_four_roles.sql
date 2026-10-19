-- 1. Drop every existing policy in public (rebuilt below)
do $do$
declare r record;
begin
  for r in select schemaname, tablename, policyname from pg_policies where schemaname = 'public' loop
    execute format('drop policy %I on %I.%I', r.policyname, r.schemaname, r.tablename);
  end loop;
end $do$;

-- 2. Helpers
create or replace function auth_has_division(d division) returns boolean
language sql stable security definer set search_path = public as $$
  select case auth_role()
    when 'MASTER_ADMIN' then true
    when 'FINANCE_ADMIN' then true
    when 'UNIT_ADMIN' then d <> 'bba' and exists (
      select 1 from profile_divisions where profile_id = auth.uid() and division = d)
    when 'UNIT_MEMBER' then d <> 'bba' and exists (
      select 1 from profile_divisions where profile_id = auth.uid() and division = d)
    else false
  end
$$;

create or replace function auth_shares_division(p uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from profile_divisions a
    join profile_divisions b on b.division = a.division
    where a.profile_id = auth.uid() and b.profile_id = p)
$$;

-- 3. MFA required on every table
do $do$
declare t text;
begin
  foreach t in array array[
    'profiles', 'profile_divisions', 'clients', 'contracts', 'projects', 'receipts', 'expenses',
    'documents', 'org_units', 'rule_sets', 'rule_components', 'rule_set_approvals',
    'role_allocations', 'role_allocation_adjustments', 'role_allocation_lines',
    'warranty_deductions', 'audit_log'
  ] loop
    execute format('create policy mfa_required on %I as restrictive for all to authenticated using (auth_aal2()) with check (auth_aal2())', t);
  end loop;
end $do$;

-- 4. Profiles and divisions
create policy profiles_read on profiles for select to authenticated
  using (id = auth.uid() or auth_role() = 'MASTER_ADMIN'
         or (auth_role() = 'UNIT_ADMIN' and auth_shares_division(id)));
create policy profiles_write on profiles for all to authenticated
  using (auth_role() = 'MASTER_ADMIN') with check (auth_role() = 'MASTER_ADMIN');

create policy pdiv_read on profile_divisions for select to authenticated
  using (profile_id = auth.uid() or auth_role() = 'MASTER_ADMIN'
         or (auth_role() = 'UNIT_ADMIN' and auth_has_division(division)));
create policy pdiv_write on profile_divisions for all to authenticated
  using (auth_role() = 'MASTER_ADMIN') with check (auth_role() = 'MASTER_ADMIN');

-- 5. Clients, contracts, projects: read for three roles, write for MASTER and UNIT_ADMIN
do $do$
declare t text;
begin
  foreach t in array array['clients', 'contracts', 'projects'] loop
    execute format('create policy %I on %I for select to authenticated using (auth_role() in (''MASTER_ADMIN'', ''UNIT_ADMIN'', ''FINANCE_ADMIN'') and auth_has_division(division))', t || '_read', t);
    execute format('create policy %I on %I for all to authenticated using (auth_role() in (''MASTER_ADMIN'', ''UNIT_ADMIN'') and auth_has_division(division)) with check (auth_role() in (''MASTER_ADMIN'', ''UNIT_ADMIN'') and auth_has_division(division))', t || '_write', t);
  end loop;
end $do$;

-- 6. Finance: UNIT_ADMIN read-only, FINANCE_ADMIN and MASTER_ADMIN write
create policy expenses_read on expenses for select to authenticated
  using (auth_role() in ('MASTER_ADMIN', 'UNIT_ADMIN', 'FINANCE_ADMIN') and auth_has_division(division));
create policy expenses_write on expenses for all to authenticated
  using (auth_role() in ('MASTER_ADMIN', 'FINANCE_ADMIN') and auth_has_division(division))
  with check (auth_role() in ('MASTER_ADMIN', 'FINANCE_ADMIN') and auth_has_division(division));

create policy receipts_read on receipts for select to authenticated
  using (auth_role() in ('MASTER_ADMIN', 'UNIT_ADMIN', 'FINANCE_ADMIN')
         and exists (select 1 from contracts c where c.id = contract_id and auth_has_division(c.division)));
create policy receipts_write on receipts for all to authenticated
  using (auth_role() in ('MASTER_ADMIN', 'FINANCE_ADMIN')
         and exists (select 1 from contracts c where c.id = contract_id and auth_has_division(c.division)))
  with check (auth_role() in ('MASTER_ADMIN', 'FINANCE_ADMIN')
         and exists (select 1 from contracts c where c.id = contract_id and auth_has_division(c.division)));

-- 7. Documents and org units
create policy documents_read on documents for select to authenticated
  using (auth_role() = 'MASTER_ADMIN'
         or (auth_role() = 'UNIT_ADMIN' and auth_has_division(division))
         or (auth_role() = 'FINANCE_ADMIN' and doc_type = 'invoice'));
create policy documents_write on documents for all to authenticated
  using (auth_role() = 'MASTER_ADMIN'
         or (auth_role() = 'UNIT_ADMIN' and auth_has_division(division))
         or (auth_role() = 'FINANCE_ADMIN' and doc_type = 'invoice'))
  with check (auth_role() = 'MASTER_ADMIN'
         or (auth_role() = 'UNIT_ADMIN' and auth_has_division(division))
         or (auth_role() = 'FINANCE_ADMIN' and doc_type = 'invoice'));

create policy org_units_read on org_units for select to authenticated
  using (auth_role() = 'MASTER_ADMIN' or (auth_role() = 'UNIT_ADMIN' and auth_has_division(division)));
create policy org_units_write on org_units for all to authenticated
  using (auth_role() = 'MASTER_ADMIN') with check (auth_role() = 'MASTER_ADMIN');

-- 8. Incentives and payout: MASTER_ADMIN only
do $do$
declare t text;
begin
  foreach t in array array[
    'rule_sets', 'rule_components', 'role_allocations', 'role_allocation_adjustments',
    'role_allocation_lines', 'warranty_deductions'
  ] loop
    execute format('create policy %I on %I for all to authenticated using (auth_role() = ''MASTER_ADMIN'') with check (auth_role() = ''MASTER_ADMIN'')', t || '_master', t);
  end loop;
end $do$;

create policy rule_approvals_read on rule_set_approvals for select to authenticated
  using (auth_role() = 'MASTER_ADMIN');
create policy rule_approvals_insert on rule_set_approvals for insert to authenticated
  with check (profile_id = auth.uid() and auth_role() = 'MASTER_ADMIN' and auth_is_founder());

-- 9. Audit
create policy audit_read on audit_log for select to authenticated
  using (auth_role() = 'MASTER_ADMIN');

-- 10. MASTER_ADMIN can only be granted or removed outside the app
create or replace function tg_profile_role_guard() returns trigger language plpgsql as $$
begin
  if auth.uid() is not null then
    if tg_op = 'INSERT' and new.role = 'MASTER_ADMIN' then
      raise exception 'MASTER_ADMIN can only be created from the Supabase dashboard';
    end if;
    if tg_op = 'UPDATE' and new.role is distinct from old.role
       and (old.role = 'MASTER_ADMIN' or new.role = 'MASTER_ADMIN') then
      raise exception 'MASTER_ADMIN can only be changed from the Supabase dashboard';
    end if;
  end if;
  return new;
end $$;
create trigger profiles_role_guard before insert or update on profiles
  for each row execute function tg_profile_role_guard();

-- 11. Unit roles belong to exactly one of BBT or BBM
create or replace function tg_pdiv_guard() returns trigger language plpgsql as $$
declare r app_role;
begin
  select role into r from profiles where id = new.profile_id;
  if r in ('UNIT_ADMIN', 'UNIT_MEMBER') then
    if new.division = 'bba' then
      raise exception 'Unit roles belong to BBT or BBM only';
    end if;
    if exists (select 1 from profile_divisions
               where profile_id = new.profile_id and division <> new.division) then
      raise exception 'Unit roles belong to exactly one division';
    end if;
  end if;
  return new;
end $$;
create trigger profile_divisions_guard before insert on profile_divisions
  for each row execute function tg_pdiv_guard();