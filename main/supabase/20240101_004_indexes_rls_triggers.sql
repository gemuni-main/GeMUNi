-- Migration 004: Indexes, RLS isolation, updated_at triggers

-- Performance indexes
create index if not exists idx_projects_user on public.projects(user_id);
create index if not exists idx_research_items_user on public.research_items(user_id);
create index if not exists idx_research_items_status on public.research_items(status);
create index if not exists idx_research_items_project on public.research_items(project_id);
create index if not exists idx_reports_user on public.reports(user_id);
create index if not exists idx_sources_research_item on public.sources(research_item_id);
create index if not exists idx_source_chunks_source on public.source_chunks(source_id);
create index if not exists idx_citations_report on public.citations(report_id);
create index if not exists idx_chat_messages_report on public.chat_messages(report_id);
create index if not exists idx_usage_records_user on public.usage_records(user_id);
create index if not exists idx_usage_records_created on public.usage_records(created_at);
create index if not exists idx_refresh_tokens_user on public.refresh_tokens(user_id);

-- Vector index for semantic retrieval (ivfflat, lists tuned for ~100k chunks)
create index if not exists idx_source_chunks_embedding
  on public.source_chunks using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- updated_at maintenance trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare
  t text;
begin
  foreach t in array array[
    'users', 'catalog_countries', 'catalog_committees', 'catalog_agendas',
    'projects', 'research_items', 'reports'
  ]
  loop
    execute format('drop trigger if exists trg_%s_updated_at on public.%I', t, t);
    execute format(
      'create trigger trg_%s_updated_at before update on public.%I
       for each row execute function public.set_updated_at()',
      t, t
    );
  end loop;
end $$;

-- Row Level Security: users may only see their own rows
alter table public.users enable row level security;
alter table public.projects enable row level security;
alter table public.research_items enable row level security;
alter table public.reports enable row level security;
alter table public.sources enable row level security;
alter table public.citations enable row level security;
alter table public.chat_messages enable row level security;
alter table public.usage_records enable row level security;

-- Catalog is world-readable; writes go through the service role only
alter table public.catalog_countries enable row level security;
alter table public.catalog_committees enable row level security;
alter table public.catalog_agendas enable row level security;

do $$
declare
  tbl text;
begin
  -- users table: keyed by id (extends auth.users)
  execute 'drop policy if exists "owner_all" on public.users';
  execute 'create policy "owner_all" on public.users
           for all using (auth.uid() = id) with check (auth.uid() = id)';

  -- Owner-only full access tables (keyed by user_id)
  foreach tbl in array array[
    'projects', 'research_items', 'reports',
    'sources', 'citations', 'chat_messages', 'usage_records'
  ]
  loop
    execute format('drop policy if exists "owner_all" on public.%I', tbl);
    execute format(
      'create policy "owner_all" on public.%I
       for all using (auth.uid() = user_id) with check (auth.uid() = user_id)',
      tbl
    );
  end loop;

  -- Catalog: readable by everyone, no client writes
  foreach tbl in array array['catalog_countries', 'catalog_committees', 'catalog_agendas']
  loop
    execute format('drop policy if exists "public_read" on public.%I', tbl);
    execute format(
      'create policy "public_read" on public.%I for select using (true)',
      tbl
    );
  end loop;
end $$;

-- source_chunks is service-role only (no direct client access)
alter table public.source_chunks enable row level security;

-- Refresh tokens: service role only, never exposed to clients
alter table public.refresh_tokens enable row level security;