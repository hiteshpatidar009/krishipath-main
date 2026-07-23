import { AppError } from "../../../../shared/errors/app.error";
import { TaxApprovalStatus, TaxRuleType } from "../../constants/tax.constants";
export class TaxValidationService {
    validateRuleForActivation(rule) {
        if (rule.requiresApproval && rule.approvalStatus !== TaxApprovalStatus.Approved) {
            throw new AppError("Tax rule requires approval", 422, "TAX_RULE_APPROVAL_REQUIRED");
        }
        if (rule.taxType === TaxRuleType.Percentage && rule.ratePercent === null) {
            throw new AppError("Percentage tax requires rate", 422, "TAX_RATE_REQUIRED");
        }
        if (rule.taxType === TaxRuleType.Fixed && rule.fixedAmount === null) {
            throw new AppError("Fixed tax requires amount", 422, "TAX_FIXED_AMOUNT_REQUIRED");
        }
    }
}
