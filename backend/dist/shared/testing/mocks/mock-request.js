export function createMockRequestContext(overrides = {}) {
    return {
        requestId: "req-test",
        correlationId: "corr-test",
        companyId: "company-test",
        actorId: "actor-test",
        ...overrides,
    };
}
