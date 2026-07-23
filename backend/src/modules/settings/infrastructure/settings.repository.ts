import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { Db1Connection } from "../../../infrastructure/database";
import { companyFeatureFlagsTable, companySettingsTable } from "../../../infrastructure/database/postgres/schemas/db1";

export class SettingsRepository {
  public async getTenant(companyId: string) {
    const rows = await Db1Connection.getInstance().select().from(companySettingsTable).where(eq(companySettingsTable.companyId, companyId)).limit(1);
    return rows[0] ?? null;
  }

  public async upsertTenant(companyId: string, input: Record<string, unknown>): Promise<void> {
    const existing = await this.getTenant(companyId);
    const now = new Date();
    if (existing) {
      await Db1Connection.getInstance().update(companySettingsTable).set({ ...input, updatedAt: now }).where(eq(companySettingsTable.companyId, companyId));
      return;
    }
    await Db1Connection.getInstance().insert(companySettingsTable).values({ id: randomUUID(), companyId, ...input, createdAt: now, updatedAt: now });
  }

  public async listFeatures(companyId: string) {
    return Db1Connection.getInstance().select().from(companyFeatureFlagsTable).where(eq(companyFeatureFlagsTable.companyId, companyId));
  }

  public async setFeature(input: { companyId: string; featureKey: string; featureName: string; isEnabled: boolean; actorId: string }): Promise<void> {
    await Db1Connection.getInstance().insert(companyFeatureFlagsTable).values({
      id: randomUUID(),
      companyId: input.companyId,
      featureKey: input.featureKey,
      featureName: input.featureName,
      isEnabled: input.isEnabled,
      enabledBy: input.actorId,
      createdAt: new Date(),
    });
  }
}
