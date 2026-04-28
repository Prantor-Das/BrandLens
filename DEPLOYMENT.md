# BrandLens AI Deployment

## Vercel Steps

1. Push this repository to GitHub.
2. In Vercel, click **Add New Project** and import the GitHub repo.
3. Add these environment variables in the Vercel project settings:
   - `DATABASE_URL`
   - `NEXT_PUBLIC_APP_URL`
   - `ENABLED_MODELS`
   - `OPENAI_API_KEY`
   - `OPENAI_MODEL`
   - `GEMINI_API_KEY`
   - `GEMINI_MODEL`
   - `CLAUDE_API_KEY`
   - `CLAUDE_MODEL`
4. For `DATABASE_URL`, use either:
   - Vercel Postgres
   - Neon free tier
5. Run `pnpm prisma:push` against the production database:
   - In the Vercel dashboard shell for the project, or
   - Via Vercel CLI with the project environment loaded
6. Trigger the first deploy.

## Recommended Env Values

- `NEXT_PUBLIC_APP_URL`: your production URL, for example `https://brandlens-ai.vercel.app`
- `ENABLED_MODELS`: `openai,gemini,claude`
- `OPENAI_MODEL`: `gpt-4o-mini`
- `GEMINI_MODEL`: `gemini-1.5-flash`
- `CLAUDE_MODEL`: `claude-3-5-haiku-20241022`

## Notes

- The build command already runs `pnpm prisma generate && pnpm build`.
- Demo mode works without live model keys, but real analysis requires at least one provider API key.
- If deployment succeeds but analysis fails, verify the database connection and the enabled API keys first.
