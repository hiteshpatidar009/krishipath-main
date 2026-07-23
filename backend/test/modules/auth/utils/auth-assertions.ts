import { expect } from "vitest";
import { AxiosResponse } from "axios";

export function expectStatus(
  response: AxiosResponse,
  expected: number | readonly number[],
): void {
  const allowed = Array.isArray(expected) ? expected : [expected];
  expect(allowed).toContain(response.status);
}

export function expectSuccess(response: AxiosResponse): void {
  expect(response.status).toBeGreaterThanOrEqual(200);
  expect(response.status).toBeLessThan(300);
  expect(response.data?.success).toBe(true);
}

export function expectBlocked(response: AxiosResponse): void {
  expect(response.status).toBeGreaterThanOrEqual(400);
  expect(response.status).toBeLessThan(500);
}

export function responseData<T = Record<string, unknown>>(
  response: AxiosResponse,
): T {
  return (response.data?.data ?? response.data) as T;
}

export function expectField<T extends Record<string, unknown>>(
  value: T,
  key: keyof T,
): void {
  expect(value[key]).toBeTruthy();
}
