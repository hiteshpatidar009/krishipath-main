export class TaxCategory {
    value;
    constructor(value) {
        this.value = value;
        if (!/^[A-Z0-9_-]{2,80}$/.test(value)) {
            throw new Error("Invalid tax category");
        }
    }
}
