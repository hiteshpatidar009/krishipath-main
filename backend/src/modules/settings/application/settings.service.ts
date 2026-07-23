import { randomUUID } from "crypto";
import { CoreEventBus, EventEnvelopeFactory } from "../../../core";
import { logger } from "../../../infrastructure/logger";
import { AppError } from "../../../shared/errors/app.error";
import { SettingsEvents } from "../events/settings.events";
import { SettingsRepository } from "../infrastructure/settings.repository";

export class SettingsService {
  public constructor(private readonly repo: SettingsRepository) {}

  public async resolve(companyId: string) {
    return {
      settings: await this.repo.getTenant(companyId),
      features: await this.repo.listFeatures(companyId),
    };
  }

  public async update(companyId: string, actorId: string, input: Record<string, unknown>) {
    if ("enableAuditExports" in input) {
      throw new AppError("Protected setting cannot be changed here", 403, "PROTECTED_SETTING");
    }
    await this.repo.upsertTenant(companyId, input);
    await this.event(SettingsEvents.updated, companyId, actorId, input);
    return { updated: true };
  }

  public async setFeature(companyId: string, actorId: string, input: { featureKey: string; featureName: string; isEnabled: boolean }) {
    await this.repo.setFeature({ companyId, actorId, ...input });
    await this.event(SettingsEvents.featureUpdated, companyId, actorId, input);
    return { updated: true };
  }

  private async event(name: string, companyId: string, userId: string, payload: Record<string, unknown>): Promise<void> {
    await logger.info(name, { module: "settings", companyId, userId, payload });
    await CoreEventBus.publish(EventEnvelopeFactory.create({ id: randomUUID(), name, source: "settings", payload, metadata: { companyId, userId } }));
  }
}
