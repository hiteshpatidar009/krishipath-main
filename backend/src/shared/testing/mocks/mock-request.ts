export interface MockRequestContext {
  readonly requestId: string;
  readonly correlationId: string;
  readonly companyId: string;
  readonly actorId: string;
}

export function createMockRequestContext(
  overrides: Partial<MockRequestContext> = {},
): MockRequestContext {
  return {
    requestId: "req-test",
    correlationId: "corr-test",
    companyId: "company-test",
    actorId: "actor-test",
    ...overrides,
  };
}
