export async function runParallel<T>(
  count: number,
  runner: (index: number) => Promise<T> | T,
): Promise<readonly T[]> {
  return Promise.all(Array.from({ length: count }, (_, index) => runner(index)));
}

export function hasSingleResult<T>(values: readonly T[]): boolean {
  return new Set(values).size === 1;
}
