begin;

insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-0000000000a1', 't0-master@test.local'),
  ('00000000-0000-0000-0000-0000000000a2', 't0-bbt-admin@test.local'),
  ('00000000-0000-0000-0000-0000000000a3', 't0-bbm-admin@test.local'),
  ('00000000-0000-0000-0000-0000000000a4', 't0-finance@test.local'),
  ('00000000-0000-0000-0000-0000000000a5', 't0-bbt-member@test.local');

insert into profiles (id, full_name, role) values
  ('00000000-0000-0000-0000-0000000000a1', 'T0 Master', 'MASTER_ADMIN'),
  ('00000000-0000-0000-0000-0000000000a2', 'T0 BBT Admin', 'UNIT_ADMIN'),
  ('00000000-0000-0000-0000-0000000000a3', 'T0 BBM Admin', 'UNIT_ADMIN'),
  ('00000000-0000-0000-0000-0000000000a4', 'T0 Finance', 'FINANCE_ADMIN'),
  ('00000000-0000-0000-0000-0000000000a5', 'T0 BBT Member', 'UNIT_MEMBER');

insert into profile_divisions (profile_id, division) values
  ('00000000-0000-0000-0000-0000000000a2', 'bbt'),
  ('00000000-0000-0000-0000-0000000000a3', 'bbm'),
  ('00000000-0000-0000-0000-0000000000a5', 'bbt');

insert into clients (id, division, name, segment) values
  ('00000000-0000-0000-0000-0000000000c1', 'bbt', 'T0 Client BBT', 'corporate'),
  ('00000000-0000-0000-0000-0000000000c2', 'bbm', 'T0 Client BBM', 'corporate');

insert into contracts (id, client_id, division, reference, title, gross_value) values
  ('00000000-0000-0000-0000-0000000000d1', '00000000-0000-0000-0000-0000000000c1', 'bbt', 'T0-BBT-1', 'T0 contract bbt', 1000000),
  ('00000000-0000-0000-0000-0000000000d2', '00000000-0000-0000-0000-0000000000c2', 'bbm', 'T0-BBM-1', 'T0 contract bbm', 1000000);

insert into projects (contract_id, division, name) values
  ('00000000-0000-0000-0000-0000000000d1', 'bbt', 'T0 Project BBT'),
  ('00000000-0000-0000-0000-0000000000d2', 'bbm', 'T0 Project BBM');

insert into receipts (contract_id, amount_net, received_on, invoice_ref) values
  ('00000000-0000-0000-0000-0000000000d1', 100, current_date, 'T0-INV-1'),
  ('00000000-0000-0000-0000-0000000000d2', 100, current_date, 'T0-INV-2');

insert into expenses (division, category, description, amount, incurred_on) values
  ('bbt', 'tools', 'T0 exp bbt', 1000, current_date),
  ('bbm', 'tools', 'T0 exp bbm', 1000, current_date),
  ('bba', 'tools', 'T0 exp bba', 1000, current_date);

insert into documents (division, doc_type, title, external_url) values
  ('bbt', 'invoice', 'T0 doc invoice', 'https://example.com/a'),
  ('bbt', 'proposal', 'T0 doc proposal', 'https://example.com/b');

insert into rule_sets (division, version, source_document) values ('bbt', 'T0', 'T0-GOV');

-- Helper: counts visible fixture rows as a given user (aal2)
create function pg_temp.check_as(p_user uuid, p_label text, p_expected int[]) returns void
language plpgsql as $$
declare
  tbl text[] := array['clients','contracts','projects','receipts','expenses','documents','rule_sets','profiles','audit_log'];
  flt text[] := array[
    'name like ''T0 %''', 'reference like ''T0-%''', 'name like ''T0 %''',
    'invoice_ref like ''T0-%''', 'description like ''T0 %''', 'title like ''T0 %''',
    'source_document = ''T0-GOV''', 'full_name like ''T0 %''',
    'table_name = ''clients'' and new_data ->> ''name'' like ''T0 %'''
  ];
  i int; n int; got int[] := '{}';
begin
  perform set_config('request.jwt.claims',
    json_build_object('sub', p_user, 'role', 'authenticated', 'aal', 'aal2')::text, true);
  set local role authenticated;
  for i in 1..array_length(tbl, 1) loop
    execute format('select count(*) from %I where %s', tbl[i], flt[i]) into n;
    got := got || n;
  end loop;
  reset role;
  assert got = p_expected, format('%s: expected %s got %s', p_label, p_expected, got);
end $$;

-- order: clients, contracts, projects, receipts, expenses, documents, rule_sets, profiles, audit
select pg_temp.check_as('00000000-0000-0000-0000-0000000000a1', 'master',    array[2,2,2,2,3,2,1,5,2]);
select pg_temp.check_as('00000000-0000-0000-0000-0000000000a2', 'bbt admin', array[1,1,1,1,1,2,0,2,0]);
select pg_temp.check_as('00000000-0000-0000-0000-0000000000a3', 'bbm admin', array[1,1,1,1,1,0,0,1,0]);
select pg_temp.check_as('00000000-0000-0000-0000-0000000000a4', 'finance',   array[2,2,2,2,3,1,0,1,0]);
select pg_temp.check_as('00000000-0000-0000-0000-0000000000a5', 'bbt member',array[0,0,0,0,0,0,0,1,0]);

-- MFA: master without aal2 sees nothing
do $do$
declare n int;
begin
  perform set_config('request.jwt.claims',
    json_build_object('sub', '00000000-0000-0000-0000-0000000000a1', 'role', 'authenticated', 'aal', 'aal1')::text, true);
  set local role authenticated;
  select count(*) into n from clients where name like 'T0 %';
  reset role;
  assert n = 0, 'aal1 session must see no rows';
end $do$;

-- UNIT_ADMIN cannot insert receipts
do $do$
declare denied boolean := false;
begin
  perform set_config('request.jwt.claims',
    json_build_object('sub', '00000000-0000-0000-0000-0000000000a2', 'role', 'authenticated', 'aal', 'aal2')::text, true);
  set local role authenticated;
  begin
    insert into receipts (contract_id, amount_net, received_on)
    values ('00000000-0000-0000-0000-0000000000d1', 1, current_date);
  exception when insufficient_privilege then denied := true;
  end;
  reset role;
  assert denied, 'unit admin must not insert receipts';
end $do$;

-- UNIT_ADMIN cannot create a client in the other division
do $do$
declare denied boolean := false;
begin
  perform set_config('request.jwt.claims',
    json_build_object('sub', '00000000-0000-0000-0000-0000000000a2', 'role', 'authenticated', 'aal', 'aal2')::text, true);
  set local role authenticated;
  begin
    insert into clients (division, name, segment) values ('bbm', 'T0 Illegal', 'corporate');
  exception when insufficient_privilege then denied := true;
  end;
  reset role;
  assert denied, 'unit admin must not write to another division';
end $do$;

-- FINANCE_ADMIN can insert receipts
do $do$
begin
  perform set_config('request.jwt.claims',
    json_build_object('sub', '00000000-0000-0000-0000-0000000000a4', 'role', 'authenticated', 'aal', 'aal2')::text, true);
  set local role authenticated;
  insert into receipts (contract_id, amount_net, received_on)
  values ('00000000-0000-0000-0000-0000000000d1', 1, current_date);
  reset role;
end $do$;

-- UNIT_MEMBER cannot update contracts (0 rows affected)
do $do$
declare n int;
begin
  perform set_config('request.jwt.claims',
    json_build_object('sub', '00000000-0000-0000-0000-0000000000a5', 'role', 'authenticated', 'aal', 'aal2')::text, true);
  set local role authenticated;
  update contracts set title = 'T0 hacked' where reference like 'T0-%';
  get diagnostics n = row_count;
  reset role;
  assert n = 0, 'unit member must not update contracts';
end $do$;

-- Even MASTER_ADMIN cannot grant MASTER_ADMIN from the app
do $do$
declare blocked boolean := false;
begin
  perform set_config('request.jwt.claims',
    json_build_object('sub', '00000000-0000-0000-0000-0000000000a1', 'role', 'authenticated', 'aal', 'aal2')::text, true);
  set local role authenticated;
  begin
    update profiles set role = 'MASTER_ADMIN' where id = '00000000-0000-0000-0000-0000000000a3';
  exception when raise_exception then blocked := true;
  end;
  reset role;
  assert blocked, 'MASTER_ADMIN grant from the app must be blocked';
end $do$;

select 'RLS stage 0 tests passed' as result;
rollback;