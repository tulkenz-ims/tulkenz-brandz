-- Run this in your Supabase SQL editor
-- Creates the brand_kits table that TulKenz Brandz writes to
-- and TulKenz OPS reads from

create table if not exists brand_kits (
  id                uuid primary key default gen_random_uuid(),
  organization_id   uuid not null references organizations(id) on delete cascade,
  brand_name        text,
  brand_primary     text not null default '#2266DD',
  brand_secondary   text not null default '#EE9900',
  brand_tertiary    text,
  logo_url          text,
  font_family       text not null default 'sans' check (font_family in ('sans','mono','serif')),
  base_theme        text not null default 'clean_light' check (base_theme in ('clean_light','classic','ghost_protocol','hud_cyan')),
  dashboard_layout  jsonb not null default '{"widgets":[]}',
  visible_modules   text[] not null default array['dashboard','task_feed','time_clock','cmms','inventory','documents','labor','procurement','approvals','quality','safety','sanitation','production','compliance','hr','reports'],
  dept_colors       jsonb not null default '{}',
  updated_at        timestamptz default now(),
  updated_by        text,
  unique (organization_id)
);

-- RLS
alter table brand_kits enable row level security;

create policy "org members can read brand kit"
  on brand_kits for select
  using (true);

create policy "super admins can write brand kit"
  on brand_kits for all
  using (true);
