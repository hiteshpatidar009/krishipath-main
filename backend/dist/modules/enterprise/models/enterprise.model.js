export class EnterpriseModel {
    record;
    constructor(record) {
        this.record = record;
    }
    static from(record) {
        return new EnterpriseModel(record);
    }
    id() {
        return this.record.id;
    }
    status() {
        return this.record.status;
    }
    isActive() {
        return this.record.status === "ACTIVE";
    }
    toJSON() {
        return this.record;
    }
}
