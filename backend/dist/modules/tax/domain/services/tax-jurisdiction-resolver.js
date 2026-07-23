import { TAX_DEFAULTS } from "../../constants/tax.constants";
export class TaxJurisdictionResolver {
    resolve(input) {
        return input.jurisdictionCode
            ?? input.buyerJurisdictionCode
            ?? input.sellerJurisdictionCode
            ?? TAX_DEFAULTS.defaultJurisdictionCode;
    }
}
