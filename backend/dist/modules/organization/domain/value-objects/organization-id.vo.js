export class OrganizationId {
    value;
    constructor(value) {
        this.value = value;
    }
    static create(value) {
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) {
            throw new Error("Invalid organization id");
        }
        return new OrganizationId(value);
    }
    toString() {
        return this.value;
    }
}
