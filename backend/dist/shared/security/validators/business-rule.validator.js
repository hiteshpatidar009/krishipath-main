export class BusinessRuleValidator {
    requireCompany(companyId) {
        if (!companyId) {
            throw new Error("Company context required");
        }
    }
    requireFullAccess(accessLevel) {
        if (accessLevel !== "full") {
            throw new Error("Full subscription access required");
        }
    }
}
