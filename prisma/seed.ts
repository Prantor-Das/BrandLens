import "dotenv/config";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../lib/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required before running the seed script.");
}

const prisma = new PrismaClient({
  adapter: new PrismaNeon({
    connectionString
  })
});

async function main() {
  const existingJob = await prisma.analysisJob.findFirst({
    where: {
      brand: "Nike",
      status: "DONE"
    }
  });

  if (existingJob) {
    await prisma.analysisJob.delete({
      where: {
        id: existingJob.id
      }
    });
  }

  const aggregate = [
    {
      brand: "Adidas",
      averageVisibilityScore: 78,
      dominantSentiment: "positive",
      totalMentions: 7,
      modelsPresent: 3,
      averageSentimentScore: 0.47
    },
    {
      brand: "Nike",
      averageVisibilityScore: 71,
      dominantSentiment: "positive",
      totalMentions: 6,
      modelsPresent: 3,
      averageSentimentScore: 0.41
    },
    {
      brand: "Puma",
      averageVisibilityScore: 48,
      dominantSentiment: "neutral",
      totalMentions: 3,
      modelsPresent: 2,
      averageSentimentScore: 0.08
    }
  ];

  const insights = JSON.stringify(
    [
      {
        title: "Own the performance comparison query",
        description:
          "Publish clearer comparison pages for running, training, and lifestyle shoes against Adidas and Puma.",
        priority: "high"
      },
      {
        title: "Increase citation-friendly proof points",
        description:
          "Add structured product proof, athlete-backed reviews, and fit guidance that LLMs can quote directly.",
        priority: "medium"
      },
      {
        title: "Strengthen value messaging outside flagship lines",
        description:
          "Expand content for entry and mid-tier products so Nike appears in more budget-conscious recommendations.",
        priority: "medium"
      }
    ],
    null,
    2
  );

  await prisma.analysisJob.create({
    data: {
      brand: "Nike",
      competitors: ["Adidas", "Puma"],
      prompt:
        "What are the best athletic footwear brands? Compare Nike with Adidas, Puma. Be specific about strengths and weaknesses.",
      status: "DONE",
      insights,
      results: {
        byModel: [
          {
            responseId: "seed-openai",
            modelId: "openai",
            modelName: "OpenAI (gpt-4o-mini)",
            brands: [
              {
                brand: "Nike",
                mentions: 2,
                firstPosition: 1,
                contexts: [
                  "Nike is usually recommended first for performance footwear and broad product coverage.",
                  "Nike stands out for innovation, athlete partnerships, and strong training shoe recognition."
                ],
                sentiment: {
                  sentiment: "positive",
                  score: 0.5,
                  confidence: 0.84,
                  reason: "The response frames Nike as innovative and broadly trusted."
                },
                visibilityScore: 78,
                scoreLabel: "strong"
              },
              {
                brand: "Adidas",
                mentions: 3,
                firstPosition: 2,
                contexts: [
                  "Adidas is praised for comfort, lifestyle crossover appeal, and popular running silhouettes."
                ],
                sentiment: {
                  sentiment: "positive",
                  score: 0.54,
                  confidence: 0.81,
                  reason: "Adidas is described with strong product strengths and favorable comparisons."
                },
                visibilityScore: 76,
                scoreLabel: "strong"
              },
              {
                brand: "Puma",
                mentions: 1,
                firstPosition: 4,
                contexts: [
                  "Puma appears as a stylish alternative but with less consistent performance positioning."
                ],
                sentiment: {
                  sentiment: "neutral",
                  score: 0.04,
                  confidence: 0.66,
                  reason: "The tone is balanced and less enthusiastic than for Nike or Adidas."
                },
                visibilityScore: 42,
                scoreLabel: "present"
              }
            ]
          },
          {
            responseId: "seed-gemini",
            modelId: "gemini",
            modelName: "Gemini (gemini-1.5-flash)",
            brands: [
              {
                brand: "Nike",
                mentions: 2,
                firstPosition: 2,
                contexts: [
                  "Nike is highlighted for performance depth, brand trust, and innovation in cushioning."
                ],
                sentiment: {
                  sentiment: "positive",
                  score: 0.39,
                  confidence: 0.79,
                  reason: "The model recommends Nike positively but not as the top option."
                },
                visibilityScore: 69,
                scoreLabel: "strong"
              },
              {
                brand: "Adidas",
                mentions: 2,
                firstPosition: 1,
                contexts: [
                  "Adidas is positioned first thanks to comfort, style versatility, and balanced value."
                ],
                sentiment: {
                  sentiment: "positive",
                  score: 0.48,
                  confidence: 0.8,
                  reason: "Adidas receives the strongest comparative endorsement in this answer."
                },
                visibilityScore: 77,
                scoreLabel: "strong"
              },
              {
                brand: "Puma",
                mentions: 1,
                firstPosition: 5,
                contexts: [
                  "Puma is mentioned as a respectable option with lighter depth in serious performance categories."
                ],
                sentiment: {
                  sentiment: "neutral",
                  score: 0.1,
                  confidence: 0.64,
                  reason: "The tone is moderately positive but clearly less decisive."
                },
                visibilityScore: 41,
                scoreLabel: "present"
              }
            ]
          },
          {
            responseId: "seed-claude",
            modelId: "claude",
            modelName: "Claude (claude-3-5-haiku-20241022)",
            brands: [
              {
                brand: "Nike",
                mentions: 2,
                firstPosition: 1,
                contexts: [
                  "Nike remains one of the most visible names for running, training, and athlete-backed footwear."
                ],
                sentiment: {
                  sentiment: "positive",
                  score: 0.35,
                  confidence: 0.76,
                  reason: "Nike is treated as a category leader, though the answer balances it against Adidas."
                },
                visibilityScore: 66,
                scoreLabel: "strong"
              },
              {
                brand: "Adidas",
                mentions: 2,
                firstPosition: 1,
                contexts: [
                  "Adidas shares top-tier visibility with Nike and is repeatedly recommended for comfort and style."
                ],
                sentiment: {
                  sentiment: "positive",
                  score: 0.4,
                  confidence: 0.78,
                  reason: "Adidas is described as highly competitive across both performance and casual use."
                },
                visibilityScore: 81,
                scoreLabel: "dominant"
              },
              {
                brand: "Puma",
                mentions: 1,
                firstPosition: 3,
                contexts: [
                  "Puma earns mention as a good value choice but appears less often in top-tier recommendations."
                ],
                sentiment: {
                  sentiment: "neutral",
                  score: 0.1,
                  confidence: 0.61,
                  reason: "Puma is included positively, but with less authority and lower recommendation frequency."
                },
                visibilityScore: 61,
                scoreLabel: "strong"
              }
            ]
          }
        ],
        aggregate,
        winner: "Adidas",
        insights: JSON.parse(insights)
      },
      responses: {
        create: [
          {
            modelId: "openai",
            modelName: "OpenAI (gpt-4o-mini)",
            rawResponse:
              "Nike is often the default recommendation for performance footwear because of innovation, broad selection, and athlete trust. Adidas is a close competitor with standout comfort and crossover lifestyle strength. Puma is a respectable third option with style appeal and improving performance credibility.",
            processingMs: 1820,
            brandResults: {
              create: [
                {
                  brandName: "Nike",
                  mentionCount: 2,
                  firstPosition: 1,
                  sentimentScore: 0.5,
                  visibilityScore: 78
                },
                {
                  brandName: "Adidas",
                  mentionCount: 3,
                  firstPosition: 2,
                  sentimentScore: 0.54,
                  visibilityScore: 76
                },
                {
                  brandName: "Puma",
                  mentionCount: 1,
                  firstPosition: 4,
                  sentimentScore: 0.04,
                  visibilityScore: 42
                }
              ]
            }
          },
          {
            modelId: "gemini",
            modelName: "Gemini (gemini-1.5-flash)",
            rawResponse:
              "Adidas and Nike are typically the strongest all-around footwear recommendations. Adidas often wins on comfort and versatility, while Nike is favored for performance innovation and brand recognition. Puma is still relevant, especially for design-conscious buyers.",
            processingMs: 1540,
            brandResults: {
              create: [
                {
                  brandName: "Nike",
                  mentionCount: 2,
                  firstPosition: 2,
                  sentimentScore: 0.39,
                  visibilityScore: 69
                },
                {
                  brandName: "Adidas",
                  mentionCount: 2,
                  firstPosition: 1,
                  sentimentScore: 0.48,
                  visibilityScore: 77
                },
                {
                  brandName: "Puma",
                  mentionCount: 1,
                  firstPosition: 5,
                  sentimentScore: 0.1,
                  visibilityScore: 41
                }
              ]
            }
          },
          {
            modelId: "claude",
            modelName: "Claude (claude-3-5-haiku-20241022)",
            rawResponse:
              "Nike and Adidas remain the most visible footwear brands in AI-generated comparisons. Nike is associated with innovation and breadth, while Adidas repeatedly shows up for comfort and everyday wear. Puma is mentioned as a good value pick, but less often as the leading recommendation.",
            processingMs: 1715,
            brandResults: {
              create: [
                {
                  brandName: "Nike",
                  mentionCount: 2,
                  firstPosition: 1,
                  sentimentScore: 0.35,
                  visibilityScore: 66
                },
                {
                  brandName: "Adidas",
                  mentionCount: 2,
                  firstPosition: 1,
                  sentimentScore: 0.4,
                  visibilityScore: 81
                },
                {
                  brandName: "Puma",
                  mentionCount: 1,
                  firstPosition: 3,
                  sentimentScore: 0.1,
                  visibilityScore: 61
                }
              ]
            }
          }
        ]
      }
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
