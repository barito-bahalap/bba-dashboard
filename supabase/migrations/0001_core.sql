create extension if not exists pgcrypto with schema extensions;

create type app_role as enum ('founder_ceo', 'partner_director', 'senior_staff');
create type division as enum ('bbt', 'bbm', 'bba');
create type contract_status as enum ('draft', 'active', 'completed', 'terminated');
create type project_status as enum ('planned', 'active', 'handed_over', 'warranty', 'closed');
create type doc_type as enum ('contract', 'invoice', 'proposal', 'policy', 'report', 'other');

create table profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text not null,
  role app_role not null default 'senior_staff',
  is_founder boolean not null default false,
  title text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table profile_divisions (
  profile_id uuid not null references profiles on delete cascade,
  division division not null,
  primary key (profile_id, division)
);

create table clients (
  id uuid primary key default gen_random_uuid(),
  division division not null check (division in ('bbt', 'bbm')),
  name text not null,
  segment text not null check (segment in ('bumn_bumd', 'government', 'corporate', 'organization', 'public_figure', 'other')),
  status text not null default 'prospect' check (status in ('prospect', 'active', 'inactive')),
  withholds_tax boolean not null default false,
  relationship_owner uuid references profiles,
  notes text,
  created_at timestamptz not null default now()
);

create table contracts (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients,
  division division not null check (division in ('bbt', 'bbm')),
  reference text not null unique,
  title text not null,
  kind text not null default 'project' check (kind in ('project', 'retainer')),
  gross_value numeric(16,0) not null check (gross_value >= 0),
  tax_withheld numeric(16,0) not null default 0 check (tax_withheld >= 0),
  net_value numeric(16,0) generated always as (gross_value - tax_withheld) stored,
  status contract_status not null default 'draft',
  signed_on date,
  starts_on date,
  ends_on date,
  created_at timestamptz not null default now(),
  check (tax_withheld <= gross_value)
);

create table projects (
  id uuid primary key default gen_random_uuid(),
  contract_id uuid not null references contracts,
  division division not null check (division in ('bbt', 'bbm')),
  name text not null,
  status project_status not null default 'planned',
  scope_photo_video boolean not null default true,
  handed_over_on date,
  warranty_ends_on date,
  created_at timestamptz not null default now()
);

create table receipts (
  id uuid primary key default gen_random_uuid(),
  contract_id uuid not null references contracts,
  amount_net numeric(16,0) not null check (amount_net > 0),
  received_on date not null,
  invoice_ref text,
  created_at timestamptz not null default now()
);

create table expenses (
  id uuid primary key default gen_random_uuid(),
  division division not null,
  category text not null check (category in ('tax_entity', 'infrastructure', 'tools', 'legal', 'operations', 'cogs', 'other')),
  description text not null,
  amount numeric(16,0) not null check (amount > 0),
  incurred_on date not null,
  created_at timestamptz not null default now()
);

create table documents (
  id uuid primary key default gen_random_uuid(),
  division division not null,
  doc_type doc_type not null default 'other',
  title text not null,
  reference_code text,
  external_url text not null,
  contract_id uuid references contracts,
  confidential boolean not null default true,
  created_at timestamptz not null default now()
);
comment on table documents is 'Reference only. No file content is stored in this database.';

create table org_units (
  id uuid primary key default gen_random_uuid(),
  division division not null,
  name text not null,
  lead_profile_id uuid references profiles
);
