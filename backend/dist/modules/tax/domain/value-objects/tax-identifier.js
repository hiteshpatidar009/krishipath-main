export class TaxIdentifier {
    value;
    constructor(value) {
        this.value = value;
        if (value.trim().length < 3 || value.trim().length > 120) {
            throw new Error("Invalid tax identifier");
        }
    }
}
