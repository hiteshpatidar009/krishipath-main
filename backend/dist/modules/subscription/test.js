import { describe, expect, it, vi, beforeEach } from "vitest";
import { SubscriptionModule } from "./module";
import { SubscriptionValidator } from "./presentation/subscription.validator";
import { SubscriptionLimitService, PLAN_LIMITS } from "./application/subscription-limit.service";
import { Db1Connection } from "../../infrastructure/database";
describe("subscription module", () => {
    it("exposes router", () => {
        expect(new SubscriptionModule().getRouter()).toBeDefined();
    });
    it("validates subscription creation", () => {
        const payload = SubscriptionValidator.create.parse({
            subscriptionPlanId: "00000000-0000-4000-8000-000000000001",
            billingCycle: "monthly",
        });
        expect(payload.billingCycle).toBe("monthly");
    });
    it("rejects invalid trial days", () => {
        expect(() => SubscriptionValidator.create.parse({
            subscriptionPlanId: "00000000-0000-4000-8000-000000000001",
            billingCycle: "trial",
            trialDays: 365,
        })).toThrow();
    });
});
describe("SubscriptionLimitService", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });
    it("gating active subscription validation", async () => {
        vi.spyOn(SubscriptionLimitService, "getPlanLimits").mockResolvedValue({
            status: "expired",
            trialEndsAt: new Date(Date.now() - 10000),
            planCode: "free_tier",
            limits: PLAN_LIMITS["free_tier"],
        });
        await expect(SubscriptionLimitService.assertCanCreateUser("company-1"))
            .rejects.toThrowError("Subscription expired");
    });
    it("enforcing plan limits", async () => {
        vi.spyOn(SubscriptionLimitService, "getPlanLimits").mockResolvedValue({
            status: "active",
            trialEndsAt: null,
            planCode: "free_tier",
            limits: PLAN_LIMITS["free_tier"],
        });
        vi.spyOn(SubscriptionLimitService, "getUserCount").mockResolvedValue(10);
        await expect(SubscriptionLimitService.assertCanCreateUser("company-1"))
            .rejects.toThrowError("User limit reached");
    });
    it("allowing creation under limits", async () => {
        vi.spyOn(SubscriptionLimitService, "getPlanLimits").mockResolvedValue({
            status: "active",
            trialEndsAt: null,
            planCode: "free_tier",
            limits: PLAN_LIMITS["free_tier"],
        });
        vi.spyOn(SubscriptionLimitService, "getUserCount").mockResolvedValue(1);
        await expect(SubscriptionLimitService.assertCanCreateUser("company-1"))
            .resolves.not.toThrow();
    });
    it("blocks company creation if subscription is not active", async () => {
        vi.spyOn(SubscriptionLimitService, "getPlanLimits").mockResolvedValue({
            status: "expired",
            trialEndsAt: null,
            planCode: "free_tier",
            limits: PLAN_LIMITS["free_tier"],
        });
        await expect(SubscriptionLimitService.assertCanCreateCompany("user-1"))
            .rejects.toThrowError("Active subscription required to create a company");
    });
    it("triggering threshold warnings", async () => {
        const executeSpy = vi.fn().mockResolvedValue({ rows: [] });
        vi.spyOn(Db1Connection, "getInstance").mockReturnValue({
            execute: executeSpy,
        });
        await SubscriptionLimitService.checkThresholds("company-1", "user-1", "user", 8, 10, "user seats", "user");
        expect(executeSpy).toHaveBeenCalled();
    });
    it("transitions expired subscription and activates queued one", async () => {
        const updateSpy = vi.fn().mockReturnValue({ set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue({}) }) });
        const selectSpy = vi.fn().mockReturnValue({
            from: vi.fn().mockReturnValue({
                where: vi.fn().mockReturnValue({
                    orderBy: vi.fn().mockResolvedValue([
                        {
                            id: "sub-1",
                            status: "ACTIVE",
                            trialEndsAt: null,
                            currentPeriodEnd: new Date(Date.now() - 10000), // in the past
                            autoRenew: false,
                            billingCycle: "monthly",
                            renewalMode: "manual",
                        },
                        {
                            id: "sub-2",
                            status: "QUEUED",
                            trialEndsAt: null,
                            currentPeriodEnd: new Date(Date.now() + 100000),
                            autoRenew: false,
                            billingCycle: "monthly",
                            renewalMode: "manual",
                        }
                    ])
                })
            })
        });
        vi.spyOn(Db1Connection, "getInstance").mockReturnValue({
            select: selectSpy,
            update: updateSpy,
        });
        await SubscriptionLimitService.checkAndActivateQueuedSubscriptions("company-1");
        expect(selectSpy).toHaveBeenCalled();
        expect(updateSpy).toHaveBeenCalled();
    });
});
