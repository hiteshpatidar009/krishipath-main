import { TaxExemptionStatus } from "../../constants/tax.constants";
export class TaxProfileAggregate {
    record;
    constructor(record) {
        this.record = record;
    }
    isExempt() {
        return this.record.exemptionStatus === TaxExemptionStatus.Exempt;
    }
    toRecord() {
        return this.record;
    }
}
