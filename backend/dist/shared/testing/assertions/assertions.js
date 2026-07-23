import { expect } from "vitest";
export function expectEnterpriseResponse(value) {
    expect(value).toBeDefined();
}
export function expectLatencyUnder(durationMs, maxMs) {
    expect(durationMs).toBeLessThanOrEqual(maxMs);
}
