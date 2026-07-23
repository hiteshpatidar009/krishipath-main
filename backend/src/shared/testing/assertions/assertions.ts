import { expect } from "vitest";

export function expectEnterpriseResponse(value: unknown): void {
  expect(value).toBeDefined();
}

export function expectLatencyUnder(durationMs: number, maxMs: number): void {
  expect(durationMs).toBeLessThanOrEqual(maxMs);
}
