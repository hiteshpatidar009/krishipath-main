export class TaxAmount {
    value;
    currencyCode;
    constructor(value, currencyCode) {
        this.value = value;
        this.currencyCode = currencyCode;
        if (!/^\d+(\.\d{1,4})?$/.test(value)) {
            throw new Error("Invalid tax amount");
        }
    }
}
