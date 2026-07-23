export class TaxJurisdictionAggregate {
    record;
    constructor(record) {
        this.record = record;
    }
    matches(code) {
        return this.record.jurisdictionCode === code;
    }
    toRecord() {
        return this.record;
    }
}
