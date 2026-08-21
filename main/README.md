# GeMUNi

AI-powered, source-backed research platform for Model United Nations delegates.

GeMUNi produces research reports tailored to a delegate's **country**, **committee**, and **agenda** — with every claim traced to validated sources.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js Route Handlers (`/api/v1/*`), service-layer architecture
- **Database**: Supabase PostgreSQL + pgvector (migrations in `supabase/`)
- **Research pipeline**: Tavily retrieval → source ranking → extraction → chunking → embeddings → grounded LLM generation → citation validation
- **LLM providers**: Gemini / Kimi / OpenRouter via a provider abstraction with tier-based failover
- **Jobs**: Inngest-style durable workflow events

## Getting Started

```bash
pnpm install
cp .env.example .env.local   # placeholder keys work in mock mode
pnpm dev                     # http://localhost:3000
```

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the development server |
| `pnpm build` | Production build |
| `pnpm start` | Run the production build |
| `pnpm typecheck` | TypeScript check |
| `pnpm test` | Run unit tests (vitest) |

## Project Structure

```
src/
├── app/                  # App Router pages + /api/v1 route handlers
│   ├── dashboard/        # User workspace: usage, tiers, projects
│   ├── research/         # Research wizard, progress, report viewer
│   └── api/v1/           # auth, catalog, research, projects, account APIs
├── components/ui/        # UI primitives (button, card, input, scroll-area)
├── lib/                  # env config, entitlements, data client
├── services/             # Tavily retrieval, LLM providers, citation validation,
│                         # RAG pipeline, URL safety (SSRF protection)
└── types/shared.ts       # Canonical Zod schemas + TypeScript contracts
supabase/                 # SQL migrations (users, catalog, research, vectors)
```

## Core Principles

1. **Never fake functionality.** If a provider key is not configured, the system degrades honestly rather than inventing responses.
2. **Grounded generation.** The LLM receives only retrieved evidence; unsupported citations are rejected before reaching the user.
3. **Server-side authorization.** Ownership and quotas are enforced deterministically — never by the LLM or the client.
4. **SSRF-safe fetching.** All external URLs are validated against private ranges, loopback, and metadata endpoints before server-side fetches.

## Environment

All API keys are placeholders in `.env.example`. Provide real values in `.env.local` for live provider access. See `.env.example` for the full list (Tavily, Gemini, Kimi, OpenRouter, OpenAI embeddings, Supabase, Clerk, Inngest).
