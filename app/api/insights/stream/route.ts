import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";

const streamRequestSchema = z.object({
  insights: z
    .array(
      z.object({
        title: z.string(),
        description: z.string(),
        priority: z.enum(["high", "medium", "low"])
      })
    )
    .optional(),
  text: z.string().optional()
});

function buildStreamText(input: z.infer<typeof streamRequestSchema>): string {
  if (input.text?.trim()) {
    return input.text.trim();
  }

  if (input.insights?.length) {
    return input.insights
      .map((insight) => `${insight.title}: ${insight.description}`)
      .join("\n");
  }

  return "No insights are available for this report yet.";
}

export async function POST(request: Request) {
  const parsed = streamRequestSchema.safeParse(await request.json().catch(() => ({})));
  const text = buildStreamText(parsed.success ? parsed.data : {});
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      for (const token of text.split(/(\s+)/).filter(Boolean)) {
        controller.enqueue(encoder.encode(`data: ${token}\n\n`));
        await new Promise((resolve) => setTimeout(resolve, 18));
      }

      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    }
  });

  return new NextResponse(stream, {
    headers: {
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "Content-Type": "text/event-stream"
    }
  });
}
