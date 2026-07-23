import { TaxApprovalStatus } from "../constants/tax.constants";
export class TaxWorkflowService {
    requiresApproval(rule) {
        return rule.requiresApproval && rule.approvalStatus !== TaxApprovalStatus.Approved;
    }
    approvalMetadata(rule) {
        return {
            workflowType: "tax_rule_change",
            entityType: "tax_rule",
            entityId: rule.id,
            ruleCode: rule.ruleCode,
            version: rule.version,
        };
    }
}
