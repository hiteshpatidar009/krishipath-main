export class BusinessRuleValidator {
  public requireCompany(companyId?: string): void {
    if (!companyId) {
      throw new Error("Company context required");
    }
  }

  public requireFullAccess(accessLevel?: string): void {
    if (accessLevel !== "full") {
      throw new Error("Full subscription access required");
    }
  }
}
