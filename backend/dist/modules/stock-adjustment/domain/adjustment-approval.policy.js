import { env } from "../../../infrastructure/config/env";
export class AdjustmentApprovalPolicy {
    autoApprovalThreshold;
    constructor(autoApprovalThreshold = env.inventoryAdjustmentAutoApprovalThreshold) {
        this.autoApprovalThreshold = autoApprovalThreshold;
    }
    requiresApproval(quantity) {
        return Math.abs(quantity) > this.autoApprovalThreshold;
    }
    threshold() {
        return this.autoApprovalThreshold;
    }
}
