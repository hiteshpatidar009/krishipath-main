import { performance } from "perf_hooks";

export async function measureDuration<T>(runner: () => Promise<T> | T): Promise<{
  readonly value: T;
  readonly durationMs: number;
}> {
  const started = performance.now();
  const value = await runner();
  return {
    value,
    durationMs: performance.now() - started,
  };
}
