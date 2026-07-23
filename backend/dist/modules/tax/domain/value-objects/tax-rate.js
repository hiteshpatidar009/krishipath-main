export class TaxRate {
    value;
    constructor(value) {
        this.value = value;
        const numberValue = Number(value);
        if (!Number.isFinite(numberValue) || numberValue < 0 || numberValue > 100) {
            throw new Error("Invalid tax rate");
        }
    }
}
