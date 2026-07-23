import { join } from "path";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { registerEnterpriseModuleTests } from "../../shared/testing/enterprise-test-kit";
import { SubscriptionLimitService, PLAN_LIMITS } from "../subscription/application/subscription-limit.service";
import { AppError } from "../../shared/errors/app.error";
import { DashboardModule } from "./module";
import { DashboardService } from "./application/dashboard.service";
import { DashboardRepository } from "./infrastructure/dashboard.repository";
// 1. Register Compliance Tests
registerEnterpriseModuleTests({
    moduleName: "dashboard",
    moduleDir: join(process.cwd(), "src", "modules", "dashboard"),
    ModuleClass: DashboardModule,
    expectedRouteCount: 2, // GET /overview and GET /home
    requiresAuth: true,
});
// 2. Custom Business Logic Tests
describe("DashboardService.home", () => {
    let repository;
    let service;
    const companyId = "00000000-0000-0000-0000-000000000001";
    const userId = "00000000-0000-0000-0000-000000000002";
    beforeEach(() => {
        vi.restoreAllMocks();
        repository = new DashboardRepository();
        service = new DashboardService(repository);
        // Default Mock Implementations
        vi.spyOn(repository, "getCompanyDetails").mockResolvedValue({
            id: companyId,
            name: "Acme Corp",
            code: "ACME",
            status: "active",
            createdAt: new Date(),
            ownerUserId: userId,
            trialStartsAt: new Date(Date.now() - 5 * 86400000),
            trialEndsAt: new Date(Date.now() + 10 * 86400000),
        });
        vi.spyOn(repository, "getActiveSubscription").mockResolvedValue({
            id: "sub-123",
            status: "ACTIVE",
            billingCycle: "monthly",
            startDate: new Date().toISOString().slice(0, 10),
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 86400000),
            nextBillingAt: new Date(Date.now() + 30 * 86400000),
            autoRenew: true,
            createdAt: new Date(),
            planId: "plan-123",
        });
        vi.spyOn(repository, "getPlan").mockResolvedValue({
            id: "plan-123",
            name: "Growth Plan",
            code: "growth",
            supportsApi: true,
            supportsSso: true,
            supportsCustomRoles: true,
            supportsMultiEntity: true,
            supportsAdvancedReporting: true,
            supportsSandbox: false,
        });
        vi.spyOn(repository, "getFeatureFlags").mockResolvedValue([]);
        vi.spyOn(repository, "getNotifications").mockResolvedValue([]);
        vi.spyOn(repository, "getInventoryItemsCount").mockResolvedValue(50);
        vi.spyOn(repository, "getApiCallUsage").mockResolvedValue(2500);
        vi.spyOn(repository, "getDunningRetries").mockResolvedValue([]);
        vi.spyOn(repository, "getOutstandingInvoiceStats").mockResolvedValue({
            unpaidInvoiceCount: 0,
            overdueInvoiceCount: 0,
            outstandingAmount: 0,
            lastPaymentDate: new Date(),
        });
        vi.spyOn(repository, "getPendingApprovalsCount").mockResolvedValue(2);
        vi.spyOn(repository, "getPendingQualityInspectionsCount").mockResolvedValue(1);
        vi.spyOn(repository, "overview").mockResolvedValue({
            summary: { inventoryValue: 120000 },
        });
        // Mock Limit Service counts
        vi.spyOn(SubscriptionLimitService, "getPlanLimits").mockResolvedValue({
            status: "active",
            trialEndsAt: null,
            planCode: "growth",
            limits: PLAN_LIMITS.growth,
        });
        vi.spyOn(SubscriptionLimitService, "getUserCount").mockResolvedValue(5);
        vi.spyOn(SubscriptionLimitService, "getOrganizationCount").mockResolvedValue(2);
        vi.spyOn(SubscriptionLimitService, "getWarehouseCount").mockResolvedValue(1);
        vi.spyOn(SubscriptionLimitService, "getProductCount").mockResolvedValue(100);
        vi.spyOn(SubscriptionLimitService, "getSupplierCount").mockResolvedValue(10);
        vi.spyOn(SubscriptionLimitService, "getCustomerCount").mockResolvedValue(15);
        vi.spyOn(SubscriptionLimitService, "getPurchaseOrderCount").mockResolvedValue(8);
        vi.spyOn(SubscriptionLimitService, "getStorageBytes").mockResolvedValue(1024 * 1024 * 50); // 50MB
    });
    it("handles State 1: Trial Active state", async () => {
        vi.spyOn(SubscriptionLimitService, "getPlanLimits").mockResolvedValue({
            status: "trial",
            trialEndsAt: new Date(Date.now() + 10 * 86400000), // 10 days remaining
            planCode: "free_tier",
            limits: PLAN_LIMITS.free_tier,
        });
        const result = await service.home(companyId, userId);
        expect(result.dashboardState).toBe("trial_active");
        expect(result.trial.isTrial).toBe(true);
        expect(result.trial.daysRemaining).toBe(10);
        expect(result.trial.warningLevel).toBe("none");
        expect(result.quickActions).toContain("continueSetup");
        expect(result.quickActions).toContain("upgradePlan");
        expect(result.restrictions.every((r) => !r.restricted)).toBe(true);
    });
    it("handles State 2: Trial Ending Soon state", async () => {
        vi.spyOn(SubscriptionLimitService, "getPlanLimits").mockResolvedValue({
            status: "trial",
            trialEndsAt: new Date(Date.now() + 5 * 86400000), // 5 days remaining
            planCode: "free_tier",
            limits: PLAN_LIMITS.free_tier,
        });
        const result = await service.home(companyId, userId);
        expect(result.dashboardState).toBe("trial_ending_soon");
        expect(result.trial.daysRemaining).toBe(5);
        expect(result.trial.warningLevel).toBe("warning");
        expect(result.notifications[0].title).toBe("Trial Ending Soon");
        expect(result.restrictions.every((r) => !r.restricted)).toBe(true);
    });
    it("handles State 3: Trial Expired state", async () => {
        vi.spyOn(SubscriptionLimitService, "getPlanLimits").mockResolvedValue({
            status: "trial",
            trialEndsAt: new Date(Date.now() - 1 * 86400000), // Expired 1 day ago
            planCode: "free_tier",
            limits: PLAN_LIMITS.free_tier,
        });
        const result = await service.home(companyId, userId);
        expect(result.dashboardState).toBe("trial_expired");
        expect(result.trial.daysRemaining).toBe(0);
        expect(result.trial.warningLevel).toBe("critical");
        expect(result.notifications[0].title).toBe("Trial Expired");
        // Check locked operational modules
        const inventoryModule = result.restrictions.find((r) => r.module === "inventory");
        expect(inventoryModule.restricted).toBe(true);
        expect(inventoryModule.reason).toContain("expired");
    });
    it("handles State 4: Subscription Active state", async () => {
        const result = await service.home(companyId, userId);
        expect(result.dashboardState).toBe("subscription_active");
        expect(result.trial.isTrial).toBe(false);
        expect(result.subscription.subscriptionStatus).toBe("ACTIVE");
        expect(result.subscription.planName).toBe("Growth Plan");
        expect(result.restrictions.every((r) => !r.restricted)).toBe(true);
    });
    it("handles State 5: Subscription Suspended state", async () => {
        vi.spyOn(SubscriptionLimitService, "getPlanLimits").mockResolvedValue({
            status: "suspended",
            trialEndsAt: null,
            planCode: "growth",
            limits: PLAN_LIMITS.growth,
        });
        vi.spyOn(repository, "getOutstandingInvoiceStats").mockResolvedValue({
            unpaidInvoiceCount: 2,
            overdueInvoiceCount: 1,
            outstandingAmount: 250,
            lastPaymentDate: new Date(Date.now() - 35 * 86400000),
        });
        vi.spyOn(repository, "getDunningRetries").mockResolvedValue([
            { id: "r1", attemptNumber: 1, status: "FAILED", scheduledAt: new Date(Date.now() - 2 * 86400000), processedAt: new Date(), failureReason: "Declined" },
            { id: "r2", attemptNumber: 2, status: "SCHEDULED", scheduledAt: new Date(Date.now() + 2 * 86400000), processedAt: null, failureReason: null }
        ]);
        const result = await service.home(companyId, userId);
        expect(result.dashboardState).toBe("subscription_suspended");
        expect(result.billing.unpaidInvoiceCount).toBe(2);
        expect(result.billing.overdueInvoiceCount).toBe(1);
        expect(result.billing.outstandingAmount).toBe(250);
        expect(result.subscription.outstandingAmount).toBe(250);
        expect(result.notifications[0].title).toBe("Subscription Suspended");
        expect(result.quickActions).toContain("payOutstandingBalance");
        expect(result.quickActions).not.toContain("createWarehouse");
        // Timeline check
        expect(result.timeline.dunningTimeline.length).toBeGreaterThan(0);
        const retryAttempt = result.timeline.dunningTimeline.find((t) => t.id === "r2");
        expect(retryAttempt.status).toBe("upcoming");
    });
    it("enforces company isolation and throws 404 if company does not exist", async () => {
        vi.spyOn(repository, "getCompanyDetails").mockResolvedValue(null);
        await expect(service.home(companyId, userId))
            .rejects.toThrowError(new AppError("Company not found", 404, "COMPANY_NOT_FOUND"));
    });
    it("handles empty company data correctly with 0 percentages", async () => {
        vi.spyOn(SubscriptionLimitService, "getUserCount").mockResolvedValue(0);
        vi.spyOn(repository, "getInventoryItemsCount").mockResolvedValue(0);
        vi.spyOn(repository, "getApiCallUsage").mockResolvedValue(0);
        vi.spyOn(SubscriptionLimitService, "getStorageBytes").mockResolvedValue(0);
        const result = await service.home(companyId, userId);
        expect(result.usage.usersUsed).toBe(0);
        expect(result.usage.usersPercentage).toBe(0);
        expect(result.usage.inventoryItemsUsed).toBe(0);
        expect(result.usage.inventoryItemsPercentage).toBe(0);
        expect(result.usage.apiCallsUsed).toBe(0);
        expect(result.usage.apiCallsPercentage).toBe(0);
        expect(result.usage.storageUsed).toBe(0);
        expect(result.usage.storagePercentage).toBe(0);
    });
    it("caps usage percentages at 100 under large datasets or limit overflows", async () => {
        vi.spyOn(SubscriptionLimitService, "getUserCount").mockResolvedValue(1000); // Limit is 100 in growth
        vi.spyOn(repository, "getInventoryItemsCount").mockResolvedValue(120000); // Limit is 100000 in growth
        const result = await service.home(companyId, userId);
        expect(result.usage.usersPercentage).toBe(100);
        expect(result.usage.inventoryItemsPercentage).toBe(100);
    });
});
