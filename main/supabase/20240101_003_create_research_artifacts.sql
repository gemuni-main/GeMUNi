-- Migration 003: Research artifacts — sources, chunks (pgvector), citations, chat, usage, tokens
-- user_id is denormalized onto artifact tables so RLS can enforce isolation directly.

create table if not exists public.sources (
  id uuid primary key default gen_random_uuid(),
  research_item_id uuid not null references public.research_items(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  url text not null,
  publisher text,
  tier text not null check (tier in ('UN', 'OFFICIAL', 'IO', 'NGO', 'ACADEMIC', 'MEDIA', 'OTHER')),
  relevance_score double precision not null default 0,
  retrieved_at timestamptz not null default now(),
  content_hash text,
  raw_content text,
  created_at timestamptz not null default now(),
  unique (research_item_id, url)
);

create table if not exists public.source_chunks (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.sources(id) on delete cascade,
  chunk_index integer not null,
  text text not null,
  token_estimate integer not null,
  title text,
  url text,
  publisher text,
  reliability_tier text,
  embedding vector(1536),
  created_at timestamptz not null default now(),
  unique (source_id, chunk_index)
);

create table if not exists public.citations (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  claim text not null,
  source_id uuid references public.sources(id) on delete set null,
  source_tier text not null,
  status text not null default 'UNCERTAIN'
    check (status in ('VALID', 'INVALID', 'PARTIAL', 'UNCERTAIN')),
  evidence_excerpt text,
  confidence double precision,
  created_at timestamptz not null default now()
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  citations jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.usage_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  research_item_id uuid references public.research_items(id) on delete set null,
  model text not null,
  task text,
  input_tokens integer not null default 0,
  output_tokens integer not null default 0,
  total_tokens integer not null default 0,
  estimated_cost double precision not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.refresh_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  revoked boolean not null default false,
  created_at timestamptz not null default now()
);