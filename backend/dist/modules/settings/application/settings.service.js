import { randomUUID } from "crypto";
import { CoreEventBus, EventEnvelopeFactory } from "../../../core";
import { logger } from "../../../infrastructure/logger";
import { AppError } from "../../../shared/errors/app.error";
import { SettingsEvents } from "../events/settings.events";
export class SettingsService {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async resolve(companyId) {
        return {
            settings: await this.repo.getTenant(companyId),
            features: await this.repo.listFeatures(companyId),
        };
    }
    async update(companyId, actorId, input) {
        if ("enableAuditExports" in input) {
            throw new AppError("Protected setting cannot be changed here", 403, "PROTECTED_SETTING");
        }
        await this.repo.upsertTenant(companyId, input);
        await this.event(SettingsEvents.updated, companyId, actorId, input);
        return { updated: true };
    }
    async setFeature(companyId, actorId, input) {
        await this.repo.setFeature({ companyId, actorId, ...input });
        await this.event(SettingsEvents.featureUpdated, companyId, actorId, input);
        return { updated: true };
    }
    async event(name, companyId, userId, payload) {
        await logger.info(name, { module: "settings", companyId, userId, payload });
        await CoreEventBus.publish(EventEnvelopeFactory.create({ id: randomUUID(), name, source: "settings", payload, metadata: { companyId, userId } }));
    }
}
