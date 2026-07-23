import { TaxApprovalStatus, TaxRuleStatus } from "../../constants/tax.constants";
import { TAX_EVENTS } from "../../events";
import { TaxValidationService } from "../../domain/services";
export class CreateTaxRuleUseCase {
    repository;
    events;
    validator = new TaxValidationService();
    constructor(repository, events) {
        this.repository = repository;
        this.events = events;
    }
    async execute(dto, context) {
        const requestedStatus = dto.status;
        const created = await this.repository.createRule({
            ...dto,
            companyId: dto.companyId ?? context.companyId,
            organizationId: dto.organizationId ?? context.organizationId ?? null,
            approvalStatus: dto.requiresApproval ? TaxApprovalStatus.PendingApproval : dto.approvalStatus,
            status: dto.requiresApproval ? TaxRuleStatus.Inactive : requestedStatus,
            createdBy: context.userId ?? null,
            updatedBy: context.userId ?? null,
        });
        if (created.status === TaxRuleStatus.Active) {
            this.validator.validateRuleForActivation(created);
        }
        await this.events.publish(TAX_EVENTS.RuleCreated, { rule: created }, context);
        return created;
    }
}
