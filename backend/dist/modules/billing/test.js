import { describe, expect, it, vi } from "vitest";
import { env } from "../../infrastructure/config/env";
import { BillingModule } from "./module";
import { BillingCycle, RenewalMode, SubscriptionChangePolicy } from "./constants/billing.constants";
import { autoPaySchema, downgradePlanSchema, purchasePlanSchema, renewPlanSchema, upgradePlanSchema, } from "./validators/billing.validator";
import { StripePaymentGatewayService } from "./services/stripe-payment-gateway.service";
import { CardVerificationService } from "./services/card-verification.service";
const uuid = "00000000-0000-4000-8000-000000000001";
const trustToken = `${"a".repeat(40)}.${"b".repeat(40)}`;
describe("billing module", () => {
    it("exposes router", () => {
        expect(new BillingModule().getRouter()).toBeDefined();
    });
    it("validates subscription purchase flow", () => {
        const payload = purchasePlanSchema.parse({
            planId: uuid,
            billingCycle: BillingCycle.Monthly,
            renewalMode: RenewalMode.Auto,
            paymentMethodType: "card",
            mfaTrustToken: trustToken,
            deviceId: "postman-device",
        });
        expect(payload.renewalMode).toBe(RenewalMode.Auto);
    });
    it("validates renewal flow", () => {
        const payload = renewPlanSchema.parse({
            subscriptionId: uuid,
            mfaTrustToken: trustToken,
        });
        expect(payload.subscriptionId).toBe(uuid);
    });
    it("validates upgrade flow", () => {
        const payload = upgradePlanSchema.parse({
            targetPlanId: uuid,
            billingCycle: BillingCycle.Quarterly,
            mfaTrustToken: trustToken,
        });
        expect(payload.billingCycle).toBe(BillingCycle.Quarterly);
    });
    it("validates downgrade policy", () => {
        const payload = downgradePlanSchema.parse({
            targetPlanId: uuid,
            policy: SubscriptionChangePolicy.NextCycle,
        });
        expect(payload.policy).toBe(SubscriptionChangePolicy.NextCycle);
    });
    it("validates auto pay setup", () => {
        const payload = autoPaySchema.parse({
            subscriptionId: uuid,
            mfaTrustToken: trustToken,
        });
        expect(payload.subscriptionId).toBe(uuid);
    });
    it("creates stubbed Stripe checkout when key missing", async () => {
        const stripeSecretKeySpy = vi.spyOn(env, "stripeSecretKey", "get").mockReturnValue(undefined);
        try {
            const gateway = new StripePaymentGatewayService();
            const checkout = await gateway.createCheckoutSession({
                companyId: uuid,
                subscriptionId: uuid,
                planName: "Starter",
                amount: "100.00",
                currencyCode: "INR",
                paymentMethodTypes: ["card"],
                metadata: { action: "test" },
            });
            expect(checkout.checkoutSessionId).toContain("stripe_checkout_");
        }
        finally {
            stripeSecretKeySpy.mockRestore();
        }
    });
    it("verifies card luhn validation", () => {
        const verifier = new CardVerificationService();
        expect(verifier.validateCardLuhn("4242424242424242")).toBe(true);
        expect(verifier.validateCardLuhn("4242424242424243")).toBe(false);
    });
    it("verifies card expiry validation", () => {
        const verifier = new CardVerificationService();
        expect(verifier.validateExpiry(12, 2035)).toBe(true);
        expect(verifier.validateExpiry(1, 2020)).toBe(false);
    });
    it("detects card brand correctly", () => {
        const verifier = new CardVerificationService();
        expect(verifier.detectCardBrand("4242424242424242")).toBe("Visa");
        expect(verifier.detectCardBrand("5105105105105105")).toBe("Mastercard");
        expect(verifier.detectCardBrand("378282112345678")).toBe("American Express");
    });
});
