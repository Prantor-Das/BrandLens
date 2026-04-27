export const BRAND_MODELS = ["GPT-4o", "Gemini 1.5", "Claude 3.5"] as const;

export type BrandModel = (typeof BRAND_MODELS)[number];

export const ANALYSIS_STATUS_MESSAGES = [
  "Querying GPT-4o...",
  "Querying Gemini...",
  "Querying Claude...",
  "Extracting brand mentions...",
  "Computing scores..."
] as const;

