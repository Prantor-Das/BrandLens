# BrandLens AI Deployment

## Vercel Steps

1. Push this repository to GitHub.
2. In Vercel, click **Add New Project** and import the GitHub repo.
3. Add these environment variables in the Vercel project settings:
   - `DATABASE_URL`
   - `NEXT_PUBLIC_APP_URL`
   - `ENABLED_MODELS`
   - `OPENROUTER_API_KEY`
   - `GEMINI_API_KEY`
   - `MODEL_OPENROUTER_GPT_ID`
   - `MODEL_OPENROUTER_GPT_NAME`
   - `MODEL_OPENROUTER_CLAUDE_ID`
   - `MODEL_OPENROUTER_CLAUDE_NAME`
   - `MODEL_OPENROUTER_DEEPSEEK_ID`
   - `MODEL_OPENROUTER_DEEPSEEK_NAME`
   - `MODEL_GEMINI_ID`
   - `MODEL_GEMINI_NAME`
4. For `DATABASE_URL`, use either:
   - Vercel Postgres
   - Neon free tier
5. Run `pnpm prisma:push` against the production database:
   - In the Vercel dashboard shell for the project, or
   - Via Vercel CLI with the project environment loaded
6. Trigger the first deploy.

## Recommended Env Values

- `NEXT_PUBLIC_APP_URL`: your production URL, for example `https://brandlens-ai.vercel.app`
- `ENABLED_MODELS`: `openrouter-gpt,openrouter-claude,openrouter-deepseek,gemini`
- `MODEL_OPENROUTER_GPT_ID`: `openai/gpt-4o-mini`
- `MODEL_OPENROUTER_CLAUDE_ID`: `anthropic/claude-3.5-haiku`
- `MODEL_OPENROUTER_DEEPSEEK_ID`: `deepseek/deepseek-r1:free`
- `MODEL_GEMINI_ID`: `gemini-2.5-flash`

## Notes

- The build command already runs `pnpm prisma generate && pnpm build`.
- Demo mode works without live model keys, but real analysis requires at least one provider API key.
- If deployment succeeds but analysis fails, verify the database connection and the enabled API keys first.
