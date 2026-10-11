with bbt as (
  insert into rule_sets (division, version, status) values ('bbt', 'GOV-002 v1', 'draft') returning id
), bbm as (
  insert into rule_sets (division, version, status) values ('bbm', 'GOV-002 v1', 'draft') returning id
), t as (
  insert into rule_components (rule_set_id, code, label, kind, pct, min_net, max_net, scope_flag)
  select bbt.id, v.code, v.label, v.kind::component_kind, v.pct, v.min_net, v.max_net, null
  from bbt, (values
    ('BD_LOW',  'Business Development commission (below Rp10 million)', 'bd', 5, null::numeric, 10000000::numeric),
    ('BD_HIGH', 'Business Development commission (Rp10 million and above)', 'bd', 10, 10000000::numeric, null::numeric),
    ('DELIVERY_LEAD', 'Delivery Lead / System Architecture', 'oversight', 15, null, null),
    ('DEVELOPER', 'Developer', 'execution', 20, null, null),
    ('UIUX', 'UI/UX Design', 'execution', 15, null, null),
    ('QA_DEPLOY', 'QA and Deployment', 'execution', 10, null, null),
    ('MARGIN_LOW', 'Agency Margin (BBA)', 'margin', 35, null, 10000000),
    ('MARGIN_HIGH', 'Agency Margin (BBA)', 'margin', 30, 10000000, null)
  ) as v(code, label, kind, pct, min_net, max_net)
  returning 1
)
insert into rule_components (rule_set_id, code, label, kind, pct, scope_flag)
select bbm.id, v.code, v.label, v.kind::component_kind, v.pct, v.flag
from bbm, (values
  ('BD', 'Business Development / Broker commission', 'bd', 10, null),
  ('CREATIVE_LEAD', 'Creative Lead / Editorial Oversight', 'oversight', 10, null),
  ('WRITER', 'Lead Writer / Copywriter', 'execution', 20, null),
  ('MULTIMEDIA', 'Photographer / Videographer / Multimedia', 'execution', 20, 'photo_video'),
  ('FIELD', 'Interviewer / Field Coordinator', 'execution', 10, null),
  ('MARGIN', 'Agency Margin (BBA)', 'margin', 30, null)
) as v(code, label, kind, pct, flag);
