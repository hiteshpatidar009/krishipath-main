class HierarchyAccessPolicy {
    ensureRequirement(scope, requirement) {
        if (!scope.active) {
            throw new Error("Inactive membership denied");
        }
        const missingRole = requirement?.roles?.some((role) => !(scope.roles ?? []).includes(role));
        if (missingRole) {
            throw new Error("Required role denied");
        }
        const missingPermission = requirement?.permissions?.some((permission) => !(scope.permissions ?? []).includes(permission));
        if (missingPermission) {
            throw new Error("Required permission denied");
        }
    }
}
export class EnterpriseAccessPolicy extends HierarchyAccessPolicy {
    ensureEnterpriseAccess(enterpriseId, memberships, requirement) {
        const membership = memberships.find((scope) => scope.enterpriseId === enterpriseId);
        if (!membership) {
            throw new Error("Enterprise access denied");
        }
        this.ensureRequirement(membership, requirement);
        return membership;
    }
}
export class CompanyAccessPolicy extends HierarchyAccessPolicy {
    ensureCompanyAccess(companyId, memberships, requirement) {
        const membership = memberships.find((scope) => scope.companyId === companyId);
        if (!membership) {
            throw new Error("Company access denied");
        }
        this.ensureRequirement(membership, requirement);
        return membership;
    }
}
export class OrganizationAccessPolicy extends HierarchyAccessPolicy {
    ensureOrganizationAccess(organizationId, organizationMemberships, companyMemberships, requirement) {
        const organization = organizationMemberships.find((scope) => scope.organizationId === organizationId);
        if (!organization) {
            throw new Error("Organization access denied");
        }
        const company = companyMemberships.find((scope) => scope.companyId === organization.companyId);
        if (!company) {
            throw new Error("Organization company access denied");
        }
        this.ensureRequirement(company);
        this.ensureRequirement(organization, requirement);
        return organization;
    }
}
export class WarehouseAccessPolicy extends HierarchyAccessPolicy {
    ensureWarehouseAccess(warehouseId, warehouseMemberships, organizationMemberships, companyMemberships, requirement) {
        const warehouse = warehouseMemberships.find((scope) => scope.warehouseId === warehouseId);
        if (!warehouse) {
            throw new Error("Warehouse access denied");
        }
        const organization = organizationMemberships.find((scope) => scope.organizationId === warehouse.organizationId &&
            scope.companyId === warehouse.companyId);
        if (!organization) {
            throw new Error("Warehouse organization access denied");
        }
        const company = companyMemberships.find((scope) => scope.companyId === warehouse.companyId);
        if (!company) {
            throw new Error("Warehouse company access denied");
        }
        this.ensureRequirement(company);
        this.ensureRequirement(organization);
        this.ensureRequirement(warehouse, requirement);
        return warehouse;
    }
}
export class TenantAccessPolicy {
    companyAccessPolicy = new CompanyAccessPolicy();
    ensureSameTenant(expectedCompanyId, actualCompanyId) {
        this.companyAccessPolicy.ensureCompanyAccess(expectedCompanyId, [
            {
                companyId: actualCompanyId ?? "",
                active: Boolean(actualCompanyId),
            },
        ]);
    }
    ensureWarehouseScope(allowedWarehouseIds, warehouseId) {
        if (!allowedWarehouseIds.includes(warehouseId)) {
            throw new Error("Warehouse access denied");
        }
    }
}
