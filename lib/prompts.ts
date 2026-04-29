export function buildAnalysisPrompt(
  brand: string,
  competitors: string[],
  customPrompt?: string
): string {
  if (customPrompt?.trim()) {
    return customPrompt.trim();
  }

  const allBrands = [brand, ...competitors];
  const brandsFormatted = allBrands.map((item) => `"${item}"`).join(", ");
  const competitorClause =
    competitors.length > 0
      ? `Compare it directly with ${competitors.map((item) => `"${item}"`).join(", ")}.`
      : `Analyse "${brand}" in depth on its own - no competitor comparison needed.`;

  return `You are a knowledgeable market analyst with up-to-date awareness of global and regional brands across all industries.

A user wants to understand how the brand "${brand}" is perceived in the AI-powered recommendation landscape.

Your task:
1. Identify what industry/category "${brand}" operates in (e.g. consumer electronics, cosmetics, confectionery, SaaS, automotive, etc.).
2. Describe "${brand}"'s reputation, key strengths, weaknesses, and how it is typically recommended or discussed - be specific and factual.
3. ${competitorClause}
4. For each brand mentioned (${brandsFormatted}), give a clear assessment covering: market positioning, sentiment among consumers/buyers, key product or service highlights, and any notable controversies or praise.
5. Conclude with which brand you would recommend and why, based on quality, value, and reputation.

IMPORTANT RULES:
- "${brand}" MUST appear in your response, even if it is a niche or regional brand. Do your best with available knowledge.
- Do not confuse similarly-named brands (e.g. "Sugar" the cosmetics brand vs. the ingredient sugar - always assume the brand interpretation).
- Be specific. Do not give generic advice. Name actual products, campaigns, or attributes.
- Keep the response structured and between 300-500 words.`;
}

export function buildExtractionPrompt(response: string, brands: string[]): string {
  return [
    "You are extracting brand mentions from an LLM answer.",
    `Brands to detect (these are COMPANY OR PRODUCT BRAND NAMES, not common nouns or ingredients): ${brands.join(", ")}.`,
    'Return JSON only. Output must be an array of objects with exactly these keys: "brand", "position", "context".',
    'Use "position" as the 1-based order of first appearance in the response.',
    'Use "context" as the shortest useful quote or summary of the surrounding mention.',
    "If a brand does not appear, do not include it in the array.",
    'IMPORTANT: Even if a brand name is also a common word (e.g. "Sugar", "Apple", "Mars", "Dove", "Tide"), always treat it as a brand name in this context. Match it case-insensitively.',
    "",
    "Response to analyze:",
    response
  ].join("\n");
}

export function buildSentimentPrompt(brandContext: string): string {
  return [
    "You are classifying sentiment for a brand mention.",
    'Return JSON only with this exact shape: {"sentiment":"positive"|"neutral"|"negative","score":number,"confidence":number,"reason":string}.',
    '"score" must be a float between -1.0 (very negative) and 1.0 (very positive). Use 0.0 for neutral.',
    '"confidence" must be a number between 0 and 1.',
    "Be generous but accurate: well-known, globally respected brands like Apple, Samsung, Nike should receive a score of 0.5-0.8 unless there is clear negative context.",
    "",
    "Brand context:",
    brandContext
  ].join("\n");
}

export function buildBrandDescriptionPrompt(brand: string): string {
  return [
    "You are a knowledgeable business analyst.",
    `Write a factual, neutral 2-4 sentence description of the company or brand called "${brand}".`,
    "Cover: what they do, their primary market/audience, and any well-known product or differentiator.",
    `If "${brand}" is ambiguous (e.g. could be a food brand AND a cosmetics brand), pick the most globally recognised interpretation and state it.`,
    "Do NOT use marketing language. Do NOT start with the brand name as the first word.",
    "Return plain text only - no JSON, no markdown, no bullet points."
  ].join("\n");
}

export function buildInsightPrompt(scores: object, brand: string): string {
  return [
    `You are a brand strategist generating recommendations for ${brand}.`,
    "Review the scoring data below and return exactly 3 specific actionable recommendations.",
    "Each recommendation should be concrete, prioritized, and tied to the observed visibility or sentiment signals.",
    "",
    "Scoring data:",
    JSON.stringify(scores, null, 2)
  ].join("\n");
}
