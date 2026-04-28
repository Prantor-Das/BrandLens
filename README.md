# BrandLens AI

BrandLens AI benchmarks how leading AI assistants talk about your brand versus competitors.

![Screenshot placeholder](https://placehold.co/1200x675/101828/F9FAFB?text=BrandLens+AI+Screenshot)

## Features

- Instant `Try demo` mode for judge-friendly walkthroughs
- Parallel AI brand analysis across OpenAI, Gemini, and Claude
- Score cards, radar charts, raw responses, and per-model breakdowns
- Actionable insights that translate AI visibility into positioning fixes
- Responsive landing and results experiences for desktop and mobile
- Dynamic result metadata and Open Graph report cards

## Local Setup

1. Install dependencies with `pnpm install`.
2. Copy `.env.example` to `.env`.
3. Fill in `DATABASE_URL` and any model API keys you want to enable.
4. Run `pnpm prisma:generate` and `pnpm prisma:push`.
5. Start the app with `pnpm dev`.

## Environment Variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection string for Prisma |
| `NEXT_PUBLIC_APP_URL` | Recommended | Canonical app URL for metadata and OG images |
| `ENABLED_MODELS` | No | Comma-separated adapters to enable |
| `OPENAI_API_KEY` | If using OpenAI | API key for the OpenAI adapter |
| `OPENAI_MODEL` | No | OpenAI model name |
| `GEMINI_API_KEY` | If using Gemini | API key for the Gemini adapter |
| `GEMINI_MODEL` | No | Gemini model name |
| `CLAUDE_API_KEY` | If using Claude | API key for the Claude adapter |
| `CLAUDE_MODEL` | No | Claude model name |

## Architecture

```text
Browser UI
  |
  +-- Landing form / Demo mode
  |
  +-- /api/analyze -------------------------+
  |                                         |
  v                                         v
Results dashboard <--- Prisma/Postgres <--- Orchestrator
  |                                         |
  +-- Scorecards / charts / raw output      +-- OpenAI
  +-- Metadata / OG report cards            +-- Gemini
                                            +-- Claude
```

## Team Credits

- Product and concept: BrandLens team
- Final UI polish and demo-mode pass: Codex collaboration
- Built for presentations, judging, and fast iteration
