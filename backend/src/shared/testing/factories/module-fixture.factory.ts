export interface ModuleFixture {
  readonly companyId: string;
  readonly organizationId: string;
  readonly warehouseId: string;
  readonly actorId: string;
}

export function createModuleFixture(overrides: Partial<ModuleFixture> = {}): ModuleFixture {
  return {
    companyId: "11111111-1111-4111-8111-111111111111",
    organizationId: "22222222-2222-4222-8222-222222222222",
    warehouseId: "33333333-3333-4333-8333-333333333333",
    actorId: "44444444-4444-4444-8444-444444444444",
    ...overrides,
  };
}
