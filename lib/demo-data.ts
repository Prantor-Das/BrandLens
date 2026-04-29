import type { FullJobResult } from "@/lib/types";
import { inferSentiment, type ResultsApiPayload } from "@/lib/results";

const createdAt = new Date("2026-04-28T10:30:00.000Z");

export const demoJobResult: FullJobResult = {
  id: "demo",
  createdAt,
  status: "DONE",
  brand: "Nike",
  competitors: ["Adidas", "Puma"],
  selectedModels: ["openai", "gemini", "claude"],
  prompt:
    "How do leading athletic brands compare for performance innovation, cultural relevance, and direct-to-consumer momentum?",
  insights: JSON.stringify([
    {
      title: "Own the innovation proof points that Adidas currently states more clearly",
      description:
        "Across the benchmarked models, Adidas is described with more explicit momentum around design systems, collaborations, and product freshness. Nike still wins on scale, but the supporting proof is less concrete.",
      priority: "high"
    },
    {
      title: "Turn athlete storytelling into a sharper commerce signal",
      description:
        "Nike is praised for cultural pull and athlete partnerships, yet only one model linked that strength directly to shopping confidence. Add sharper product evidence, performance claims, and launch narratives.",
      priority: "medium"
    },
    {
      title: "Keep Puma framed as niche so the comparison stays two-horse",
      description:
        "Puma appears in every response, but mostly as a value or style alternative. Maintaining premium performance framing will help Nike defend consideration against Adidas without creating unnecessary parity with Puma.",
      priority: "low"
    }
  ]),
  results: {
    brandDescription:
      "A global athletic footwear, apparel, and equipment company, Nike serves consumers across sport, fitness, and lifestyle markets. Its best-known products include performance shoes, sportswear, and signature athlete lines, with differentiation built around product innovation, athlete endorsements, and large-scale brand recognition.",
    aggregate: [
      {
        brand: "Adidas",
        averageVisibilityScore: 82,
        dominantSentiment: "positive",
        totalMentions: 10,
        modelsPresent: 3,
        rank: 1,
        delta: 0
      },
      {
        brand: "Nike",
        averageVisibilityScore: 74,
        dominantSentiment: "positive",
        totalMentions: 9,
        modelsPresent: 3,
        rank: 2,
        delta: 8
      },
      {
        brand: "Puma",
        averageVisibilityScore: 61,
        dominantSentiment: "neutral",
        totalMentions: 6,
        modelsPresent: 3,
        rank: 3,
        delta: 21
      }
    ],
    winner: "Adidas"
  },
  responses: [
    {
      id: "demo-openai",
      jobId: "demo",
      modelId: "openai",
      modelName: "GPT-4.1",
      rawResponse:
        "Nike remains the default global leader for performance credibility and cultural reach, but Adidas is often described with clearer current momentum. Adidas stands out for consistent design language, collaborations, and a modern lifestyle-performance blend. Puma is usually framed as a stylish challenger with selective wins in value and fashion relevance rather than category leadership.",
      processingMs: 6400,
      brandResults: [
        {
          id: "demo-openai-nike",
          responseId: "demo-openai",
          brandName: "Nike",
          mentionCount: 3,
          firstPosition: 1,
          sentimentScore: 0.48,
          visibilityScore: 78
        },
        {
          id: "demo-openai-adidas",
          responseId: "demo-openai",
          brandName: "Adidas",
          mentionCount: 3,
          firstPosition: 2,
          sentimentScore: 0.58,
          visibilityScore: 81
        },
        {
          id: "demo-openai-puma",
          responseId: "demo-openai",
          brandName: "Puma",
          mentionCount: 2,
          firstPosition: 3,
          sentimentScore: 0.14,
          visibilityScore: 58
        }
      ]
    },
    {
      id: "demo-gemini",
      jobId: "demo",
      modelId: "gemini",
      modelName: "Gemini 2.5 Pro",
      rawResponse:
        "Adidas currently feels the most balanced across sport, streetwear, and sustainability narratives. Nike still commands the strongest top-of-mind awareness and athlete association, especially for performance categories, though the language is sometimes broader than specific. Puma is visible, but usually as a secondary option compared with the other two brands.",
      processingMs: 5900,
      brandResults: [
        {
          id: "demo-gemini-nike",
          responseId: "demo-gemini",
          brandName: "Nike",
          mentionCount: 3,
          firstPosition: 2,
          sentimentScore: 0.42,
          visibilityScore: 71
        },
        {
          id: "demo-gemini-adidas",
          responseId: "demo-gemini",
          brandName: "Adidas",
          mentionCount: 4,
          firstPosition: 1,
          sentimentScore: 0.62,
          visibilityScore: 85
        },
        {
          id: "demo-gemini-puma",
          responseId: "demo-gemini",
          brandName: "Puma",
          mentionCount: 2,
          firstPosition: 3,
          sentimentScore: 0.08,
          visibilityScore: 60
        }
      ]
    },
    {
      id: "demo-claude",
      jobId: "demo",
      modelId: "claude",
      modelName: "Claude 4 Sonnet",
      rawResponse:
        "Nike has unmatched scale and premium athlete storytelling, but Adidas sounds more current in terms of design heat and product freshness. Puma gets credit for smart positioning and fashion adjacency, yet it is rarely presented as the benchmark brand. Overall, the comparison reads as Adidas leading on present momentum while Nike leads on legacy strength.",
      processingMs: 7100,
      brandResults: [
        {
          id: "demo-claude-nike",
          responseId: "demo-claude",
          brandName: "Nike",
          mentionCount: 3,
          firstPosition: 1,
          sentimentScore: 0.45,
          visibilityScore: 73
        },
        {
          id: "demo-claude-adidas",
          responseId: "demo-claude",
          brandName: "Adidas",
          mentionCount: 3,
          firstPosition: 2,
          sentimentScore: 0.55,
          visibilityScore: 80
        },
        {
          id: "demo-claude-puma",
          responseId: "demo-claude",
          brandName: "Puma",
          mentionCount: 2,
          firstPosition: 3,
          sentimentScore: 0.05,
          visibilityScore: 65
        }
      ]
    }
  ]
};

export const demoResultsPayload: ResultsApiPayload = {
  status: "DONE",
  brand: demoJobResult.brand,
  brandDescription:
    "A global athletic footwear, apparel, and equipment company, Nike serves consumers across sport, fitness, and lifestyle markets. Its best-known products include performance shoes, sportswear, and signature athlete lines, with differentiation built around product innovation, athlete endorsements, and large-scale brand recognition.",
  competitors: demoJobResult.competitors,
  enabledModels: demoJobResult.responses.map((response) => response.modelId),
  modelResponses: demoJobResult.responses.map((response) => ({
    modelId: response.modelId,
    modelName: response.modelName,
    rawResponse: response.rawResponse,
    durationMs: response.processingMs
  })),
  brandResults: demoJobResult.responses.flatMap((response) => {
    const ranked = [...response.brandResults].sort(
      (left, right) => right.visibilityScore - left.visibilityScore
    );
    const leaderScore = ranked[0]?.visibilityScore ?? 0;

    return ranked.map((brandResult, index) => ({
      brandName: brandResult.brandName,
      mentionCount: brandResult.mentionCount,
      firstPosition: brandResult.firstPosition,
      sentimentScore: brandResult.sentimentScore,
      visibilityScore: brandResult.visibilityScore,
      sentiment: inferSentiment(brandResult.sentimentScore),
      modelName: response.modelName,
      rank: index + 1,
      delta: Math.round((leaderScore - brandResult.visibilityScore) * 100) / 100
    }));
  }),
  aggregate: [
    {
      brandName: "Adidas",
      avgVisibilityScore: 82,
      dominantSentiment: "positive",
      totalMentions: 10,
      modelsPresent: 3,
      rank: 1,
      delta: 0
    },
    {
      brandName: "Nike",
      avgVisibilityScore: 74,
      dominantSentiment: "positive",
      totalMentions: 9,
      modelsPresent: 3,
      rank: 2,
      delta: 8
    },
    {
      brandName: "Puma",
      avgVisibilityScore: 61,
      dominantSentiment: "neutral",
      totalMentions: 6,
      modelsPresent: 3,
      rank: 3,
      delta: 21
    }
  ],
  insights: [
    {
      title: "Adidas wins the momentum narrative even when Nike leads recall",
      description:
        "The models treat Nike as the category incumbent, but Adidas earns the strongest current-state language. That means Nike needs fresher product proof to avoid sounding broad while Adidas sounds specific.",
      priority: "high"
    },
    {
      title: "Nike is one strong proof layer away from reclaiming first place",
      description:
        "Brand mention volume is nearly even. The gap is mostly in first-place freshness and specificity, not basic awareness, which makes this a messaging problem you can fix quickly.",
      priority: "medium"
    },
    {
      title: "Puma is visible, but mostly as an alternative rather than a standard",
      description:
        "Keeping the narrative centered on innovation, premium performance, and flagship launches makes it harder for Puma to close the credibility gap.",
      priority: "low"
    }
  ],
  createdAt: createdAt.toISOString()
};
