export interface RetryOptions {
  readonly attempts: number;
  readonly baseDelayMs: number;
  readonly maxDelayMs?: number;
}

export class RetryEngine {
  public async execute<T>(
    operation: () => Promise<T>,
    options: RetryOptions,
  ): Promise<T> {
    let lastError: unknown;

    for (let attempt = 1; attempt <= options.attempts; attempt += 1) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        if (attempt === options.attempts) {
          break;
        }
        await this.delay(this.delayMs(attempt, options));
      }
    }

    throw lastError;
  }

  private delayMs(attempt: number, options: RetryOptions): number {
    const exponential = options.baseDelayMs * 2 ** (attempt - 1);
    return Math.min(exponential, options.maxDelayMs ?? exponential);
  }

  private async delay(ms: number): Promise<void> {
    await new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }
}
