# BrandLens AI

BrandLens AI benchmarks how leading AI assistants talk about your brand versus competitors.

![Screenshot placeholder](https://placehold.co/1200x675/101828/F9FAFB?text=BrandLens+AI+Screenshot)

## Features

- Instant `Try demo` mode for judge-friendly walkthroughs
- Parallel AI brand analysis across OpenRouter and Google AI Studio models
- Score cards, radar charts, raw responses, and per-model breakdowns
- Actionable insights that translate AI visibility into positioning fixes
- Responsive landing and results experiences for desktop and mobile
- Dynamic result metadata and Open Graph report cards

## Local Setup

1. Install dependencies with `pnpm install`.
2. Copy `.env.example` to `.env`.
3. Fill in `DATABASE_URL` and at least one model API key.
4. Run `pnpm prisma:generate` and `pnpm prisma:push`.
5. Start the app with `pnpm dev`.

## Environment Variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection string for Prisma |
| `NEXT_PUBLIC_APP_URL` | Recommended | Canonical app URL for metadata and OG images |
| `OPENROUTER_API_KEY` | If using OpenRouter | API key for GPT, Claude, DeepSeek, and other OpenRouter models |
| `GEMINI_API_KEY` | If using Gemini | API key for direct Google AI Studio Gemini calls |
| `ENABLED_MODELS` | No | Comma-separated model registry keys to enable |
| `MODEL_OPENROUTER_GPT_ID` | No | OpenRouter GPT model ID |
| `MODEL_OPENROUTER_GPT_NAME` | No | Display name for the GPT model |
| `MODEL_OPENROUTER_CLAUDE_ID` | No | OpenRouter Claude model ID |
| `MODEL_OPENROUTER_CLAUDE_NAME` | No | Display name for the Claude model |
| `MODEL_OPENROUTER_DEEPSEEK_ID` | No | OpenRouter DeepSeek model ID |
| `MODEL_OPENROUTER_DEEPSEEK_NAME` | No | Display name for the DeepSeek model |
| `MODEL_GEMINI_ID` | No | Google AI Studio Gemini model ID |
| `MODEL_GEMINI_NAME` | No | Display name for the Gemini model |

## Adding a new LLM model (30 seconds)

1. Add to `.env`: `ENABLED_MODELS=...,openrouter-mistral`
2. Add: `MODEL_OPENROUTER_MISTRAL_ID=mistralai/mistral-7b-instruct:free`
3. Add: `MODEL_OPENROUTER_MISTRAL_NAME=Mistral 7B`
4. Add the registry entry in `lib/models.ts` `getEnabledModels()`
5. Redeploy. Done. No other code changes.

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
  +-- Scorecards / charts / raw output      +-- OpenRouter
  +-- Metadata / OG report cards            +-- Google AI Studio
```

## Team Credits

- Product and concept: BrandLens team
- Final UI polish and demo-mode pass: Codex collaboration
- Built for presentations, judging, and fast iteration
