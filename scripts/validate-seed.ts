import { prisma } from "../lib/prisma";

async function main(): Promise<void> {
  const job = await prisma.analysisJob.findFirst({
    where: {
      brand: {
        equals: "Nike",
        mode: "insensitive"
      }
    },
    orderBy: {
      createdAt: "desc"
    },
    include: {
      responses: {
        include: {
          brandResults: {
            orderBy: [
              {
                visibilityScore: "desc"
              },
              {
                brandName: "asc"
              }
            ]
          }
        },
        orderBy: {
          modelName: "asc"
        }
      }
    }
  });

  if (!job) {
    throw new Error('Seed validation failed: no seeded "Nike" job found.');
  }

  const expectedBrands = [job.brand, ...job.competitors];
  const missingResponses = job.responses.filter(
    (response) => response.brandResults.length !== expectedBrands.length
  );

  if (missingResponses.length > 0) {
    const summary = missingResponses
      .map(
        (response) =>
          `${response.modelName} expected ${expectedBrands.length} results, found ${response.brandResults.length}`
      )
      .join("; ");

    throw new Error(`Seed validation failed: missing BrandResult rows. ${summary}`);
  }

  const summaryRows = job.responses.flatMap((response) =>
    response.brandResults.map((brandResult) => ({
      model: response.modelName,
      brand: brandResult.brandName,
      mentions: brandResult.mentionCount,
      sentiment: brandResult.sentimentScore,
      visibility: brandResult.visibilityScore
    }))
  );

  console.log(
    `Validated Nike seed job ${job.id} created ${job.createdAt.toISOString()} with ${job.responses.length} model responses.`
  );
  console.table(summaryRows);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
