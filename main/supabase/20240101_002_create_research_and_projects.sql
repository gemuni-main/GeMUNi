-- Migration 002: Core domain — projects, research items, reports

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  report_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.research_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  country_id text references public.catalog_countries(id) on delete set null,
  committee_id text references public.catalog_committees(id) on delete set null,
  agenda_id text references public.catalog_agendas(id) on delete set null,
  status text not null default 'queued'
    check (status in ('queued', 'running', 'partially_completed', 'completed', 'failed', 'cancelled')),
  config jsonb not null default '{}'::jsonb,
  source_count integer not null default 0,
  report_id uuid,
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  research_item_id uuid not null references public.research_items(id) on delete cascade,
  title text not null,
  status text not null default 'draft' check (status in ('draft', 'processing', 'completed', 'failed')),
  sections jsonb not null default '[]'::jsonb,
  citation_count integer not null default 0,
  source_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Resolve the circular reference (research_items.report_id -> reports.id)
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'fk_research_items_report'
  ) then
    alter table public.research_items
      add constraint fk_research_items_report
      foreign key (report_id) references public.reports(id) on delete set null;
  end if;
end $$;