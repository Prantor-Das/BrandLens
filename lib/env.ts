import { z } from "zod";

const optionalString = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().optional()
);

const envSchema = z
  .object({
    DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
    OPENROUTER_API_KEY: optionalString,
    GEMINI_API_KEY: optionalString,
    ENABLED_MODELS: z
      .string()
      .default("openrouter-gpt,openrouter-claude,openrouter-deepseek,gemini"),
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
  DATABASE_URL: process.env.DATABASE_URL,
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
