import { AppError } from "../../../../shared/errors/app.error";
import { TAX_EVENTS } from "../../events";
export class DeactivateTaxRuleUseCase {
    repository;
    events;
    constructor(repository, events) {
        this.repository = repository;
        this.events = events;
    }
    async execute(id, context) {
        const updated = await this.repository.deactivateRule(context.companyId, id, context.userId ?? null);
        if (!updated) {
            throw new AppError("Tax rule not found", 404, "TAX_RULE_NOT_FOUND");
        }
        await this.events.publish(TAX_EVENTS.RuleDeactivated, { rule: updated }, context);
        return updated;
    }
}
