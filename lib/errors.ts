export class LLMError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "LLMError";
  }
}

export class ExtractionError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "ExtractionError";
  }
}

export class DatabaseError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "DatabaseError";
  }
}

export class TimeoutError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "TimeoutError";
  }
}

export async function wrapWithTimeout<T>(
  promise: Promise<T>,
  ms: number,
  label: string
): Promise<T> {
  let timer: NodeJS.Timeout | undefined;

  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => {
          reject(new TimeoutError(`${label} timed out after ${ms}ms`));
        }, ms);
      })
    ]);
  } catch (error) {
    if (error instanceof TimeoutError) {
      throw error;
    }

    throw new LLMError(`${label} failed`, { cause: error });
  } finally {
    if (timer) {
      clearTimeout(timer);
    }
  }
}

export async function safeRun<T>(
  fn: () => Promise<T>,
  fallback: T,
  errorLabel: string
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    console.error(
      `[${errorLabel}]`,
      error instanceof Error ? error.message : "Unknown error",
      error
    );

    return fallback;
  }
}
