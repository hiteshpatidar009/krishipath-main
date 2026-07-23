import { AppError } from "../../../shared/errors/app.error";
const STEPS = [
    { key: "organization", completionStatus: "organization_configured" },
    { key: "warehouse", completionStatus: "warehouse_configured" },
    { key: "roles", completionStatus: "roles_configured" },
    { key: "invitations", completionStatus: "invitations_configured" },
];
export class SetupWizardService {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async status(companyId) {
        const onboardingStatus = await this.repository.getStatus(companyId);
        const completedIndex = onboardingStatus === "active"
            ? STEPS.length
            : STEPS.findIndex((step) => step.completionStatus === onboardingStatus) + 1;
        return {
            visible: onboardingStatus !== "active",
            onboardingStatus,
            currentStep: completedIndex >= STEPS.length ? null : STEPS[Math.max(completedIndex, 0)]?.key ?? null,
            steps: STEPS.map((step, index) => ({
                key: step.key,
                completed: onboardingStatus === "active" || index < completedIndex,
            })),
        };
    }
    async progress(companyId, step) {
        const configured = STEPS.find((item) => item.key === step);
        if (!configured) {
            throw new AppError("Invalid setup wizard step", 400, "INVALID_SETUP_WIZARD_STEP");
        }
        await this.repository.updateStatus(companyId, configured.completionStatus);
        return this.status(companyId);
    }
    async complete(companyId) {
        await this.repository.updateStatus(companyId, "active");
        return this.status(companyId);
    }
}
