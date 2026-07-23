import { randomUUID } from "crypto";
import { CoreEventBus, EventEnvelopeFactory } from "../../../core";
import { logger } from "../../../infrastructure/logger";
import { ApiKeyEvents } from "../events/api-key.events";
import { SubscriptionLimitService } from "../../subscription";
export class ApiKeyService {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async create(companyId, userId, input) {
        await SubscriptionLimitService.assertCanCreateApiKey(companyId);
        const result = await this.repo.create({ companyId, userId, keyName: input.keyName, scopes: input.scopes, expiresAt: input.expiresAt ? new Date(input.expiresAt) : undefined });
        await this.event(ApiKeyEvents.created, companyId, userId, { apiKeyId: result.apiKeyId });
        await SubscriptionLimitService.checkApiKeyLimit(companyId, userId);
        return result;
    }
    list(companyId) {
        return this.repo.list(companyId);
    }
    async rotate(companyId, userId, apiKeyId, input) {
        await SubscriptionLimitService.assertCanUpdate(companyId);
        await this.repo.revoke(companyId, apiKeyId);
        const result = await this.create(companyId, userId, input);
        await this.event(ApiKeyEvents.rotated, companyId, userId, { oldApiKeyId: apiKeyId, newApiKeyId: result.apiKeyId });
        return result;
    }
    async revoke(companyId, userId, apiKeyId) {
        await SubscriptionLimitService.assertCanUpdate(companyId);
        await this.repo.revoke(companyId, apiKeyId);
        await this.event(ApiKeyEvents.revoked, companyId, userId, { apiKeyId });
        return { revoked: true };
    }
    async event(name, companyId, userId, payload) {
        await logger.info(name, { module: "api-key", companyId, userId, payload, tags: ["api-key", "security"] });
        await CoreEventBus.publish(EventEnvelopeFactory.create({ id: randomUUID(), name, source: "api-key", payload, metadata: { companyId, userId } }));
    }
}
