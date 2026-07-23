import { TaxRuleStatus } from "../../constants/tax.constants";
export class TaxRuleAggregate {
    record;
    constructor(record) {
        this.record = record;
    }
    canCalculateAt(date) {
        return this.record.status === TaxRuleStatus.Active
            && this.record.effectiveFrom <= date
            && (!this.record.effectiveTo || this.record.effectiveTo >= date);
    }
    toRecord() {
        return this.record;
    }
}
