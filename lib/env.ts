import { z } from "zod";

function normalizeEnvValue(value: unknown) {
  if (typeof value !== "string") {
    return value;
  }

  let trimmed = value.trim();

  if (
    !trimmed ||
    trimmed.startsWith("Optional.") ||
    trimmed.startsWith("Required.")
  ) {
    return undefined;
  }

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'")) ||
    (trimmed.startsWith("`") && trimmed.endsWith("`"))
  ) {
    trimmed = trimmed.slice(1, -1).trim();
  }

  return trimmed;
}

function envValue<T extends z.ZodTypeAny>(schema: T) {
  return z.preprocess(normalizeEnvValue, schema);
}

function firstEnvValue(...values: unknown[]) {
  for (const value of values) {
    const normalized = normalizeEnvValue(value);

    if (typeof normalized === "string") {
      return normalized;
    }
  }

  return undefined;
}

const optionalString = envValue(z.string().optional());
const databaseUrl = envValue(
  z
    .string()
    .min(1, "DATABASE_URL is required")
    .refine(
      (value) => {
        try {
          const url = new URL(value);
          return url.protocol === "postgres:" || url.protocol === "postgresql:";
        } catch {
          return false;
        }
      },
      {
        message:
          "DATABASE_URL must be a valid postgres:// or postgresql:// connection URL."
      }
    )
);

const envSchema = z
  .object({
    DATABASE_URL: databaseUrl,
    OPENROUTER_API_KEY: optionalString,
    GEMINI_API_KEY: optionalString,
    ENABLED_MODELS: envValue(
      z.string().default("openrouter-gpt,openrouter-claude,gemini")
    ),
    MODEL_OPENROUTER_GPT_ID: optionalString,
    MODEL_OPENROUTER_GPT_NAME: optionalString,
    MODEL_OPENROUTER_CLAUDE_ID: optionalString,
    MODEL_OPENROUTER_CLAUDE_NAME: optionalString,
    MODEL_OPENROUTER_DEEPSEEK_ID: optionalString,
    MODEL_OPENROUTER_DEEPSEEK_NAME: optionalString,
    MODEL_GEMINI_ID: optionalString,
    MODEL_GEMINI_NAME: optionalString,
    NEXT_PUBLIC_APP_URL: optionalString
  })
  .refine((value) => value.OPENROUTER_API_KEY || value.GEMINI_API_KEY, {
    message:
      "Set OPENROUTER_API_KEY or GEMINI_API_KEY to enable at least one LLM provider."
  });

export const env = envSchema.parse({
  DATABASE_URL: firstEnvValue(
    process.env.DATABASE_URL,
    process.env.POSTGRES_PRISMA_URL,
    process.env.POSTGRES_URL
  ),
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  ENABLED_MODELS: process.env.ENABLED_MODELS,
  MODEL_OPENROUTER_GPT_ID: process.env.MODEL_OPENROUTER_GPT_ID,
  MODEL_OPENROUTER_GPT_NAME: process.env.MODEL_OPENROUTER_GPT_NAME,
  MODEL_OPENROUTER_CLAUDE_ID: process.env.MODEL_OPENROUTER_CLAUDE_ID,
  MODEL_OPENROUTER_CLAUDE_NAME: process.env.MODEL_OPENROUTER_CLAUDE_NAME,
  MODEL_OPENROUTER_DEEPSEEK_ID: process.env.MODEL_OPENROUTER_DEEPSEEK_ID,
  MODEL_OPENROUTER_DEEPSEEK_NAME: process.env.MODEL_OPENROUTER_DEEPSEEK_NAME,
  MODEL_GEMINI_ID: process.env.MODEL_GEMINI_ID,
  MODEL_GEMINI_NAME: process.env.MODEL_GEMINI_NAME,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL
});
