import { CoreEventBus, EventEnvelopeFactory } from "../../../../core";
import { AppError } from "../../../../shared/errors/app.error";
import { CompanyEvents } from "../../events/company-organization.events";
import { SubscriptionLimitService } from "../../../subscription";
export class CreateTenantUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(input) {
        const companyName = input.companyName.trim();
        if (!companyName) {
            throw new AppError("Company name is required", 400, "TENANT_NAME_REQUIRED");
        }
        const existingCompany = await this.repository.findOwnedTenantByName(input.ownerUserId, companyName);
        if (existingCompany) {
            throw new AppError("Company already exists for this account", 409, "TENANT_ALREADY_EXISTS");
        }
        const sanitizedInput = { ...input, companyName };
        await SubscriptionLimitService.assertCanCreateCompany(sanitizedInput.ownerUserId);
        const allowance = await this.repository.getTenantCreationAllowance(sanitizedInput.ownerUserId);
        if (!allowance.canCreate) {
            throw new AppError("Company limit reached for current plan", 403, "TENANT_PLAN_LIMIT_REACHED");
        }
        let company;
        try {
            company = await this.repository.createTenant(sanitizedInput);
        }
        catch (error) {
            if (this.isUniqueViolation(error)) {
                const existing = await this.repository.findOwnedTenantByName(sanitizedInput.ownerUserId, companyName);
                if (existing) {
                    return {
                        ...existing,
                        status: "pending_subscription",
                        companyUsage: {
                            current: allowance.currentCount,
                            maximum: allowance.maximumCount,
                            canCreateMore: allowance.currentCount < allowance.maximumCount,
                        },
                        replayed: true,
                        nextStep: "select_plan",
                    };
                }
            }
            throw error;
        }
        const subscriptionPlanId = await this.repository.findCurrentSubscriptionPlanId(sanitizedInput.ownerUserId);
        if (subscriptionPlanId) {
            await this.repository.linkSubscription(company.companyId, subscriptionPlanId);
        }
        await CoreEventBus.publish(EventEnvelopeFactory.create({
            id: company.companyId,
            name: CompanyEvents.tenantCreated,
            source: "company",
            payload: company,
            metadata: { companyId: company.companyId, userId: sanitizedInput.ownerUserId },
        }));
        return {
            ...company,
            companyUsage: {
                current: allowance.currentCount + 1,
                maximum: allowance.maximumCount,
                canCreateMore: allowance.currentCount + 1 < allowance.maximumCount,
            },
            nextStep: "select_plan",
        };
    }
    isUniqueViolation(error) {
        return (typeof error === "object" &&
            error !== null &&
            "code" in error &&
            error.code === "23505");
    }
}
export class GetTenantCreationAllowanceUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    execute(userId) {
        return this.repository.getTenantCreationAllowance(userId);
    }
}
export class UpdateTenantOnboardingUseCase {
    repository;
    static statuses = new Set([
        "tenant_created",
        "plan_selected",
        "organization_configured",
        "warehouse_configured",
        "roles_configured",
        "invitations_configured",
        "active",
    ]);
    constructor(repository) {
        this.repository = repository;
    }
    async execute(companyId, status) {
        if (!UpdateTenantOnboardingUseCase.statuses.has(status)) {
            throw new AppError("Invalid onboarding status", 400, "INVALID_ONBOARDING_STATUS");
        }
        await this.repository.updateOnboardingStatus(companyId, status);
        return { onboardingStatus: status };
    }
}
export class ListAccessibleTenantsUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(input) {
        const items = await this.repository.listAccessibleTenants(input.userId, input.isRoot);
        const companyUsage = await this.repository.getTenantCreationAllowance(input.userId);
        return {
            items,
            total: items.length,
            companyUsage: {
                current: companyUsage.currentCount,
                maximum: companyUsage.maximumCount,
                canCreate: companyUsage.canCreate,
            },
        };
    }
}
export class CreateOrganizationUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(input) {
        await SubscriptionLimitService.assertCanCreateOrganization(input.companyId);
        await this.requireCompany(input.companyId);
        const duplicate = await this.repository.findOrganizationByNameOrCode(input.companyId, input.name, input.organizationCode);
        if (duplicate) {
            throw new AppError("Organization already exists for this company", 409, "ORGANIZATION_ALREADY_EXISTS");
        }
        const result = await this.repository.createOrganization(input);
        await CoreEventBus.publish(EventEnvelopeFactory.create({
            id: result.organizationId,
            name: CompanyEvents.organizationCreated,
            source: "company",
            payload: result,
            metadata: { companyId: input.companyId },
        }));
        await SubscriptionLimitService.checkOrganizationLimit(input.companyId, "");
        return result;
    }
    async requireCompany(companyId) {
        const company = await this.repository.findTenantById(companyId);
        if (!company) {
            throw new AppError("Company not found", 404, "TENANT_NOT_FOUND");
        }
    }
}
export class ConfigureTenantSettingsUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(input) {
        await SubscriptionLimitService.assertCanUpdate(input.companyId);
        await this.repository.configureTenantSettings(input);
        await CoreEventBus.publish(EventEnvelopeFactory.create({
            id: input.companyId,
            name: CompanyEvents.tenantSettingsUpdated,
            source: "company",
            payload: input,
            metadata: { companyId: input.companyId },
        }));
        return { updated: true };
    }
}
export class ConfigureOrganizationSettingsUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(input) {
        await SubscriptionLimitService.assertCanUpdate(input.companyId);
        await this.repository.configureOrganizationSettings(input);
        await CoreEventBus.publish(EventEnvelopeFactory.create({
            id: input.organizationId,
            name: CompanyEvents.organizationUpdated,
            source: "company",
            payload: input,
            metadata: { companyId: input.companyId },
        }));
        return { updated: true };
    }
}
export class AssignOrganizationAccessUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(input) {
        await SubscriptionLimitService.assertCanUpdate(input.companyId);
        await this.repository.assignScopedAccess(input);
        return { assigned: true };
    }
}
export class AssignWarehouseAccessUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(input) {
        await SubscriptionLimitService.assertCanUpdate(input.companyId);
        if (!input.warehouseId) {
            throw new AppError("Warehouse id required", 400, "WAREHOUSE_ID_REQUIRED");
        }
        await this.repository.assignScopedAccess(input);
        await CoreEventBus.publish(EventEnvelopeFactory.create({
            id: input.warehouseId,
            name: CompanyEvents.warehouseAccessAssigned,
            source: "company",
            payload: input,
            metadata: { companyId: input.companyId, userId: input.assignedBy },
        }));
        return { assigned: true };
    }
}
export class SuspendTenantUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(companyId) {
        await this.repository.setTenantStatus(companyId, "suspended");
        await CoreEventBus.publish(EventEnvelopeFactory.create({
            id: companyId,
            name: CompanyEvents.tenantSuspended,
            source: "company",
            payload: { companyId },
            metadata: { companyId },
        }));
        return { suspended: true };
    }
}
export class ActivateTenantUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(companyId) {
        await this.repository.setTenantStatus(companyId, "active");
        return { activated: true };
    }
}
export class LinkSubscriptionUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(companyId, subscriptionPlanId) {
        await this.repository.linkSubscription(companyId, subscriptionPlanId);
        return { linked: true };
    }
}
