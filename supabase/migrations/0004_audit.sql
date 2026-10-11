create table audit_log (
  id bigint generated always as identity primary key,
  occurred_at timestamptz not null default now(),
  actor uuid,
  action text not null,
  table_name text not null,
  row_id text,
  old_data jsonb,
  new_data jsonb,
  prev_hash text,
  row_hash text
);

create or replace function tg_audit() returns trigger language plpgsql security definer set search_path = public as $$
declare v_prev text; v_row jsonb; v_id text; v_hash text; v_ts timestamptz := now();
begin
  v_row := case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end;
  v_id := coalesce(v_row ->> 'id', v_row ->> 'rule_set_id');
  select row_hash into v_prev from audit_log order by id desc limit 1;
  v_hash := encode(digest(
    coalesce(v_prev, '') || v_ts::text || coalesce(auth.uid()::text, '') || tg_op || tg_table_name ||
    coalesce(v_id, '') || coalesce(to_jsonb(old)::text, '') || coalesce(to_jsonb(new)::text, ''),
    'sha256'), 'hex');
  insert into audit_log (occurred_at, actor, action, table_name, row_id, old_data, new_data, prev_hash, row_hash)
  values (v_ts, auth.uid(), tg_op, tg_table_name, v_id,
    case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) end,
    case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) end,
    v_prev, v_hash);
  return coalesce(new, old);
end $$;

create or replace function tg_audit_immutable() returns trigger language plpgsql as $$
begin
  raise exception 'audit_log is append-only';
end $$;
create trigger audit_no_update before update or delete on audit_log
  for each row execute function tg_audit_immutable();
create trigger audit_no_truncate before truncate on audit_log
  for each statement execute function tg_audit_immutable();

do $$
declare t text;
begin
  foreach t in array array[
    'profiles', 'profile_divisions', 'clients', 'contracts', 'projects', 'receipts', 'expenses',
    'documents', 'org_units', 'rule_sets', 'rule_components', 'rule_set_approvals',
    'role_allocations', 'role_allocation_adjustments', 'role_allocation_lines', 'warranty_deductions'
  ] loop
    execute format('create trigger audit_%I after insert or update or delete on %I for each row execute function tg_audit()', t, t);
  end loop;
end $$;
