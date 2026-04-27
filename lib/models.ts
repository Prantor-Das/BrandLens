import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import { env } from "@/lib/env";

export interface ModelAdapter {
  id: string;
  name: string;
  query: (prompt: string) => Promise<string>;
}

type AdapterFactory = () => ModelAdapter | null;

const joinTextBlocks = (
  blocks: Array<{ type: string; text?: string }>
): string => {
  return blocks
    .filter((block) => block.type === "text" && typeof block.text === "string")
    .map((block) => block.text ?? "")
    .join("\n")
    .trim();
};

const adapterFactories: Record<string, AdapterFactory> = {
  openai: () => {
    if (!env.OPENAI_API_KEY) {
      return null;
    }

    const client = new OpenAI({
      apiKey: env.OPENAI_API_KEY
    });

    return {
      id: "openai",
      name: `OpenAI (${env.OPENAI_MODEL})`,
      query: async (prompt: string) => {
        const response = await client.responses.create({
          model: env.OPENAI_MODEL,
          input: prompt
        });

        return (response.output_text ?? "").trim();
      }
    };
  },
  gemini: () => {
    if (!env.GEMINI_API_KEY) {
      return null;
    }

    const client = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    const model = client.getGenerativeModel({
      model: env.GEMINI_MODEL
    });

    return {
      id: "gemini",
      name: `Gemini (${env.GEMINI_MODEL})`,
      query: async (prompt: string) => {
        const response = await model.generateContent(prompt);
        return response.response.text().trim();
      }
    };
  },
  claude: () => {
    if (!env.CLAUDE_API_KEY) {
      return null;
    }

    const client = new Anthropic({
      apiKey: env.CLAUDE_API_KEY
    });

    return {
      id: "claude",
      name: `Claude (${env.CLAUDE_MODEL})`,
      query: async (prompt: string) => {
        const response = await client.messages.create({
          model: env.CLAUDE_MODEL,
          max_tokens: 1024,
          messages: [
            {
              role: "user",
              content: prompt
            }
          ]
        });

        return joinTextBlocks(response.content).trim();
      }
    };
  }
};

const parseEnabledIds = (value: string): string[] => {
  return [...new Set(value.split(",").map((item) => item.trim().toLowerCase()).filter(Boolean))];
};

export function getEnabledModels(): ModelAdapter[] {
  return parseEnabledIds(env.ENABLED_MODELS)
    .map((id) => adapterFactories[id]?.())
    .filter((adapter): adapter is ModelAdapter => adapter !== null);
}
