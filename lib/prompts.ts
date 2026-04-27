export function buildAnalysisPrompt(
  brand: string,
  competitors: string[],
  customPrompt?: string
): string {
  if (customPrompt) {
    return customPrompt;
  }

  const competitorList = competitors.join(", ");
  const comparisonClause = competitorList
    ? ` Compare ${brand} with ${competitorList}.`
    : ` Focus on ${brand}.`;

  return `What are the best [category] options?${comparisonClause} Be specific about strengths and weaknesses.`;
}

export function buildExtractionPrompt(response: string, brands: string[]): string {
  return [
    "You are extracting brand mentions from an LLM answer.",
    `Brands to detect: ${brands.join(", ")}.`,
    'Return JSON only. Output must be an array of objects with exactly these keys: "brand", "position", "context".',
    'Use "position" as the 1-based order of first appearance in the response.',
    'Use "context" as the shortest useful quote or summary of the surrounding mention.',
    "If a brand does not appear, do not include it in the array.",
    "",
    "Response to analyze:",
    response
  ].join("\n");
}

export function buildSentimentPrompt(brandContext: string): string {
  return [
    "You are classifying sentiment for a brand mention.",
    'Return JSON only with this exact shape: {"sentiment":"positive"|"neutral"|"negative","confidence":number,"reason":string}.',
    "Confidence must be a number between 0 and 1.",
    "",
    "Brand context:",
    brandContext
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
