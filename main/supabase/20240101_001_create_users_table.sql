-- Migration 001: Foundations — extensions, users, catalog
-- Applied via Supabase (project gbixpcbczbwdvndxdhnd)

create extension if not exists vector;

-- Users: extends Supabase auth.users with application profile + tiering
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  tier text not null default 'free' check (tier in ('free', 'plus', 'pro')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Catalog: canonical country/committee/agenda definitions (stable text IDs)
create table if not exists public.catalog_countries (
  id text primary key,
  name text not null,
  iso_code text not null unique,
  flag_emoji text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.catalog_committees (
  id text primary key,
  name text not null,
  acronym text not null unique,
  description text,
  difficulty text not null default 'beginner'
    check (difficulty in ('beginner', 'intermediate', 'advanced')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.catalog_agendas (
  id text primary key,
  title text not null,
  description text,
  committee_id text references public.catalog_committees(id) on delete set null,
  compatibility jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_catalog_countries_iso on public.catalog_countries(iso_code);
create index if not exists idx_catalog_agendas_committee on public.catalog_agendas(committee_id);