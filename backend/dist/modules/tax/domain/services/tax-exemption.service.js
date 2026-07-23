import { TaxExemptionStatus } from "../../constants/tax.constants";
export class TaxExemptionService {
    hasFullExemption(profiles) {
        return profiles.some((profile) => profile.exemptionStatus === TaxExemptionStatus.Exempt);
    }
}
