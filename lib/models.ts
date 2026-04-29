import { GoogleGenAI } from "@google/genai";
import { env } from "@/lib/env";
import type { ModelAdapter } from "@/lib/types";

type OpenRouterChoice = {
  message?: {
    content?: string | null;
    reasoning?: string | null;
    reasoning_content?: string | null;
  } | null;
};

type OpenRouterResponse = {
  choices?: OpenRouterChoice[];
  error?: {
    message?: string;
  };
};

function stripThinkingBlocks(value: string): string {
  return value.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
}

function getOpenRouterText(data: OpenRouterResponse): string {
  const message = data.choices?.[0]?.message;
  const content = stripThinkingBlocks(message?.content?.trim() ?? "");

  return (
    content ||
    message?.reasoning_content?.trim() ||
    message?.reasoning?.trim() ||
    ""
  );
}

function makeOpenRouterAdapter(
  modelId: string,
  displayName: string,
  isFree = false
): ModelAdapter {
  const apiKey = env.OPENROUTER_API_KEY ?? "";
  const referer = env.NEXT_PUBLIC_APP_URL ?? "https://brandlens.ai";

  return {
    id: modelId,
    name: displayName,
    isFree,
    provider: "openrouter",
    query: async (prompt: string) => {
      const maxTokens = modelId.toLowerCase().includes("deepseek") ? 2048 : 1024;
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": referer,
          "X-Title": "BrandLens AI"
        },
        body: JSON.stringify({
          model: modelId,
          messages: [{ role: "user", content: prompt }],
          max_tokens: maxTokens
        })
      });
      const data = (await response.json()) as OpenRouterResponse;

      if (!response.ok) {
        throw new Error(data.error?.message ?? `OpenRouter request failed with status ${response.status}`);
      }

      const text = getOpenRouterText(data);

      if (!text) {
        throw new Error(`OpenRouter returned an empty response for ${modelId}`);
      }

      return text;
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
