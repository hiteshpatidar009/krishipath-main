import { AppError } from "../../../../shared/errors/app.error";
import { TAX_EVENTS } from "../../events";
export class UpdateTaxRuleUseCase {
    repository;
    events;
    constructor(repository, events) {
        this.repository = repository;
        this.events = events;
    }
    async execute(id, dto, context) {
        const existing = await this.repository.findRuleById(context.companyId, id);
        if (!existing) {
            throw new AppError("Tax rule not found", 404, "TAX_RULE_NOT_FOUND");
        }
        const updated = await this.repository.updateRule(context.companyId, id, {
            ...dto,
            updatedBy: context.userId ?? null,
        });
        if (!updated) {
            throw new AppError("Tax rule update failed", 409, "TAX_RULE_UPDATE_FAILED");
        }
        await this.events.publish(TAX_EVENTS.RuleUpdated, { before: existing, after: updated }, context);
        return updated;
    }
}
