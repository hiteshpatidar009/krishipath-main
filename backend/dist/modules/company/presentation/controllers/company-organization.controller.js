import { ApiResponse } from "../../../../shared/http/api-response";
import { RequestContext } from "../../../../shared/context/request-context";
import { CompanyValidator } from "../validators/company-organization.validator";
export class CompanyController {
    createTenantUseCase;
    getTenantCreationAllowanceUseCase;
    updateTenantOnboardingUseCase;
    createOrganizationUseCase;
    configureTenantSettingsUseCase;
    configureOrganizationSettingsUseCase;
    assignOrganizationAccessUseCase;
    assignWarehouseAccessUseCase;
    suspendTenantUseCase;
    activateTenantUseCase;
    linkSubscriptionUseCase;
    listAccessibleTenantsUseCase;
    constructor(createTenantUseCase, getTenantCreationAllowanceUseCase, updateTenantOnboardingUseCase, createOrganizationUseCase, configureTenantSettingsUseCase, configureOrganizationSettingsUseCase, assignOrganizationAccessUseCase, assignWarehouseAccessUseCase, suspendTenantUseCase, activateTenantUseCase, linkSubscriptionUseCase, listAccessibleTenantsUseCase) {
        this.createTenantUseCase = createTenantUseCase;
        this.getTenantCreationAllowanceUseCase = getTenantCreationAllowanceUseCase;
        this.updateTenantOnboardingUseCase = updateTenantOnboardingUseCase;
        this.createOrganizationUseCase = createOrganizationUseCase;
        this.configureTenantSettingsUseCase = configureTenantSettingsUseCase;
        this.configureOrganizationSettingsUseCase = configureOrganizationSettingsUseCase;
        this.assignOrganizationAccessUseCase = assignOrganizationAccessUseCase;
        this.assignWarehouseAccessUseCase = assignWarehouseAccessUseCase;
        this.suspendTenantUseCase = suspendTenantUseCase;
        this.activateTenantUseCase = activateTenantUseCase;
        this.linkSubscriptionUseCase = linkSubscriptionUseCase;
        this.listAccessibleTenantsUseCase = listAccessibleTenantsUseCase;
    }
    createTenant = async (request, response) => {
        const auth = RequestContext.auth(request);
        if (!auth?.userId) {
            response.status(401).json({ success: false, message: "Unauthorized" });
            return;
        }
        const input = CompanyValidator.createTenant.parse(request.body);
        ApiResponse.created(response, await this.createTenantUseCase.execute({
            ownerUserId: auth.userId,
            ...input,
        }), "Company created");
    };
    getTenantCreationAllowance = async (request, response) => {
        const auth = RequestContext.auth(request);
        if (!auth?.userId) {
            response.status(401).json({ success: false, message: "Unauthorized" });
            return;
        }
        ApiResponse.ok(response, await this.getTenantCreationAllowanceUseCase.execute(auth.userId), "Company allowance loaded");
    };
    updateOnboarding = async (request, response) => {
        const input = CompanyValidator.onboarding.parse(request.body);
        ApiResponse.ok(response, await this.updateTenantOnboardingUseCase.execute(RequestContext.companyId(request), input.status), "Onboarding progress updated");
    };
    listAccessibleTenants = async (request, response) => {
        const auth = RequestContext.auth(request);
        if (!auth?.userId) {
            response.status(401).json({ success: false, message: "Unauthorized" });
            return;
        }
        ApiResponse.ok(response, await this.listAccessibleTenantsUseCase.execute({
            userId: auth.userId,
            isRoot: auth.isRoot === true || auth.authType === "root",
        }), "Companies loaded");
    };
    createOrganization = async (request, response) => {
        const input = CompanyValidator.createOrganization.parse(request.body);
        const result = await this.createOrganizationUseCase.execute({
            companyId: RequestContext.companyId(request),
            ...input,
            organizationCode: input.organizationCode ?? this.buildOrganizationCode(input.name),
        });
        ApiResponse.created(response, result, "Organization created");
    };
    buildOrganizationCode(name) {
        const normalized = name
            .trim()
            .toUpperCase()
            .replace(/[^A-Z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "")
            .slice(0, 30);
        return normalized.length >= 2 ? normalized : `ORG-${Date.now()}`;
    }
    configureTenantSettings = async (request, response) => {
        const input = CompanyValidator.tenantSettings.parse(request.body);
        const result = await this.configureTenantSettingsUseCase.execute({
            companyId: RequestContext.companyId(request),
            ...input,
        });
        ApiResponse.ok(response, result, "Company settings updated");
    };
    configureOrganizationSettings = async (request, response) => {
        const input = CompanyValidator.organizationSettings.parse(request.body);
        const result = await this.configureOrganizationSettingsUseCase.execute({
            companyId: RequestContext.companyId(request),
            organizationId: String(request.params.organizationId ?? ""),
            ...input,
        });
        ApiResponse.ok(response, result, "Organization settings updated");
    };
    assignOrganizationAccess = async (request, response) => {
        const input = CompanyValidator.scopedAccess.parse(request.body);
        const result = await this.assignOrganizationAccessUseCase.execute({
            companyId: RequestContext.companyId(request),
            assignedBy: RequestContext.userId(request),
            ...input,
        });
        ApiResponse.ok(response, result, "Organization access assigned");
    };
    assignWarehouseAccess = async (request, response) => {
        const input = CompanyValidator.scopedAccess.parse(request.body);
        const result = await this.assignWarehouseAccessUseCase.execute({
            companyId: RequestContext.companyId(request),
            assignedBy: RequestContext.userId(request),
            ...input,
        });
        ApiResponse.ok(response, result, "Warehouse access assigned");
    };
    suspendTenant = async (request, response) => {
        ApiResponse.ok(response, await this.suspendTenantUseCase.execute(RequestContext.companyId(request)), "Company suspended");
    };
    activateTenant = async (request, response) => {
        ApiResponse.ok(response, await this.activateTenantUseCase.execute(RequestContext.companyId(request)), "Company activated");
    };
    linkSubscription = async (request, response) => {
        const input = CompanyValidator.linkSubscription.parse(request.body);
        ApiResponse.ok(response, await this.linkSubscriptionUseCase.execute(RequestContext.companyId(request), input.subscriptionPlanId), "Subscription linked");
    };
}
