import type { ModelAdapter } from "@/lib/models";

export interface OrchestratorResult {
  modelId: string;
  modelName: string;
  response: string | null;
  durationMs: number;
  error?: string;
}

const RETRY_DELAY_MS = 1000;
const MAX_ATTEMPTS = 2;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isTransientError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();

  return [
    "timeout",
    "timed out",
    "rate limit",
    "temporarily unavailable",
    "temporarily overloaded",
    "econnreset",
    "fetch failed",
    "429",
    "500",
    "502",
    "503",
    "504"
  ].some((fragment) => message.includes(fragment));
}

async function queryWithRetry(
  model: ModelAdapter,
  prompt: string
): Promise<OrchestratorResult> {
  const startedAt = Date.now();
  let attempts = 0;

  while (attempts < MAX_ATTEMPTS) {
    attempts += 1;

    try {
      const response = await model.query(prompt);
      const durationMs = Date.now() - startedAt;

      console.info(`[orchestrator] ${model.id} completed in ${durationMs}ms`);

      return {
        modelId: model.id,
        modelName: model.name,
        response,
        durationMs
      };
    } catch (error) {
      const retryable = attempts < MAX_ATTEMPTS && isTransientError(error);

      if (retryable) {
        await sleep(RETRY_DELAY_MS);
        continue;
      }

      const durationMs = Date.now() - startedAt;
      const message = error instanceof Error ? error.message : "Unknown error";

      console.error(`[orchestrator] ${model.id} failed in ${durationMs}ms: ${message}`);

      return {
        modelId: model.id,
        modelName: model.name,
        response: null,
        durationMs,
        error: message
      };
    }
  }

  return {
    modelId: model.id,
    modelName: model.name,
    response: null,
    durationMs: Date.now() - startedAt,
    error: "Unknown retry failure"
  };
}

export async function orchestrateModels(
  prompt: string,
  models: ModelAdapter[]
): Promise<OrchestratorResult[]> {
  const settled = await Promise.allSettled(
    models.map((model) => queryWithRetry(model, prompt))
  );

  return settled.map((result, index) => {
    if (result.status === "fulfilled") {
      return result.value;
    }

    const failedModel = models[index];
    const message =
      result.reason instanceof Error ? result.reason.message : "Unknown error";

    return {
      modelId: failedModel.id,
      modelName: failedModel.name,
      response: null,
      durationMs: 0,
      error: message
    };
  });
}
