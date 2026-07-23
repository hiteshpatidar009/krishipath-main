import { TAX_DEFAULTS } from "../../constants/tax.constants";
import { TaxCalculationService, TaxJurisdictionResolver } from "../../domain/services";
import { TAX_EVENTS } from "../../events";
export class CalculateTaxUseCase {
    repository;
    events;
    calculator = new TaxCalculationService();
    jurisdictionResolver = new TaxJurisdictionResolver();
    constructor(repository, events) {
        this.repository = repository;
        this.events = events;
    }
    async execute(input, context) {
        const result = await this.calculate(input, context);
        const snapshot = await this.repository.createSnapshot(result, context.userId ?? null);
        const finalResult = { ...result, calculationId: snapshot.id };
        await this.events.publish(TAX_EVENTS.Calculated, { result: finalResult }, context);
        return finalResult;
    }
    async calculate(input, context) {
        const jurisdictionCode = this.jurisdictionResolver.resolve(input);
        const categories = [...new Set(input.lines.map((line) => line.taxCategory ?? TAX_DEFAULTS.generalCategory))];
        const effectiveDate = input.transactionDate ?? new Date();
        const rules = await this.repository.findApplicableRules({
            companyId: context.companyId,
            organizationId: input.organizationId ?? context.organizationId ?? null,
            jurisdictionCode,
            taxCategories: categories,
            effectiveDate,
            appliesTo: String(input.sourceModule),
        });
        const profiles = await this.repository.findProfiles({
            companyId: context.companyId,
            organizationId: input.organizationId ?? context.organizationId ?? undefined,
            customerId: input.customerId,
            supplierId: input.supplierId,
        });
        return this.calculator.calculate({ ...input, companyId: context.companyId, jurisdictionCode, transactionDate: effectiveDate }, rules, profiles);
    }
}
