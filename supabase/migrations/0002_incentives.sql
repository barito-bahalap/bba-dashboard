create type component_kind as enum ('bd', 'oversight', 'execution', 'margin');

create table rule_sets (
  id uuid primary key default gen_random_uuid(),
  division division not null check (division in ('bbt', 'bbm')),
  source_document text not null default 'BBA-GOV-002',
  version text not null,
  status text not null default 'draft' check (status in ('draft', 'approved', 'retired')),
  required_approvals int not null default 4,
  effective_from date,
  created_at timestamptz not null default now(),
  unique (division, version)
);

create table rule_components (
  id uuid primary key default gen_random_uuid(),
  rule_set_id uuid not null references rule_sets on delete cascade,
  code text not null,
  label text not null,
  kind component_kind not null,
  pct numeric(5,2) not null check (pct >= 0 and pct <= 100),
  min_net numeric(16,0),
  max_net numeric(16,0),
  scope_flag text,
  unique (rule_set_id, code, min_net)
);

create table rule_set_approvals (
  rule_set_id uuid not null references rule_sets on delete cascade,
  profile_id uuid not null references profiles,
  approved_at timestamptz not null default now(),
  primary key (rule_set_id, profile_id)
);

create table role_allocations (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null unique references projects,
  rule_set_id uuid not null references rule_sets,
  status text not null default 'draft' check (status in ('draft', 'agreed')),
  agreed_at timestamptz,
  created_at timestamptz not null default now()
);

create table role_allocation_adjustments (
  id uuid primary key default gen_random_uuid(),
  allocation_id uuid not null references role_allocations on delete cascade,
  from_code text not null,
  to_code text not null,
  pct numeric(5,2) not null check (pct > 0),
  reason text not null
);

create table role_allocation_lines (
  id uuid primary key default gen_random_uuid(),
  allocation_id uuid not null references role_allocations on delete cascade,
  component_code text not null,
  assignee_id uuid not null references profiles,
  share_pct numeric(5,2) not null default 100 check (share_pct > 0 and share_pct <= 100),
  initialed_at timestamptz
);

create table warranty_deductions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects,
  component_code text not null,
  amount numeric(16,0) not null check (amount > 0),
  reason text not null,
  created_at timestamptz not null default now()
);

create or replace function tg_rule_set_approve() returns trigger language plpgsql as $$
declare n int;
begin
  if new.status = 'approved' and old.status <> 'approved' then
    select count(distinct a.profile_id) into n
    from rule_set_approvals a join profiles p on p.id = a.profile_id and p.is_founder
    where a.rule_set_id = new.id;
    if n < new.required_approvals then
      raise exception 'Rule set requires % founder approvals, has %', new.required_approvals, n;
    end if;
  end if;
  return new;
end $$;
create trigger rule_sets_approve before update on rule_sets
  for each row execute function tg_rule_set_approve();

create or replace function tg_rule_set_lock() returns trigger language plpgsql as $$
declare st text; rid uuid;
begin
  if tg_op = 'DELETE' then rid := old.rule_set_id; else rid := new.rule_set_id; end if;
  select status into st from rule_sets where id = rid;
  if st = 'approved' then
    raise exception 'Approved rule sets are immutable. Create a new version.';
  end if;
  if tg_op = 'DELETE' then return old; end if;
  return new;
end $$;
create trigger rule_components_lock before insert or update or delete on rule_components
  for each row execute function tg_rule_set_lock();

create or replace function tg_allocation_lock() returns trigger language plpgsql as $$
declare st text; aid uuid;
begin
  if tg_op = 'DELETE' then aid := old.allocation_id; else aid := new.allocation_id; end if;
  select status into st from role_allocations where id = aid;
  if st = 'agreed' then
    raise exception 'Agreed role allocations are locked.';
  end if;
  if tg_op = 'DELETE' then return old; end if;
  return new;
end $$;
create trigger allocation_lines_lock before insert or update or delete on role_allocation_lines
  for each row execute function tg_allocation_lock();
create trigger allocation_adj_lock before insert or update or delete on role_allocation_adjustments
  for each row execute function tg_allocation_lock();

create or replace function tg_allocation_agree() returns trigger language plpgsql as $$
declare bad int;
begin
  if new.status = 'agreed' and old.status <> 'agreed' then
    select count(*) into bad from (
      select component_code from role_allocation_lines
      where allocation_id = new.id group by component_code having sum(share_pct) <> 100
    ) t;
    if bad > 0 then raise exception 'Every component needs shares summing to 100 percent.'; end if;
    if exists (select 1 from role_allocation_lines where allocation_id = new.id and initialed_at is null) then
      raise exception 'All assignees must initial before the allocation is agreed.';
    end if;
    new.agreed_at := now();
  end if;
  return new;
end $$;
create trigger role_allocations_agree before update on role_allocations
  for each row execute function tg_allocation_agree();

create or replace function net_pct(p_rule_set uuid, p_code text, p_net numeric) returns numeric
language sql stable as $$
  select pct from rule_components
  where rule_set_id = p_rule_set and code = p_code
    and (min_net is null or p_net >= min_net) and (max_net is null or p_net < max_net)
  limit 1
$$;

create or replace function compute_payout(p_project uuid)
returns table (
  component_code text, label text, kind component_kind, pct numeric,
  component_amount numeric, assignee_id uuid, share_pct numeric,
  gross_amount numeric, warranty_deduction numeric, payable_amount numeric
)
language plpgsql stable as $$
#variable_conflict use_column
declare
  v_net numeric; v_rule uuid; v_alloc uuid; v_photo boolean;
begin
  select c.net_value, a.rule_set_id, a.id, p.scope_photo_video
    into v_net, v_rule, v_alloc, v_photo
  from projects p
  join contracts c on c.id = p.contract_id
  join role_allocations a on a.project_id = p.id
  where p.id = p_project;
  if v_rule is null then raise exception 'No role allocation for project %', p_project; end if;

  return query
  with base as (
    select rc.code, rc.label, rc.kind, rc.pct
    from rule_components rc
    where rc.rule_set_id = v_rule
      and (rc.min_net is null or v_net >= rc.min_net)
      and (rc.max_net is null or v_net < rc.max_net)
  ),
  adj as (
    select code, sum(delta) as delta from (
      select to_code as code, pct as delta from role_allocation_adjustments where allocation_id = v_alloc
      union all
      select from_code, -pct from role_allocation_adjustments where allocation_id = v_alloc
    ) x group by code
  ),
  final as (
    select b.code, b.label, b.kind, b.pct + coalesce(a.delta, 0) as pct
    from base b left join adj a on a.code = b.code
  ),
  amounts as (
    select f.*,
      case when f.kind = 'margin' then 0 else round(v_net * f.pct / 100) end as amt
    from final f
  ),
  margin_fix as (
    select m.code, m.label, m.kind, m.pct,
      case when m.kind = 'margin'
        then v_net - (select coalesce(sum(amt), 0) from amounts where kind <> 'margin')
        else m.amt end as amt
    from amounts m
  ),
  lines as (
    select mf.*, l.assignee_id, l.share_pct
    from margin_fix mf left join role_allocation_lines l
      on l.allocation_id = v_alloc and l.component_code = mf.code
  ),
  ded as (
    select w.component_code, sum(w.amount) as total
    from warranty_deductions w where w.project_id = p_project group by w.component_code
  )
  select ln.code, ln.label, ln.kind, ln.pct, ln.amt, ln.assignee_id,
    coalesce(ln.share_pct, 100),
    round(ln.amt * coalesce(ln.share_pct, 100) / 100),
    case when ln.assignee_id is null then 0
      else round(coalesce(d.total, 0) * coalesce(ln.share_pct, 100) / 100) end,
    round(ln.amt * coalesce(ln.share_pct, 100) / 100)
      - case when ln.assignee_id is null then 0
        else round(coalesce(d.total, 0) * coalesce(ln.share_pct, 100) / 100) end
  from lines ln left join ded d on d.component_code = ln.code
  order by ln.kind, ln.code;
end $$;

create or replace function payout_status(p_project uuid)
returns table (net_value numeric, received numeric, settled boolean)
language sql stable as $$
  select c.net_value,
         coalesce((select sum(r.amount_net) from receipts r where r.contract_id = c.id), 0),
         coalesce((select sum(r.amount_net) from receipts r where r.contract_id = c.id), 0) >= c.net_value
  from projects p join contracts c on c.id = p.contract_id where p.id = p_project
$$;
