import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";
import { env } from "@/lib/env";
import type { ModelAdapter } from "@/lib/types";

function makeOpenRouterAdapter(
  modelId: string,
  displayName: string,
  isFree = false
): ModelAdapter {
  const client = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: env.OPENROUTER_API_KEY,
    defaultHeaders: {
      "HTTP-Referer": env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
      "X-Title": "BrandLens AI"
    }
  });

  return {
    id: modelId,
    name: displayName,
    isFree,
    provider: "openrouter",
    query: async (prompt: string) => {
      const res = await client.chat.completions.create({
        model: modelId,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1000
      });

      return res.choices[0]?.message.content ?? "";
    }
  };
}

function makeGeminiAdapter(modelId: string, displayName: string): ModelAdapter {
  const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

  return {
    id: modelId,
    name: displayName,
    isFree: true,
    provider: "google",
    query: async (prompt: string) => {
      const response = await ai.models.generateContent({
        model: modelId,
        contents: prompt
      });

      return response.text ?? "";
    }
  };
}

export function getEnabledModels(): ModelAdapter[] {
  const models: ModelAdapter[] = [];
  const enabled = env.ENABLED_MODELS.split(",").map((item) => item.trim());

  const registry: Record<string, () => ModelAdapter> = {
    "openrouter-gpt": () =>
      makeOpenRouterAdapter(
        env.MODEL_OPENROUTER_GPT_ID ?? "openai/gpt-4o-mini",
        env.MODEL_OPENROUTER_GPT_NAME ?? "GPT-4o mini"
      ),
    "openrouter-claude": () =>
      makeOpenRouterAdapter(
        env.MODEL_OPENROUTER_CLAUDE_ID ?? "anthropic/claude-3.5-haiku",
        env.MODEL_OPENROUTER_CLAUDE_NAME ?? "Claude 3.5 Haiku"
      ),
    "openrouter-deepseek": () =>
      makeOpenRouterAdapter(
        env.MODEL_OPENROUTER_DEEPSEEK_ID ?? "deepseek/deepseek-r1:free",
        env.MODEL_OPENROUTER_DEEPSEEK_NAME ?? "DeepSeek R1",
        true
      ),
    gemini: () =>
      makeGeminiAdapter(
        env.MODEL_GEMINI_ID ?? "gemini-2.5-flash",
        env.MODEL_GEMINI_NAME ?? "Gemini 2.5 Flash"
      )
  };

  for (const key of enabled) {
    if (!registry[key]) {
      continue;
    }

    if (key.startsWith("openrouter") && !env.OPENROUTER_API_KEY) {
      continue;
    }

    if (key === "gemini" && !env.GEMINI_API_KEY) {
      continue;
    }

    models.push(registry[key]());
  }

  return models;
}
