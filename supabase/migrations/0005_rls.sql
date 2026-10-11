create or replace function auth_role() returns app_role language sql stable security definer set search_path = public as $$
  select role from profiles where id = auth.uid() and active
$$;
create or replace function auth_is_founder() returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select is_founder from profiles where id = auth.uid() and active), false)
$$;
create or replace function auth_has_division(d division) returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from profile_divisions where profile_id = auth.uid() and division = d)
    or d = 'bba' and auth_role() is not null
$$;
create or replace function auth_aal2() returns boolean language sql stable as $$
  select coalesce(auth.jwt() ->> 'aal', '') = 'aal2'
$$;

do $$
declare t text;
begin
  foreach t in array array[
    'profiles', 'profile_divisions', 'clients', 'contracts', 'projects', 'receipts', 'expenses',
    'documents', 'org_units', 'rule_sets', 'rule_components', 'rule_set_approvals',
    'role_allocations', 'role_allocation_adjustments', 'role_allocation_lines',
    'warranty_deductions', 'audit_log'
  ] loop
    execute format('alter table %I enable row level security', t);
    execute format('create policy mfa_required on %I as restrictive for all to authenticated using (auth_aal2()) with check (auth_aal2())', t);
  end loop;
end $$;

create policy profiles_read on profiles for select to authenticated using (auth_role() is not null);
create policy profiles_write on profiles for all to authenticated
  using (auth_role() = 'founder_ceo') with check (auth_role() = 'founder_ceo');
create policy pdiv_read on profile_divisions for select to authenticated using (auth_role() is not null);
create policy pdiv_write on profile_divisions for all to authenticated
  using (auth_role() = 'founder_ceo') with check (auth_role() = 'founder_ceo');

do $$
declare t text;
begin
  foreach t in array array['clients', 'contracts', 'projects', 'expenses', 'documents', 'org_units'] loop
    execute format('create policy %I_read on %I for select to authenticated using (auth_has_division(division))', t, t);
    execute format('create policy %I_write on %I for all to authenticated using (auth_role() in (''founder_ceo'', ''partner_director'') and auth_has_division(division)) with check (auth_role() in (''founder_ceo'', ''partner_director'') and auth_has_division(division))', t, t);
  end loop;
end $$;

create policy receipts_read on receipts for select to authenticated
  using (exists (select 1 from contracts c where c.id = contract_id and auth_has_division(c.division)));
create policy receipts_write on receipts for all to authenticated
  using (auth_role() = 'founder_ceo' and exists (select 1 from contracts c where c.id = contract_id and auth_has_division(c.division)))
  with check (auth_role() = 'founder_ceo' and exists (select 1 from contracts c where c.id = contract_id and auth_has_division(c.division)));

create policy rule_sets_read on rule_sets for select to authenticated using (auth_role() in ('founder_ceo', 'partner_director'));
create policy rule_sets_write on rule_sets for all to authenticated
  using (auth_role() = 'founder_ceo') with check (auth_role() = 'founder_ceo');
create policy rule_components_read on rule_components for select to authenticated using (auth_role() in ('founder_ceo', 'partner_director'));
create policy rule_components_write on rule_components for all to authenticated
  using (auth_role() = 'founder_ceo') with check (auth_role() = 'founder_ceo');
create policy rule_approvals_read on rule_set_approvals for select to authenticated using (auth_role() in ('founder_ceo', 'partner_director'));
create policy rule_approvals_insert on rule_set_approvals for insert to authenticated
  with check (profile_id = auth.uid() and auth_is_founder());

create policy alloc_read on role_allocations for select to authenticated using (auth_is_founder());
create policy alloc_write on role_allocations for all to authenticated
  using (auth_is_founder()) with check (auth_is_founder());
create policy alloc_lines_read on role_allocation_lines for select to authenticated using (auth_is_founder());
create policy alloc_lines_write on role_allocation_lines for all to authenticated
  using (auth_is_founder()) with check (auth_is_founder());
create policy alloc_adj_read on role_allocation_adjustments for select to authenticated using (auth_is_founder());
create policy alloc_adj_write on role_allocation_adjustments for all to authenticated
  using (auth_is_founder()) with check (auth_is_founder());
create policy warranty_read on warranty_deductions for select to authenticated using (auth_is_founder());
create policy warranty_write on warranty_deductions for all to authenticated
  using (auth_role() = 'founder_ceo') with check (auth_role() = 'founder_ceo');

create policy audit_read on audit_log for select to authenticated using (auth_role() = 'founder_ceo');

revoke all on audit_log from authenticated;
grant select on audit_log to authenticated;
grant usage on all sequences in schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
revoke insert, update, delete, truncate on audit_log from authenticated;
