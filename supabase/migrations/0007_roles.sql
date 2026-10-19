alter type app_role rename value 'founder_ceo' to 'MASTER_ADMIN';
alter type app_role rename value 'partner_director' to 'UNIT_ADMIN';
alter type app_role rename value 'senior_staff' to 'UNIT_MEMBER';
alter type app_role add value if not exists 'FINANCE_ADMIN';