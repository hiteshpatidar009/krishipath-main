export class OrganizationStatus {
    value;
    constructor(value) {
        this.value = value;
    }
    static active() {
        return new OrganizationStatus("active");
    }
    static from(value) {
        if (value !== "active" && value !== "inactive" && value !== "suspended") {
            throw new Error("Invalid organization status");
        }
        return new OrganizationStatus(value);
    }
    toString() {
        return this.value;
    }
}
