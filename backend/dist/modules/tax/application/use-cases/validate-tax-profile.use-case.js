import { AppError } from "../../../../shared/errors/app.error";
export class ValidateTaxProfileUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(ownerType, ownerId, context) {
        const profile = await this.repository.findProfile(context.companyId, ownerType, ownerId);
        if (!profile) {
            return { valid: false, profile: null, issues: ["TAX_PROFILE_MISSING"] };
        }
        const issues = [];
        if (!profile.jurisdictionCode)
            issues.push("JURISDICTION_MISSING");
        if (!profile.taxCategory)
            issues.push("TAX_CATEGORY_MISSING");
        if (!profile.taxIdentifier && !profile.taxRegistrationNumber && !profile.gstNumber && !profile.vatNumber) {
            issues.push("TAX_IDENTIFIER_MISSING");
        }
        return { valid: issues.length === 0, profile, issues };
    }
    assertValid(result) {
        if (!result.valid) {
            throw new AppError("Tax profile validation failed", 422, "TAX_PROFILE_INVALID");
        }
    }
}
