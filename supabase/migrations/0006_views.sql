create view v_contract_finance with (security_invoker = true) as
select c.id, c.reference, c.title, c.division, cl.name as client_name, c.status, c.kind,
  c.net_value,
  coalesce(sum(r.amount_net), 0) as received,
  c.net_value - coalesce(sum(r.amount_net), 0) as outstanding
from contracts c
join clients cl on cl.id = c.client_id
left join receipts r on r.contract_id = c.id
group by c.id, cl.name;

create view v_project_list with (security_invoker = true) as
select p.id, p.name, p.division, p.status, c.reference as contract_reference,
  cl.name as client_name, p.handed_over_on, p.warranty_ends_on
from projects p
join contracts c on c.id = p.contract_id
join clients cl on cl.id = c.client_id;

create view v_receipt_list with (security_invoker = true) as
select r.id, r.received_on, r.amount_net, r.invoice_ref, c.reference as contract_reference, c.division
from receipts r join contracts c on c.id = r.contract_id;

create view v_people with (security_invoker = true) as
select p.id, p.full_name, p.role, p.is_founder, p.title, p.active,
  coalesce((select string_agg(d.division::text, ', ' order by d.division) from profile_divisions d where d.profile_id = p.id), '') as divisions
from profiles p;

create view v_audit_recent with (security_invoker = true) as
select a.id, a.occurred_at, a.action, a.table_name, a.row_id, coalesce(p.full_name, 'system') as actor_name
from audit_log a left join profiles p on p.id = a.actor
order by a.id desc
limit 500;

create or replace function dashboard_overview()
returns table (
  division division, active_contracts bigint, net_contracted numeric, received numeric,
  outstanding numeric, active_clients bigint, active_projects bigint, expenses numeric
)
language sql stable security invoker as $$
  select d.division,
    (select count(*) from contracts c where c.division = d.division and c.status = 'active'),
    (select coalesce(sum(c.net_value), 0) from contracts c where c.division = d.division and c.status in ('active', 'completed')),
    (select coalesce(sum(f.received), 0) from v_contract_finance f where f.division = d.division and f.status in ('active', 'completed')),
    (select coalesce(sum(f.outstanding), 0) from v_contract_finance f where f.division = d.division and f.status in ('active', 'completed')),
    (select count(*) from clients cl where cl.division = d.division and cl.status = 'active'),
    (select count(*) from projects p where p.division = d.division and p.status in ('active', 'handed_over', 'warranty')),
    (select coalesce(sum(e.amount), 0) from expenses e where e.division = d.division)
  from (select unnest(enum_range(null::division)) as division) d
  where auth_has_division(d.division)
$$;

grant select on v_contract_finance, v_project_list, v_receipt_list, v_people, v_audit_recent to authenticated;
