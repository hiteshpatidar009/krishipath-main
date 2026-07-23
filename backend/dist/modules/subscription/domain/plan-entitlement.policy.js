export class PlanEntitlementPolicy {
    canCreateEnterprise(limits, usage) {
        return this.isActive(limits) && this.withinLimit(limits.maxEnterprises, usage.enterprises);
    }
    canCreateCompany(limits, usage) {
        return (this.isActive(limits) &&
            (this.withinLimit(limits.maxCompaniesPerEnterprise, usage.companiesInEnterprise) ||
                this.withinLimit(limits.maxStandaloneCompanies, usage.standaloneCompanies)));
    }
    canCreateOrganization(limits, usage) {
        return (this.isActive(limits) &&
            this.withinLimit(limits.maxOrganizationsPerCompany, usage.organizationsInCompany));
    }
    canCreateWarehouse(limits, usage) {
        return (this.isActive(limits) &&
            this.withinLimit(limits.maxWarehousesPerOrganization, usage.warehousesInOrganization));
    }
    canInviteUser(limits, usage) {
        return this.isActive(limits) && this.withinLimit(limits.maxUsers, usage.users);
    }
    canUseFeature(limits, featureKey) {
        return this.isActive(limits) && Boolean(limits.features?.[featureKey]);
    }
    withinLimit(limit, currentUsage) {
        return limit === null || limit === undefined || currentUsage < limit;
    }
    isActive(limits) {
        const status = limits.status?.toUpperCase();
        if (status && !["ACTIVE", "TRIALING"].includes(status)) {
            return false;
        }
        const now = Date.now();
        const subscriptionActive = status === "ACTIVE" && (!limits.subscriptionEndsAt || limits.subscriptionEndsAt.getTime() > now);
        const trialActive = limits.trialEndsAt ? limits.trialEndsAt.getTime() > now : false;
        return status ? subscriptionActive || trialActive : true;
    }
}
