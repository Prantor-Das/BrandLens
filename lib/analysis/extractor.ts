import { z } from "zod";
import { buildExtractionPrompt } from "@/lib/prompts";
import type { EntityResult } from "@/lib/types";

const extractionSchema = z.array(
  z.object({
    brand: z.string(),
    position: z.number().int().min(1),
    context: z.string().max(200)
  })
);

function extractJsonArray(input: string): string {
  const trimmed = input.trim();

  if (trimmed.startsWith("[")) {
    return trimmed;
  }

  const start = trimmed.indexOf("[");
  const end = trimmed.lastIndexOf("]");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("No JSON array found in LLM response");
  }

  return trimmed.slice(start, end + 1);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildContextSnippet(response: string, index: number, brandLength: number): string {
  const start = Math.max(0, index - 60);
  const end = Math.min(response.length, index + brandLength + 60);

  return response.slice(start, end).replace(/\s+/g, " ").trim();
}

function normalizeBrandMap(
  extracted: Array<{ brand: string; position: number; context: string }>,
  brands: string[]
): EntityResult[] {
  const results = brands.map((brand) => ({
    brand,
    mentions: 0,
    firstPosition: 999,
    contexts: [] as string[]
  }));

  const brandLookup = new Map(
    brands.map((brand) => [brand.toLowerCase(), brand] as const)
  );
  const resultLookup = new Map(results.map((result) => [result.brand, result] as const));

  for (const item of extracted) {
    const canonicalBrand = brandLookup.get(item.brand.trim().toLowerCase());

    if (!canonicalBrand) {
      continue;
    }

    const target = resultLookup.get(canonicalBrand);

    if (!target) {
      continue;
    }

    target.mentions += 1;
    target.firstPosition = Math.min(target.firstPosition, item.position);

    if (item.context && !target.contexts.includes(item.context)) {
      target.contexts.push(item.context);
    }
  }

  return results;
}

function fallbackExtract(response: string, brands: string[]): EntityResult[] {
  return brands.map((brand) => {
    const escapedBrand = escapeRegExp(brand);
    const regex = new RegExp(`\\b${escapedBrand}\\b`, "gi");
    const matches = Array.from(response.matchAll(regex));
    const mentions = matches.length;
    const firstIndex = matches[0]?.index;

    return {
      brand,
      mentions,
      firstPosition: mentions > 0 ? (firstIndex ?? 0) + 1 : 999,
      contexts:
        mentions > 0
          ? matches.slice(0, 5).map((match) =>
              buildContextSnippet(response, match.index ?? 0, brand.length)
            )
          : []
    };
  });
}

export async function extractEntities(
  response: string,
  brands: string[],
  llmQueryFn: (prompt: string) => Promise<string>
): Promise<EntityResult[]> {
  const prompt = buildExtractionPrompt(response, brands);

  try {
    const raw = await llmQueryFn(prompt);
    const parsed = extractionSchema.parse(JSON.parse(extractJsonArray(raw)));

    return normalizeBrandMap(parsed, brands);
  } catch (error) {
    console.warn(
      `[extractor] Falling back to string matching: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );

    return fallbackExtract(response, brands);
  }
}
