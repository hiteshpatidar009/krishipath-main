import { CoreEventBus, EventEnvelopeFactory } from "../../../core";
import { logger } from "../../../infrastructure/logger";
import { ReorderStockPlanningEvents } from "../events/reorder-stock-planning.events";
export class CreateReorderRuleUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(input) {
        const rule = await this.repository.createRule(input);
        await this.publish(ReorderStockPlanningEvents.ruleCreated, rule.id, input.companyId, input.createdBy, { ...rule });
        return rule;
    }
    async publish(name, id, companyId, userId, payload) {
        await CoreEventBus.publish(EventEnvelopeFactory.create({ id, name, source: "reorder-stock-planning", payload, metadata: { companyId, userId } }));
        await logger.info(name, { category: "audit", module: "reorder-stock-planning", action: name, companyId, userId, actorId: userId, payload });
    }
}
export class ListReorderRulesUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    execute(input) {
        return this.repository.listRules(input);
    }
}
export class GenerateReorderRecommendationsUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(input) {
        const result = await this.repository.generateRecommendations(input);
        await CoreEventBus.publish(EventEnvelopeFactory.create({
            id: `${input.companyId}:${Date.now()}`,
            name: ReorderStockPlanningEvents.reorderGenerated,
            source: "reorder-stock-planning",
            payload: result,
            metadata: { companyId: input.companyId, userId: input.actorId },
        }));
        await logger.info("Reorder recommendations generated", {
            category: "user_activity",
            module: "reorder-stock-planning",
            action: ReorderStockPlanningEvents.reorderGenerated,
            companyId: input.companyId,
            userId: input.actorId,
            actorId: input.actorId,
            payload: { generatedCount: result.generatedCount },
        });
        return result;
    }
}
export class ListReorderRecommendationsUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    execute(input) {
        return this.repository.listRecommendations(input);
    }
}
export class ApproveReorderRecommendationUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    execute(input) {
        return this.repository.approveRecommendation(input);
    }
}
export class RejectReorderRecommendationUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    execute(input) {
        return this.repository.rejectRecommendation(input);
    }
}
export class GetReorderPolicySummaryUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    execute(companyId) {
        return this.repository.getPolicySummary(companyId);
    }
}
