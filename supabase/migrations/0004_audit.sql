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

create or replace function audit_hash(
  p_prev text, p_at timestamptz, p_actor uuid, p_action text, p_table text,
  p_row_id text, p_old jsonb, p_new jsonb
) returns text language sql immutable as $$
  select encode(extensions.digest(
    coalesce(p_prev, '') || to_char(p_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US') ||
    coalesce(p_actor::text, '') || p_action || p_table || coalesce(p_row_id, '') ||
    coalesce(p_old::text, '') || coalesce(p_new::text, ''),
    'sha256'), 'hex')
$$;

create or replace function tg_audit() returns trigger language plpgsql security definer
set search_path = public, extensions as $$
declare
  v_prev text; v_old jsonb; v_new jsonb; v_row jsonb; v_id text; v_ts timestamptz := clock_timestamp();
begin
  perform pg_advisory_xact_lock(7001);
  if tg_op in ('UPDATE', 'DELETE') then v_old := to_jsonb(old); end if;
  if tg_op in ('INSERT', 'UPDATE') then v_new := to_jsonb(new); end if;
  v_row := coalesce(v_new, v_old);
  v_id := coalesce(v_row ->> 'id', v_row ->> 'rule_set_id');
  select row_hash into v_prev from audit_log order by id desc limit 1;
  insert into audit_log (occurred_at, actor, action, table_name, row_id, old_data, new_data, prev_hash, row_hash)
  values (v_ts, auth.uid(), tg_op, tg_table_name, v_id, v_old, v_new, v_prev,
    audit_hash(v_prev, v_ts, auth.uid(), tg_op, tg_table_name, v_id, v_old, v_new));
  if tg_op = 'DELETE' then return old; end if;
  return new;
end $$;

create or replace function tg_audit_immutable() returns trigger language plpgsql as $$
begin
  raise exception 'audit_log is append-only';
end $$;
create trigger audit_no_update before update or delete on audit_log
  for each row execute function tg_audit_immutable();
create trigger audit_no_truncate before truncate on audit_log
  for each statement execute function tg_audit_immutable();

create or replace function verify_audit_chain()
returns table (valid boolean, first_bad_id bigint)
language plpgsql stable as $$
declare r record; prev text := null; bad bigint;
begin
  for r in select * from audit_log order by id loop
    if r.prev_hash is distinct from prev
      or r.row_hash <> audit_hash(r.prev_hash, r.occurred_at, r.actor, r.action, r.table_name, r.row_id, r.old_data, r.new_data)
    then bad := r.id; exit; end if;
    prev := r.row_hash;
  end loop;
  return query select bad is null, bad;
end $$;

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
