-- ============================================================
-- Pulse CRM — Database Schema
-- Run this once in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ─── Subscriptions ───────────────────────────────────────────────────────────
create table if not exists subscriptions (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references auth.users(id) on delete cascade,
  plan               text not null default 'free',
  status             text not null default 'trialing',
  ls_subscription_id text,
  ls_variant_id      text,
  renews_at          timestamptz,
  trial_ends_at      timestamptz default (now() + interval '14 days'),
  updated_at         timestamptz not null default now(),
  unique(user_id)
);

alter table subscriptions enable row level security;

create policy "sub_owner" on subscriptions
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ─── Workspaces ──────────────────────────────────────────────
create table if not exists workspaces (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null references auth.users(id) on delete cascade,
  name       text not null default 'My Workspace',
  created_at timestamptz not null default now()
);

-- ─── Team members ─────────────────────────────────────────────
create table if not exists team_members (
  id           uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  name         text not null,
  initials     text not null,
  role         text not null default '',
  color        text not null default '#534AB7',
  bg           text not null default '#EEEDFE',
  is_me        boolean not null default false,
  created_at   timestamptz not null default now()
);

-- ─── Contacts ─────────────────────────────────────────────────
create table if not exists contacts (
  id           uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  fname        text not null default '',
  lname        text not null default '',
  email        text not null default '',
  role         text not null default '',
  company      text not null default '',
  status       text not null default 'warm',
  value        text not null default '',
  phone        text not null default '',
  linkedin     text not null default '',
  tags         text[] not null default '{}',
  owner_id     uuid references team_members(id) on delete set null,
  color_idx    integer not null default 0,
  notes        text not null default '',
  custom_fields jsonb not null default '{}',
  created_at   timestamptz not null default now()
);

-- ─── Deals ────────────────────────────────────────────────────
create table if not exists deals (
  id           uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  title        text not null default '',
  company      text not null default '',
  value        text not null default '',
  prob         text not null default '35%',
  stage        text not null default 'Lead',
  owner_id     uuid references team_members(id) on delete set null,
  color_idx    integer not null default 0,
  history      jsonb not null default '[]',
  notes        text not null default '',
  custom_fields jsonb not null default '{}',
  close_date   date,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ─── Activity ─────────────────────────────────────────────────
create table if not exists activity (
  id           uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  color        text not null default '#185FA5',
  text         text not null,
  time         text not null default 'Just now',
  created_at   timestamptz not null default now()
);

-- ─── Row Level Security ───────────────────────────────────────
-- Users can only access data that belongs to their workspace

alter table workspaces    enable row level security;
alter table team_members  enable row level security;
alter table contacts      enable row level security;
alter table deals         enable row level security;
alter table activity      enable row level security;

-- Workspaces: owner only
create policy "workspace_owner" on workspaces
  for all using (owner_id = auth.uid());

-- Helper function: is the current user the owner of a given workspace?
create or replace function is_workspace_owner(ws_id uuid)
returns boolean language sql security definer as $$
  select exists (
    select 1 from workspaces where id = ws_id and owner_id = auth.uid()
  );
$$;

-- Team members: workspace owner only
create policy "team_workspace_owner" on team_members
  for all using (is_workspace_owner(workspace_id));

-- Contacts: workspace owner only
create policy "contacts_workspace_owner" on contacts
  for all using (is_workspace_owner(workspace_id));

-- Deals: workspace owner only
create policy "deals_workspace_owner" on deals
  for all using (is_workspace_owner(workspace_id));

-- Activity: workspace owner only
create policy "activity_workspace_owner" on activity
  for all using (is_workspace_owner(workspace_id));

-- ─── Indexes ──────────────────────────────────────────────────
create index if not exists contacts_workspace_id_idx on contacts(workspace_id);
create index if not exists deals_workspace_id_idx    on deals(workspace_id);
create index if not exists activity_workspace_id_idx on activity(workspace_id);
create index if not exists team_workspace_id_idx     on team_members(workspace_id);
