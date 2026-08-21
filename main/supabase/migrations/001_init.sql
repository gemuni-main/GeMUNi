-- GeMUNi backend schema (replaces Prisma)

create extension if not exists vector;

create table users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text,
  password_hash text not null,
  email_verified_at timestamptz,
  verification_token text,
  reset_token text,
  reset_expires_at timestamptz,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create table sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  refresh_token_hash text not null unique,
  expires_at timestamptz not null,
  ip text,
  user_agent text,
  created_at timestamptz not null default now()
);
create index sessions_user_id_idx on sessions(user_id);
create index sessions_expires_at_idx on sessions(expires_at);

create table countries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  official_name text,
  iso_code text unique,
  region text,
  aliases text[] not null default '{}',
  un_member_status text not null default 'UN Member',
  metadata jsonb not null default '{}'
);

create table committees (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  abbreviation text,
  description text,
  type text,
  mandate text,
  powers text[] not null default '{}',
  typical_topics text[] not null default '{}',
  procedural_rules text
);

create table agendas (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  committee_id uuid references committees(id) on delete set null,
  keywords text[] not null default '{}',
  relevant_treaties text[] not null default '{}',
  relevant_un_bodies text[] not null default '{}'
);
create index agendas_committee_id_idx on agendas(committee_id);

create table custom_committees (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  name text not null,
  abbreviation text,
  description text,
  type text,
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

create table custom_agendas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  committee_id uuid,
  title text not null,
  description text,
  keywords text[] not null default '{}',
  created_at timestamptz not null default now(),
  unique (user_id, title)
);

create table conferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  name text not null,
  date date,
  location text,
  committee_id uuid,
  agenda_id uuid,
  assigned_country_id uuid,
  rules text,
  custom_information jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table research_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  name text not null,
  country_id uuid,
  committee_id uuid,
  agenda_id uuid,
  conference_id uuid,
  created_at timestamptz not null default now()
);
create index research_projects_user_id_idx on research_projects(user_id);

create table sources (
  id uuid primary key default gen_random_uuid(),
  domain text not null unique,
  organization text,
  source_type text,
  reliability_tier text check (reliability_tier in ('A','B','C')),
  country text,
  language text,
  is_allowed boolean not null default true,
  metadata jsonb not null default '{}'
);

create table documents (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references research_projects(id) on delete set null,
  url text not null,
  title text,
  organization text,
  source_type text,
  reliability text check (reliability in ('A','B','C')),
  language text,
  published_at timestamptz,
  content_hash text,
  created_at timestamptz not null default now()
);
create index documents_project_id_idx on documents(project_id);

create table document_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references documents(id) on delete cascade,
  project_id uuid not null references research_projects(id) on delete cascade,
  content text not null,
  chunk_index int not null default 0,
  reliability text check (reliability in ('A','B','C')),
  embedding vector(1536),
  created_at timestamptz not null default now()
);
create index document_chunks_embedding_idx on document_chunks using hnsw (embedding vector_cosine_ops);
create index document_chunks_project_id_idx on document_chunks(project_id);

create table research_items (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references research_projects(id) on delete cascade,
  task_type text not null,
  request_payload jsonb not null default '{}',
  response jsonb,
  model_used text,
  status text not null default 'queued'
    check (status in ('queued','planning','retrieving','generating','validating','completed','failed')),
  error text,
  created_at timestamptz not null default now()
);
create index research_items_project_id_idx on research_items(project_id);
create index research_items_status_idx on research_items(status);

create table report_sections (
  id uuid primary key default gen_random_uuid(),
  research_item_id uuid not null references research_items(id) on delete cascade,
  section_type text,
  title text,
  content text not null,
  order_index int not null default 0,
  created_at timestamptz not null default now()
);
create index report_sections_item_id_idx on report_sections(research_item_id);

create table citations (
  id uuid primary key default gen_random_uuid(),
  section_id uuid references report_sections(id) on delete cascade,
  research_item_id uuid not null references research_items(id) on delete cascade,
  claim text not null,
  url text,
  title text,
  organization text,
  publication_date timestamptz,
  page int,
  validated boolean not null default false,
  created_at timestamptz not null default now()
);
create index citations_item_id_idx on citations(research_item_id);

create table plans (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  tier text not null check (tier in ('free','plus','pro')),
  daily_research_limit int not null,
  monthly_token_budget bigint not null,
  price_usd numeric(10,2) not null default 0
);

create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references users(id) on delete cascade,
  plan_id uuid not null references plans(id),
  status text not null default 'active',
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  created_at timestamptz not null default now()
);

create table usage_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  feature text not null,
  model text,
  input_tokens int not null default 0,
  output_tokens int not null default 0,
  estimated_cost numeric(12,6) not null default 0,
  tier text,
  created_at timestamptz not null default now()
);
create index usage_events_user_created_idx on usage_events(user_id, created_at);

create or replace function match_chunks(
  query_embedding vector(1536),
  match_count int,
  p_project_id uuid
)
returns table (
  id uuid, content text, url text, title text, organization text,
  reliability text, published_at timestamptz, similarity float
)
language sql stable as $$
  select dc.id, dc.content, d.url, d.title, d.organization,
         dc.reliability, d.published_at,
         1 - (dc.embedding <=> query_embedding) as similarity
  from document_chunks dc
  join documents d on d.id = dc.document_id
  where dc.project_id = p_project_id
  order by dc.embedding <=> query_embedding
  limit match_count;
$$;