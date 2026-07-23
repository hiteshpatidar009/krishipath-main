import { randomUUID } from "crypto";
import { logger } from "../../../infrastructure/logger";
import { IdempotencyService } from "../../../core";
import { AppError } from "../../../shared/errors/app.error";
import { AuthRepository } from "../../auth/repositories/auth.repository";
import { DeviceTrustService } from "../../auth/services/device-trust.service";
import { SecService } from "../../auth/services/sec.service";
import { TotpService } from "../../auth/services/totp.service";
import { PostgresCompanyRepository } from "../../company/infrastructure/repositories/postgres-company-organization.repository";
import { CreateTenantUseCase, LinkSubscriptionUseCase } from "../../company/application";
import { TaxSourceModule } from "../../tax";
import { BILLING_DEFAULTS, BillingCycle, CreditStatus, InvoiceStatus, PaymentMethodType, PaymentStatus, RefundStatus, RenewalMode, SubscriptionChangePolicy, SubscriptionState, } from "../constants/billing.constants";
import { BillingDateUtil } from "../utils/date.util";
import { MoneyUtil } from "../utils/money.util";
import { EncryptionUtil } from "../../../shared/utils/encryption.util";
import { SubscriptionLimitService } from "../../subscription";
import { CardVerificationService } from "./card-verification.service";
export class BillingService {
    repository;
    integrations;
    paymentGateway;
    dunningService;
    taxEngine;
    authRepository = new AuthRepository();
    deviceTrustService = new DeviceTrustService(this.authRepository);
    secService = new SecService();
    totpService = new TotpService();
    cardVerificationService = new CardVerificationService();
    companyRepository = new PostgresCompanyRepository();
    idempotencyService = new IdempotencyService();
    constructor(repository, integrations, paymentGateway, dunningService, taxEngine) {
        this.repository = repository;
        this.integrations = integrations;
        this.paymentGateway = paymentGateway;
        this.dunningService = dunningService;
        this.taxEngine = taxEngine;
    }
    async createSubscription(dto, context) {
        const companyId = this.requireCompany(context);
        const cached = await this.getCachedResponse(companyId, context, dto);
        if (cached) {
            return cached;
        }
        const startDate = dto.startDate ?? new Date();
        const trialEndsAt = dto.trialDays && dto.trialDays > 0 ? BillingDateUtil.addDays(startDate, dto.trialDays) : null;
        const status = trialEndsAt ? SubscriptionState.Trial : SubscriptionState.Active;
        const currentPeriodEnd = trialEndsAt ?? BillingDateUtil.addBillingCycle(startDate, dto.billingCycle);
        const subscription = await this.repository.createSubscription({
            userId: companyId,
            planId: dto.planId,
            previousPlanId: null,
            status,
            billingCycle: dto.billingCycle,
            renewalMode: dto.autoRenew ? RenewalMode.Auto : RenewalMode.Manual,
            startDate,
            currentPeriodStart: startDate,
            currentPeriodEnd,
            nextBillingAt: currentPeriodEnd,
            graceEndsAt: BillingDateUtil.addDays(currentPeriodEnd, BILLING_DEFAULTS.gracePeriodDays),
            trialEndsAt,
            cancelAtPeriodEnd: false,
            cancelledAt: null,
            autoRenew: dto.autoRenew,
            defaultPaymentMethodId: null,
            lastInvoiceId: null,
            gatewayCustomerId: dto.gatewayCustomerId ?? null,
            gatewaySubscriptionId: dto.gatewaySubscriptionId ?? null,
            purchasedPlanSnapshot: {},
            purchasedPriceAmount: "0.00",
            purchasedCurrencyCode: BILLING_DEFAULTS.currencyCode,
            purchasedDurationMonths: dto.trialDays ? Math.max(1, Math.ceil(dto.trialDays / 30)) : this.durationMonths(dto.billingCycle),
            metadata: dto.metadata,
        });
        await this.integrations.audit({
            action: "billing.subscription.create",
            entityType: "billing_subscription",
            entityId: subscription.id,
            newValues: subscription,
        }, context);
        return this.cacheResponse(companyId, context, dto, subscription);
    }
    async listSubscriptions(query, context) {
        return this.repository.listSubscriptions(this.requireCompany(context), query);
    }
    async getSubscription(id, context) {
        const subscription = await this.repository.findSubscriptionById(this.requireCompany(context), id);
        if (!subscription) {
            throw new AppError("Subscription not found", 404, "BILLING_SUBSCRIPTION_NOT_FOUND");
        }
        return subscription;
    }
    async currentSubscriptionDashboard(context) {
        const userId = context.securityContext.userId;
        if (!userId) {
            throw new AppError("Authentication required", 401, "AUTH_REQUIRED");
        }
        const subscription = await this.repository.findCurrentSubscription(userId);
        if (!subscription) {
            throw new AppError("Subscription not found", 404, "BILLING_SUBSCRIPTION_NOT_FOUND");
        }
        const plan = await this.repository.findPlanById(subscription.planId);
        const paymentProfile = subscription.defaultPaymentMethodId
            ? await this.repository.findPaymentProfileById(null, subscription.defaultPaymentMethodId, userId)
            : null;
        return {
            subscription,
            plan: {
                id: plan?.id,
                name: plan?.name,
                code: plan?.code,
            },
            status: subscription.status,
            billingCycle: subscription.billingCycle,
            autoPay: subscription.renewalMode === RenewalMode.Auto,
            expiryDate: subscription.currentPeriodEnd,
            renewalDate: subscription.nextBillingAt,
            paymentMethodSummary: this.paymentMethodSummary(paymentProfile),
            nextPaymentEstimate: await this.safeBuildPlanCharge(plan, subscription.billingCycle, context),
            usageSummary: {
                maxUsers: plan?.maxUsers ?? null,
                maxWarehouses: plan?.maxWarehouses ?? null,
                maxCompanies: plan?.maxCompanies ?? null,
                maxStorageGb: plan?.maxStorageGb ?? null,
            },
        };
    }
    async safeBuildPlanCharge(plan, billingCycle, context) {
        try {
            return await this.buildPlanCharge(plan, billingCycle, context);
        }
        catch {
            const subtotalAmount = this.planAmount(plan, billingCycle);
            return {
                subtotalAmount,
                taxAmount: "0.00",
                finalAmount: subtotalAmount,
                currencyCode: this.planCurrency(plan),
                remainingCreditAmount: "0.00",
                taxBreakdown: { lines: [], fallback: "tax_estimate_unavailable" },
            };
        }
    }
    async purchasePlan(dto, context) {
        if (!dto.trialOnly) {
            await this.requireAuthenticatorVerification(dto, context, "subscription.purchase.started");
        }
        const userId = context.securityContext.userId;
        if (!userId) {
            throw new AppError("Authentication required", 401, "AUTH_REQUIRED");
        }
        let companyId = context.securityContext.companyId ?? null;
        let isFirstCompanyPaidCheckout = false;
        if (!companyId) {
            isFirstCompanyPaidCheckout = true;
        }
        const cached = await this.getCachedResponse(companyId, context, dto);
        if (cached)
            return cached;
        await SubscriptionLimitService.checkAndActivateQueuedSubscriptions(userId);
        const activeSub = await this.repository.findCurrentSubscription(userId);
        const activeSubscriptionStatuses = [
            SubscriptionState.Active,
            SubscriptionState.Trial,
            SubscriptionState.PastDue,
            SubscriptionState.Suspended,
            SubscriptionState.Queued,
        ];
        if (dto.trialOnly &&
            activeSub &&
            activeSubscriptionStatuses.includes(activeSub.status)) {
            throw new AppError("A subscription already exists for this account", 409, "BILLING_SUBSCRIPTION_ALREADY_EXISTS");
        }
        if (dto.trialOnly && (await this.repository.hasUsedTrial(userId))) {
            throw new AppError("Free trial has already been used for this account", 409, "BILLING_FREE_TRIAL_ALREADY_USED");
        }
        const isQueued = activeSub && activeSubscriptionStatuses.includes(activeSub.status);
        const plan = await this.requirePlan(dto.planId);
        const charge = await this.safeBuildPlanCharge(plan, dto.billingCycle, context);
        const periodStart = isQueued ? new Date(activeSub.currentPeriodEnd) : new Date();
        const periodEnd = BillingDateUtil.addBillingCycle(periodStart, dto.billingCycle);
        const trialEndsAt = dto.trialOnly && !isQueued
            ? BillingDateUtil.addDays(periodStart, BILLING_DEFAULTS.trialDays ?? 14)
            : null;
        let paymentProfile = null;
        const profileScope = this.requireBillingProfileScope(context);
        if (dto.paymentProfileId) {
            paymentProfile = await this.repository.findPaymentProfileById(profileScope.companyId, dto.paymentProfileId, profileScope.userId);
            if (!paymentProfile) {
                throw new AppError("Payment profile not found", 404, "BILLING_PAYMENT_PROFILE_NOT_FOUND");
            }
        }
        else {
            const profiles = await this.repository.listPaymentProfiles(profileScope.companyId, profileScope.userId);
            if (profiles && profiles.length > 0) {
                paymentProfile = profiles[0];
            }
        }
        if (!paymentProfile) {
            throw new AppError("A valid payment profile is required to activate a plan", 422, "BILLING_PAYMENT_PROFILE_REQUIRED");
        }
        const awaitingCheckout = false;
        const checkoutAmount = paymentProfile ? "0.00" : "0.00";
        const result = await this.repository.transaction(async (tx) => {
            if (paymentProfile) {
                try {
                    const decryptedCard = EncryptionUtil.decrypt(paymentProfile.cardNumberEncrypted);
                    const decryptedCvc = EncryptionUtil.decrypt(paymentProfile.cvcEncrypted);
                    paymentProfile.metadata = {
                        ...paymentProfile.metadata,
                        auditDecryptedLast4: decryptedCard.slice(-4),
                        auditDecryptedCvcLength: decryptedCvc.length,
                    };
                }
                catch (err) {
                    throw new AppError("Failed to decrypt secure payment profile credentials", 500, "BILLING_DECRYPTION_FAILED");
                }
            }
            const subscription = await tx.createSubscription({
                userId: userId,
                planId: plan.id,
                previousPlanId: null,
                status: isQueued ? SubscriptionState.Queued : dto.trialOnly ? SubscriptionState.Trial : SubscriptionState.Active,
                billingCycle: dto.billingCycle,
                renewalMode: dto.renewalMode,
                startDate: periodStart,
                currentPeriodStart: periodStart,
                currentPeriodEnd: periodEnd,
                nextBillingAt: dto.renewalMode === RenewalMode.Auto ? periodEnd : null,
                graceEndsAt: BillingDateUtil.addDays(periodEnd, BILLING_DEFAULTS.gracePeriodDays),
                trialEndsAt,
                cancelAtPeriodEnd: false,
                cancelledAt: null,
                autoRenew: dto.renewalMode === RenewalMode.Auto,
                defaultPaymentMethodId: paymentProfile?.id ?? null,
                lastInvoiceId: null,
                gatewayCustomerId: paymentProfile ? `cus_${paymentProfile.id.slice(0, 8)}` : null,
                gatewaySubscriptionId: null,
                purchasedPlanSnapshot: this.snapshotPlan(plan),
                purchasedPriceAmount: charge.finalAmount,
                purchasedCurrencyCode: charge.currencyCode,
                purchasedDurationMonths: this.durationMonths(dto.billingCycle),
                metadata: {
                    ...dto.metadata,
                    checkoutPending: awaitingCheckout,
                    paymentProfileId: paymentProfile?.id ?? null,
                    paymentMethodType: PaymentMethodType.Card,
                    isQueuedPlan: isQueued,
                },
            });
            const invoice = await tx.createInvoice({
                companyId: companyId,
                subscriptionId: subscription.id,
                invoiceNumber: this.buildInvoiceNumber(),
                status: awaitingCheckout ? InvoiceStatus.Open : InvoiceStatus.Paid,
                subtotalAmount: charge.subtotalAmount,
                taxAmount: charge.taxAmount,
                discountAmount: "0.00",
                creditAppliedAmount: "0.00",
                totalAmount: charge.finalAmount,
                paidAmount: awaitingCheckout ? "0.00" : charge.finalAmount,
                currencyCode: charge.currencyCode,
                dueDate: BillingDateUtil.addDays(new Date(), BILLING_DEFAULTS.invoiceDueDays),
                periodStart,
                periodEnd,
                gatewayInvoiceId: null,
                idempotencyKey: context.idempotencyKey ?? null,
                metadata: {
                    action: "purchase",
                    paymentProfileId: paymentProfile?.id ?? null,
                    paymentMethodType: PaymentMethodType.Card
                },
                paidAt: awaitingCheckout ? null : new Date(),
            });
            let checkout;
            let payment;
            if (awaitingCheckout && !dto.trialOnly) {
                const session = await this.paymentGateway.createCheckoutSession({
                    companyId: companyId ?? userId,
                    subscriptionId: subscription.id,
                    planName: plan.name ?? plan.code ?? "RSBC Plan",
                    amount: checkoutAmount,
                    currencyCode: charge.currencyCode,
                    paymentMethodTypes: ["card"],
                    checkoutMode: "setup",
                    metadata: {
                        invoiceId: invoice.id,
                        action: "purchase",
                        billingCycle: dto.billingCycle,
                        userId,
                        ...(isFirstCompanyPaidCheckout ? {
                            isFirstCompanyPaidCheckout: "true",
                            pendingRegistration: JSON.stringify(dto.metadata),
                        } : {}),
                    },
                    idempotencyKey: context.idempotencyKey,
                });
                checkout = {
                    checkoutSessionId: session.checkoutSessionId,
                    checkoutUrl: session.checkoutUrl,
                    status: session.status,
                };
                payment = await tx.createPayment({
                    companyId: companyId,
                    invoiceId: invoice.id,
                    subscriptionId: subscription.id,
                    gateway: "stripe",
                    gatewayPaymentId: checkout.checkoutSessionId,
                    status: PaymentStatus.Pending,
                    amount: checkoutAmount,
                    currencyCode: charge.currencyCode,
                    failureReason: null,
                    idempotencyKey: context.idempotencyKey ?? null,
                    metadata: {
                        action: "purchase",
                        checkoutMode: "setup",
                        paymentMethodType: PaymentMethodType.Card,
                        billedAmount: charge.finalAmount,
                    },
                    paidAt: null,
                });
                await tx.updateInvoice(companyId, invoice.id, {
                    gatewayInvoiceId: checkout.checkoutSessionId,
                });
            }
            else {
                if (dto.trialOnly) {
                    checkout = {
                        checkoutSessionId: `trial_only_${randomUUID()}`,
                        checkoutUrl: null,
                        status: "SUCCEEDED",
                    };
                    payment = await tx.createPayment({
                        companyId: companyId,
                        invoiceId: invoice.id,
                        subscriptionId: subscription.id,
                        gateway: "trial_only",
                        gatewayPaymentId: checkout.checkoutSessionId,
                        status: PaymentStatus.Succeeded,
                        amount: checkoutAmount,
                        currencyCode: charge.currencyCode,
                        failureReason: null,
                        idempotencyKey: context.idempotencyKey ?? null,
                        metadata: {
                            action: "purchase",
                            paymentMethodType: PaymentMethodType.Card,
                            billedAmount: "0.00",
                            trialOnly: true,
                        },
                        paidAt: new Date(),
                    });
                    await tx.updateInvoice(companyId, invoice.id, {
                        gatewayInvoiceId: checkout.checkoutSessionId,
                        status: InvoiceStatus.Paid,
                        paidAt: new Date(),
                        paidAmount: "0.00",
                    });
                    if (companyId) {
                        const linkSubscriptionUseCase = new LinkSubscriptionUseCase(this.companyRepository);
                        await linkSubscriptionUseCase.execute(companyId, plan.id);
                    }
                }
                else {
                    checkout = {
                        checkoutSessionId: `profile_tx_${randomUUID()}`,
                        checkoutUrl: null,
                        status: "SUCCEEDED",
                    };
                    payment = await tx.createPayment({
                        companyId: companyId,
                        invoiceId: invoice.id,
                        subscriptionId: subscription.id,
                        gateway: "payment_profile",
                        gatewayPaymentId: checkout.checkoutSessionId,
                        status: PaymentStatus.Succeeded,
                        amount: checkoutAmount,
                        currencyCode: charge.currencyCode,
                        failureReason: null,
                        idempotencyKey: context.idempotencyKey ?? null,
                        metadata: {
                            action: "purchase",
                            paymentProfileId: paymentProfile.id,
                            displayBrand: paymentProfile.displayBrand,
                            last4: paymentProfile.last4,
                            paymentMethodType: PaymentMethodType.Card,
                            billedAmount: charge.finalAmount,
                        },
                        paidAt: new Date(),
                    });
                    await tx.updateInvoice(companyId, invoice.id, {
                        gatewayInvoiceId: checkout.checkoutSessionId,
                    });
                }
            }
            await tx.updateSubscription(userId, subscription.id, { lastInvoiceId: invoice.id });
            await tx.recordSubscriptionEvent({
                companyId: companyId,
                subscriptionId: subscription.id,
                eventName: awaitingCheckout ? "subscription.purchase.checkout_started" : "subscription.purchase.success",
                entityType: "subscription",
                entityId: subscription.id,
                payload: {
                    invoiceId: invoice.id,
                    paymentId: payment.id,
                    checkoutSessionId: checkout.checkoutSessionId,
                    awaitingCheckout,
                    paymentProfileId: paymentProfile?.id ?? null,
                },
                createdBy: context.securityContext.userId ?? null,
            });
            return {
                subscription: { ...subscription, lastInvoiceId: invoice.id },
                invoice: { ...invoice, gatewayInvoiceId: checkout.checkoutSessionId },
                payment,
                checkout,
                paymentMethod: null,
                summary: this.actionSummary(plan, dto.billingCycle, dto.renewalMode, charge, periodEnd),
            };
        });
        await this.auditAndEmit(awaitingCheckout ? "subscription.purchase.checkout_started" : "subscription.purchase.success", result.subscription.id, result, context);
        return this.cacheResponse(companyId, context, dto, result);
    }
    async updateSubscription(id, dto, context) {
        const companyId = this.requireCompany(context);
        const before = await this.getSubscription(id, context);
        const updated = await this.repository.updateSubscription(companyId, id, dto);
        if (!updated) {
            throw new AppError("Subscription not found", 404, "BILLING_SUBSCRIPTION_NOT_FOUND");
        }
        await this.integrations.audit({
            action: "billing.subscription.update",
            entityType: "billing_subscription",
            entityId: id,
            oldValues: before,
            newValues: updated,
        }, context);
        return updated;
    }
    async cancelSubscription(id, reason, cancelAtPeriodEnd, context) {
        const companyId = this.requireCompany(context);
        const before = await this.getSubscription(id, context);
        const patch = cancelAtPeriodEnd
            ? { cancelAtPeriodEnd: true, metadata: { ...before.metadata, cancellationReason: reason } }
            : { status: SubscriptionState.Cancelled, cancelledAt: new Date(), cancelAtPeriodEnd: false, metadata: { ...before.metadata, cancellationReason: reason } };
        const updated = await this.repository.updateSubscription(companyId, id, patch);
        if (!updated) {
            throw new AppError("Subscription not found", 404, "BILLING_SUBSCRIPTION_NOT_FOUND");
        }
        await this.integrations.audit({
            action: "billing.subscription.cancel",
            entityType: "billing_subscription",
            entityId: id,
            oldValues: before,
            newValues: updated,
        }, context);
        return updated;
    }
    async renewSubscription(id, context) {
        const companyId = this.requireCompany(context);
        const subscription = await this.getSubscription(id, context);
        if (![SubscriptionState.Active, SubscriptionState.Trial, SubscriptionState.PastDue].includes(subscription.status)) {
            throw new AppError("Subscription is not renewable from its current state", 409, "BILLING_INVALID_RENEWAL_STATE");
        }
        const currentPeriodStart = subscription.currentPeriodEnd > new Date() ? subscription.currentPeriodEnd : new Date();
        const currentPeriodEnd = BillingDateUtil.addBillingCycle(currentPeriodStart, subscription.billingCycle);
        const updated = await this.repository.updateSubscription(companyId, id, {
            status: SubscriptionState.Active,
            currentPeriodStart,
            currentPeriodEnd,
            trialEndsAt: null,
            cancelAtPeriodEnd: false,
        });
        if (!updated) {
            throw new AppError("Subscription not found", 404, "BILLING_SUBSCRIPTION_NOT_FOUND");
        }
        await this.integrations.audit({
            action: "billing.subscription.renew",
            entityType: "billing_subscription",
            entityId: id,
            oldValues: subscription,
            newValues: updated,
        }, context);
        return updated;
    }
    async renewCurrentPlan(dto, context) {
        await this.requireAuthenticatorVerification(dto, context, "subscription.renewal.started");
        const companyId = this.requireCompany(context);
        const subscription = dto.subscriptionId ? await this.getSubscription(dto.subscriptionId, context) : await this.requireCurrentSubscription(companyId);
        const plan = await this.requirePlan(subscription.planId);
        const charge = await this.safeBuildPlanCharge(plan, subscription.billingCycle, context);
        const periodStart = subscription.currentPeriodEnd > new Date() ? subscription.currentPeriodEnd : new Date();
        const periodEnd = BillingDateUtil.addBillingCycle(periodStart, subscription.billingCycle);
        const invoice = await this.createLifecycleInvoice(subscription, charge, periodStart, periodEnd, "renewal", context);
        const { payment, checkout } = await this.startCardCheckout({
            companyId,
            subscription,
            planName: plan.name ?? plan.code ?? "RSBC Plan",
            invoice,
            charge,
            action: "renewal",
            context,
        });
        const result = {
            subscription,
            invoice,
            payment,
            checkout,
            paymentMethod: null,
            summary: this.actionSummary(plan, subscription.billingCycle, subscription.renewalMode, charge, periodEnd),
        };
        await this.auditAndEmit("subscription.renewal.checkout_started", subscription.id, result, context);
        return result;
    }
    async upgradePlan(dto, context) {
        await this.requireAuthenticatorVerification(dto, context, "subscription.upgrade.started");
        const companyId = this.requireCompany(context);
        const subscription = dto.subscriptionId ? await this.getSubscription(dto.subscriptionId, context) : await this.requireCurrentSubscription(companyId);
        const targetPlan = await this.requirePlan(dto.targetPlanId);
        const billingCycle = dto.billingCycle ?? subscription.billingCycle;
        const charge = await this.buildProratedUpgradeCharge(await this.requirePlan(subscription.planId), targetPlan, subscription, billingCycle, context);
        const periodEnd = BillingDateUtil.addBillingCycle(new Date(), billingCycle);
        const invoice = await this.repository.createInvoice({
            companyId: subscription.userId,
            subscriptionId: subscription.id,
            invoiceNumber: this.buildInvoiceNumber(),
            status: InvoiceStatus.Open,
            subtotalAmount: charge.subtotalAmount,
            taxAmount: charge.taxAmount,
            discountAmount: "0.00",
            creditAppliedAmount: "0.00",
            totalAmount: charge.finalAmount,
            paidAmount: "0.00",
            currencyCode: charge.currencyCode,
            dueDate: BillingDateUtil.addDays(new Date(), BILLING_DEFAULTS.invoiceDueDays),
            periodStart: new Date(),
            periodEnd,
            gatewayInvoiceId: null,
            idempotencyKey: context.idempotencyKey ?? null,
            metadata: {
                action: "upgrade",
                targetPlanId: targetPlan.id,
                billingCycle,
                taxCalculationId: charge.taxCalculationId,
                taxBreakdown: charge.taxBreakdown,
            },
            paidAt: null,
        });
        const { payment, checkout } = await this.startCardCheckout({
            companyId,
            subscription,
            planName: targetPlan.name ?? targetPlan.code ?? "RSBC Plan",
            invoice,
            charge,
            action: "upgrade",
            context,
            extraMetadata: {
                targetPlanId: targetPlan.id,
                billingCycle,
            },
        });
        const result = {
            subscription,
            invoice,
            payment,
            checkout,
            paymentMethod: null,
            summary: this.actionSummary(targetPlan, billingCycle, subscription.renewalMode, charge, periodEnd),
        };
        await this.auditAndEmit("subscription.upgrade.checkout_started", subscription.id, result, context);
        return result;
    }
    async downgradePlan(dto, context) {
        const companyId = this.requireCompany(context);
        const subscription = dto.subscriptionId ? await this.getSubscription(dto.subscriptionId, context) : await this.requireCurrentSubscription(companyId);
        const targetPlan = await this.requirePlan(dto.targetPlanId);
        const effectiveAt = dto.policy === SubscriptionChangePolicy.Immediate ? new Date() : subscription.currentPeriodEnd;
        const change = await this.repository.createSubscriptionChange({
            companyId,
            subscriptionId: subscription.id,
            fromPlanId: subscription.planId,
            toPlanId: targetPlan.id,
            changeType: "downgrade",
            policy: dto.policy,
            status: dto.policy === SubscriptionChangePolicy.Immediate ? "APPLIED" : "PENDING",
            effectiveAt,
            remainingCreditAmount: "0.00",
            proratedChargeAmount: "0.00",
            currencyCode: this.planCurrency(targetPlan),
            metadata: { ...dto.metadata, reason: dto.reason },
            createdBy: context.securityContext.userId ?? null,
        });
        const downgradedCharge = await this.safeBuildPlanCharge(targetPlan, subscription.billingCycle, context);
        const updated = dto.policy === SubscriptionChangePolicy.Immediate
            ? await this.repository.updateSubscription(companyId, subscription.id, {
                previousPlanId: subscription.planId,
                planId: targetPlan.id,
                purchasedPlanSnapshot: this.snapshotPlan(targetPlan),
                purchasedPriceAmount: downgradedCharge.finalAmount,
                purchasedCurrencyCode: this.planCurrency(targetPlan),
            })
            : subscription;
        await this.auditAndEmit("subscription.downgrade.scheduled", subscription.id, { change, subscription: updated }, context);
        return { change, subscription: updated, impact: this.downgradeImpact(subscription, targetPlan, dto.policy) };
    }
    async enableAutoPay(dto, context) {
        await this.requireAuthenticatorVerification(dto, context, "subscription.auto_pay.enabled");
        const companyId = this.requireCompany(context);
        const subscription = dto.subscriptionId ? await this.getSubscription(dto.subscriptionId, context) : await this.requireCurrentSubscription(companyId);
        const updated = await this.repository.updateSubscription(companyId, subscription.id, {
            autoRenew: true,
            renewalMode: RenewalMode.Auto,
            nextBillingAt: subscription.currentPeriodEnd,
        });
        if (!updated)
            throw new AppError("Subscription not found", 404, "BILLING_SUBSCRIPTION_NOT_FOUND");
        await this.auditAndEmit("subscription.auto_pay.enabled", updated.id, updated, context);
        return updated;
    }
    async disableAutoPay(dto, context) {
        const companyId = this.requireCompany(context);
        const subscription = dto.subscriptionId ? await this.getSubscription(dto.subscriptionId, context) : await this.requireCurrentSubscription(companyId);
        const updated = await this.repository.updateSubscription(companyId, subscription.id, {
            autoRenew: false,
            renewalMode: RenewalMode.Manual,
            nextBillingAt: null,
        });
        if (!updated)
            throw new AppError("Subscription not found", 404, "BILLING_SUBSCRIPTION_NOT_FOUND");
        await this.auditAndEmit("subscription.auto_pay.disabled", updated.id, updated, context);
        return updated;
    }
    async createInvoice(dto, context) {
        const companyId = this.requireCompany(context);
        const cached = await this.getCachedResponse(companyId, context, dto);
        if (cached) {
            return cached;
        }
        const subscription = await this.getSubscription(dto.subscriptionId, context);
        const dueDate = dto.dueDate ?? BillingDateUtil.addDays(new Date(), BILLING_DEFAULTS.invoiceDueDays);
        const rawTotal = MoneyUtil.subtract(MoneyUtil.add(dto.subtotalAmount, dto.taxAmount), dto.discountAmount);
        if (MoneyUtil.isNegative(rawTotal)) {
            throw new AppError("Invoice total cannot be negative", 422, "BILLING_NEGATIVE_INVOICE_TOTAL");
        }
        const invoice = await this.repository.transaction(async (tx) => {
            const creditAppliedAmount = await this.applyAvailableCredits(tx, companyId, rawTotal);
            const totalAmount = MoneyUtil.subtract(rawTotal, creditAppliedAmount);
            return tx.createInvoice({
                companyId,
                subscriptionId: subscription.id,
                invoiceNumber: this.buildInvoiceNumber(),
                status: MoneyUtil.isZero(totalAmount) ? InvoiceStatus.Paid : dto.status,
                subtotalAmount: dto.subtotalAmount,
                taxAmount: dto.taxAmount,
                discountAmount: dto.discountAmount,
                creditAppliedAmount,
                totalAmount,
                paidAmount: MoneyUtil.isZero(totalAmount) ? "0.00" : "0.00",
                currencyCode: dto.currencyCode,
                dueDate,
                periodStart: dto.periodStart,
                periodEnd: dto.periodEnd,
                gatewayInvoiceId: null,
                idempotencyKey: context.idempotencyKey ?? null,
                metadata: dto.metadata,
                paidAt: MoneyUtil.isZero(totalAmount) ? new Date() : null,
            });
        });
        await this.integrations.audit({
            action: "billing.invoice.create",
            entityType: "billing_invoice",
            entityId: invoice.id,
            newValues: invoice,
        }, context);
        return this.cacheResponse(companyId, context, dto, invoice);
    }
    async listInvoices(query, context) {
        return this.repository.listInvoices(this.requireCompany(context), query);
    }
    async getInvoice(id, context) {
        const invoice = await this.repository.findInvoiceById(this.requireCompany(context), id);
        if (!invoice) {
            throw new AppError("Invoice not found", 404, "BILLING_INVOICE_NOT_FOUND");
        }
        return invoice;
    }
    async createPayment(dto, context) {
        const companyId = this.requireCompany(context);
        const cached = await this.getCachedResponse(companyId, context, dto);
        if (cached) {
            return cached;
        }
        const invoice = await this.getInvoice(dto.invoiceId, context);
        if (MoneyUtil.compare(dto.amount, invoice.totalAmount) > 0) {
            throw new AppError("Payment amount cannot exceed invoice total", 422, "BILLING_PAYMENT_EXCEEDS_INVOICE");
        }
        const gatewayResult = dto.gateway === "stripe" && dto.status === PaymentStatus.Pending
            ? await this.paymentGateway.charge({
                companyId,
                invoiceId: invoice.id,
                amount: dto.amount,
                currencyCode: dto.currencyCode,
                idempotencyKey: context.idempotencyKey,
            })
            : null;
        const status = gatewayResult?.status === PaymentStatus.Succeeded ? PaymentStatus.Succeeded : dto.status;
        const payment = await this.repository.createPayment({
            companyId,
            invoiceId: invoice.id,
            subscriptionId: invoice.subscriptionId,
            gateway: dto.gateway,
            gatewayPaymentId: gatewayResult?.gatewayPaymentId ?? dto.gatewayPaymentId ?? null,
            status,
            amount: dto.amount,
            currencyCode: dto.currencyCode,
            failureReason: gatewayResult?.failureReason ?? dto.failureReason ?? null,
            idempotencyKey: context.idempotencyKey ?? null,
            metadata: { ...dto.metadata, gateway: gatewayResult?.metadata },
            paidAt: status === PaymentStatus.Succeeded ? new Date() : null,
        });
        if (payment.status === PaymentStatus.Succeeded) {
            await this.markInvoicePayment(invoice, payment);
        }
        if (payment.status === PaymentStatus.Failed) {
            await this.dunningService.handlePaymentFailure(payment, context);
        }
        await this.integrations.audit({
            action: "billing.payment.create",
            entityType: "billing_payment",
            entityId: payment.id,
            newValues: payment,
        }, context);
        return this.cacheResponse(companyId, context, dto, payment);
    }
    async listPayments(query, context) {
        return this.repository.listPayments(this.requireCompany(context), query);
    }
    async retryPayment(dto, context) {
        await this.requireAuthenticatorVerification(dto, context, "payment.retry.started");
        const companyId = this.requireCompany(context);
        const payment = await this.repository.findPaymentById(companyId, dto.paymentId);
        if (!payment || payment.status !== PaymentStatus.Failed) {
            throw new AppError("Only failed payments can be retried", 422, "BILLING_PAYMENT_RETRY_INVALID");
        }
        const invoice = await this.repository.findInvoiceById(companyId, payment.invoiceId);
        if (!invoice) {
            throw new AppError("Invoice not found", 404, "BILLING_INVOICE_NOT_FOUND");
        }
        const subscription = await this.repository.findSubscriptionById(companyId, payment.subscriptionId);
        if (!subscription) {
            throw new AppError("Subscription not found", 404, "BILLING_SUBSCRIPTION_NOT_FOUND");
        }
        const plan = await this.requirePlan(subscription.planId);
        const charge = {
            subtotalAmount: payment.amount,
            taxAmount: "0.00",
            finalAmount: payment.amount,
            currencyCode: payment.currencyCode,
            remainingCreditAmount: "0.00",
            taxBreakdown: { lines: [], fallback: "payment_retry" },
        };
        const { payment: updated, checkout } = await this.startCardCheckout({
            companyId,
            subscription,
            planName: plan.name ?? plan.code ?? "RSBC Plan",
            invoice,
            charge,
            action: "retry",
            context,
            existingPaymentId: payment.id,
        });
        await this.auditAndEmit("payment.retry.checkout_started", updated.id, { payment: updated, checkout }, context);
        return updated;
    }
    async createRefund(dto, context) {
        const companyId = this.requireCompany(context);
        const cached = await this.getCachedResponse(companyId, context, dto);
        if (cached) {
            return cached;
        }
        const payment = await this.repository.findPaymentById(companyId, dto.paymentId);
        if (!payment || payment.status !== PaymentStatus.Succeeded) {
            throw new AppError("Only successful billing payments can be refunded", 422, "BILLING_REFUND_PAYMENT_INVALID");
        }
        const alreadyRefunded = await this.repository.sumRefundedAmount(companyId, payment.id);
        if (MoneyUtil.compare(MoneyUtil.add(alreadyRefunded, dto.amount), payment.amount) > 0) {
            throw new AppError("Refund amount exceeds refundable balance", 422, "BILLING_REFUND_EXCEEDS_BALANCE");
        }
        const gatewayRefund = payment.gateway === "stripe"
            ? await this.paymentGateway.refund(payment.gatewayPaymentId ?? payment.id, dto.amount, dto.reason)
            : { gatewayRefundId: null, status: RefundStatus.Succeeded };
        const refund = await this.repository.createRefund({
            companyId,
            paymentId: payment.id,
            invoiceId: payment.invoiceId,
            amount: dto.amount,
            currencyCode: payment.currencyCode,
            status: gatewayRefund.status === RefundStatus.Succeeded ? RefundStatus.Succeeded : RefundStatus.Failed,
            reason: dto.reason,
            gatewayRefundId: gatewayRefund.gatewayRefundId,
            metadata: dto.metadata,
            createdBy: context.securityContext.userId ?? null,
        });
        const totalRefunded = MoneyUtil.add(alreadyRefunded, dto.amount);
        await this.repository.updatePayment(companyId, payment.id, {
            status: MoneyUtil.compare(totalRefunded, payment.amount) >= 0 ? PaymentStatus.Refunded : PaymentStatus.PartiallyRefunded,
        });
        await this.integrations.audit({
            action: "billing.refund.create",
            entityType: "billing_refund",
            entityId: refund.id,
            newValues: refund,
        }, context);
        return this.cacheResponse(companyId, context, dto, refund);
    }
    async createCredit(dto, context) {
        const companyId = this.requireCompany(context);
        if (MoneyUtil.isNegative(dto.amount) || MoneyUtil.isZero(dto.amount)) {
            throw new AppError("Credit amount must be greater than zero", 422, "BILLING_INVALID_CREDIT_AMOUNT");
        }
        const credit = await this.repository.createCredit({
            companyId,
            invoiceId: dto.invoiceId ?? null,
            status: CreditStatus.Available,
            amount: dto.amount,
            remainingAmount: dto.amount,
            currencyCode: dto.currencyCode,
            reason: dto.reason,
            expiresAt: dto.expiresAt,
            createdBy: context.securityContext.userId ?? null,
        });
        await this.integrations.audit({
            action: "billing.credit.create",
            entityType: "billing_credit",
            entityId: credit.id,
            newValues: credit,
        }, context);
        return credit;
    }
    async listCredits(query, context) {
        return this.repository.listCredits(this.requireCompany(context), query);
    }
    async recordUsage(dto, context) {
        const companyId = this.requireCompany(context);
        await this.getSubscription(dto.subscriptionId, context);
        return this.repository.recordUsage({
            companyId,
            subscriptionId: dto.subscriptionId,
            metricName: dto.metricName,
            metricValue: dto.metricValue,
            periodStart: dto.periodStart,
            periodEnd: dto.periodEnd,
            metadata: dto.metadata,
        });
    }
    async listUsage(query, context) {
        return this.repository.listUsage(this.requireCompany(context), query);
    }
    async handleStripeWebhook(dto, context) {
        const idempotencyKey = `stripe-webhook:${dto.id}`;
        const requestHash = JSON.stringify({ id: dto.id, type: dto.type });
        const reservation = await this.idempotencyService.reserveExecution(undefined, idempotencyKey, requestHash, 1440);
        if (reservation.state === "conflict") {
            throw new AppError("Stripe webhook event id reused with different payload", 409, "STRIPE_WEBHOOK_IDEMPOTENCY_CONFLICT");
        }
        if (reservation.state === "completed" || reservation.state === "in_progress") {
            await logger.info("stripe webhook duplicate ignored", {
                action: "billing.webhook.stripe.duplicate",
                payload: { eventId: dto.id, eventType: dto.type, state: reservation.state },
            });
            return { received: true, type: dto.type };
        }
        if (reservation.state === "failed") {
            const retried = await this.idempotencyService.retryFailed(undefined, idempotencyKey, requestHash, 1440);
            if (!retried) {
                return { received: true, type: dto.type };
            }
        }
        try {
            await this.integrations.audit({
                action: `billing.webhook.stripe.${dto.type}`,
                entityType: "stripe_webhook",
                entityId: dto.id,
                newValues: dto,
            }, context);
            if (dto.type === "checkout.session.completed") {
                await this.completeCheckoutSession(dto.data.object, context);
            }
            if (dto.type === "checkout.session.async_payment_failed") {
                await this.failCheckoutSession(dto.data.object, context);
            }
            await this.idempotencyService.complete(undefined, idempotencyKey, requestHash, 200, { received: true, type: dto.type });
            return { received: true, type: dto.type };
        }
        catch (error) {
            await this.idempotencyService.fail(undefined, idempotencyKey, requestHash);
            throw error;
        }
    }
    async completeCheckoutSession(session, context) {
        const sessionId = typeof session.id === "string" ? session.id : null;
        if (!sessionId) {
            return;
        }
        const payment = await this.repository.findPaymentByGatewayId(sessionId);
        if (!payment || payment.status === PaymentStatus.Succeeded) {
            return;
        }
        const invoice = await this.repository.findInvoiceById(payment.companyId, payment.invoiceId);
        if (!invoice) {
            return;
        }
        const metadata = (session.metadata ?? {});
        const userId = typeof metadata.userId === "string" ? metadata.userId : null;
        const isFirstCompanyPaidCheckout = metadata.isFirstCompanyPaidCheckout === "true";
        let actualCompanyId = payment.companyId;
        if (isFirstCompanyPaidCheckout && userId && metadata.pendingRegistration) {
            try {
                const pendingRegistration = JSON.parse(String(metadata.pendingRegistration));
                let companyIdCreated = null;
                const listResponse = await this.companyRepository.listAccessibleTenants(userId, false);
                const matched = listResponse.find((c) => String(c.name || "").toLowerCase() === String(pendingRegistration.companyName || "").toLowerCase());
                if (matched) {
                    companyIdCreated = matched.companyId;
                }
                else {
                    const createTenantUseCase = new CreateTenantUseCase(this.companyRepository);
                    const companyResult = await createTenantUseCase.execute({
                        ownerUserId: userId,
                        companyName: String(pendingRegistration.companyName || "My Company"),
                        legalBusinessName: String(pendingRegistration.legalBusinessName || pendingRegistration.companyName || "My Company"),
                        industry: String(pendingRegistration.industry || ""),
                        companySize: String(pendingRegistration.companySize || ""),
                        website: String(pendingRegistration.website || ""),
                        businessType: String(pendingRegistration.businessType || ""),
                        currencyCode: String(pendingRegistration.currencyCode || "USD"),
                        taxNumber: String(pendingRegistration.taxNumber || ""),
                        country: String(pendingRegistration.country || "US"),
                        stateProvince: String(pendingRegistration.stateProvince || ""),
                        city: String(pendingRegistration.city || ""),
                        postalCode: String(pendingRegistration.postalCode || ""),
                        timezone: String(pendingRegistration.timezone || "UTC"),
                    });
                    companyIdCreated = String(companyResult.companyId);
                }
                actualCompanyId = companyIdCreated;
                await this.repository.updateInvoiceCompanyId(invoice.id, actualCompanyId);
                await this.repository.updatePaymentCompanyId(payment.id, actualCompanyId);
                const subscription = await this.repository.findSubscriptionById(userId, payment.subscriptionId);
                if (subscription) {
                    const linkSubscriptionUseCase = new LinkSubscriptionUseCase(this.companyRepository);
                    await linkSubscriptionUseCase.execute(actualCompanyId, subscription.planId);
                }
            }
            catch (err) {
                await logger.error(err instanceof Error ? err : new Error(String(err)), { userId, action: "billing.webhook.stripe.materialize_company_failed" });
            }
        }
        const updatedPayment = await this.repository.updatePayment(actualCompanyId, payment.id, {
            status: PaymentStatus.Succeeded,
            paidAt: new Date(),
            metadata: {
                ...payment.metadata,
                stripeSession: session,
            },
        });
        const checkoutMode = String(payment.metadata?.checkoutMode ?? "");
        const isTrialCardSetup = checkoutMode === "setup" && String(payment.metadata?.action ?? invoice.metadata?.action) === "purchase";
        if (updatedPayment && !isTrialCardSetup) {
            await this.markInvoicePayment(invoice, updatedPayment);
        }
        else if (updatedPayment && isTrialCardSetup) {
            await this.repository.updateInvoice(actualCompanyId, invoice.id, {
                metadata: {
                    ...invoice.metadata,
                    cardOnFile: true,
                    checkoutSessionId: sessionId,
                },
            });
        }
        const subscription = userId
            ? await this.repository.findSubscriptionById(userId, payment.subscriptionId)
            : null;
        if (!subscription) {
            return;
        }
        const action = String(payment.metadata?.action ?? invoice.metadata?.action ?? "purchase");
        const subscriptionPatch = {
            gatewayCustomerId: typeof session.customer === "string" ? session.customer : subscription.gatewayCustomerId,
            metadata: {
                ...subscription.metadata,
                checkoutPending: false,
                paymentMethodType: PaymentMethodType.Card,
            },
        };
        if (action === "renewal") {
            subscriptionPatch.status = SubscriptionState.Active;
            subscriptionPatch.currentPeriodStart = invoice.periodStart;
            subscriptionPatch.currentPeriodEnd = invoice.periodEnd;
            subscriptionPatch.nextBillingAt = subscription.renewalMode === RenewalMode.Auto ? invoice.periodEnd : null;
            subscriptionPatch.trialEndsAt = null;
            subscriptionPatch.lastInvoiceId = invoice.id;
            subscriptionPatch.graceEndsAt = BillingDateUtil.addDays(invoice.periodEnd, BILLING_DEFAULTS.gracePeriodDays);
        }
        else if (action === "upgrade") {
            const targetPlanId = typeof invoice.metadata?.targetPlanId === "string"
                ? invoice.metadata.targetPlanId
                : null;
            const billingCycle = typeof invoice.metadata?.billingCycle === "string"
                ? invoice.metadata.billingCycle
                : subscription.billingCycle;
            if (targetPlanId) {
                const targetPlan = await this.requirePlan(targetPlanId);
                subscriptionPatch.previousPlanId = subscription.planId;
                subscriptionPatch.planId = targetPlanId;
                subscriptionPatch.billingCycle = billingCycle;
                subscriptionPatch.purchasedPlanSnapshot = this.snapshotPlan(targetPlan);
                subscriptionPatch.purchasedPriceAmount = invoice.totalAmount;
                subscriptionPatch.purchasedCurrencyCode = invoice.currencyCode;
                subscriptionPatch.purchasedDurationMonths = this.durationMonths(billingCycle);
            }
            subscriptionPatch.status = SubscriptionState.Active;
            subscriptionPatch.currentPeriodEnd = invoice.periodEnd;
            subscriptionPatch.nextBillingAt = subscription.renewalMode === RenewalMode.Auto ? invoice.periodEnd : null;
            subscriptionPatch.lastInvoiceId = invoice.id;
            subscriptionPatch.graceEndsAt = BillingDateUtil.addDays(invoice.periodEnd, BILLING_DEFAULTS.gracePeriodDays);
        }
        else {
            subscriptionPatch.status = subscription.status === SubscriptionState.Queued
                ? SubscriptionState.Queued
                : (subscription.trialEndsAt ? SubscriptionState.Trial : SubscriptionState.Active);
        }
        const updatedSubscription = await this.repository.updateSubscription(subscription.userId, subscription.id, subscriptionPatch);
        if (action === "upgrade" && updatedSubscription && subscriptionPatch.planId && actualCompanyId) {
            await this.repository.createSubscriptionChange({
                companyId: actualCompanyId,
                subscriptionId: subscription.id,
                fromPlanId: subscription.planId,
                toPlanId: subscriptionPatch.planId,
                changeType: "upgrade",
                policy: SubscriptionChangePolicy.Immediate,
                status: "APPLIED",
                effectiveAt: new Date(),
                remainingCreditAmount: "0.00",
                proratedChargeAmount: invoice.totalAmount,
                currencyCode: invoice.currencyCode,
                metadata: { checkoutSessionId: sessionId },
                createdBy: context.securityContext.userId ?? null,
            });
        }
        await this.integrations.audit({
            action: "billing.checkout.completed",
            entityType: "billing_payment",
            entityId: payment.id,
            newValues: { sessionId, subscriptionId: subscription.id },
        }, context);
    }
    async failCheckoutSession(session, context) {
        const sessionId = typeof session.id === "string" ? session.id : null;
        if (!sessionId) {
            return;
        }
        const payment = await this.repository.findPaymentByGatewayId(sessionId);
        if (!payment || payment.status !== PaymentStatus.Pending) {
            return;
        }
        const updatedPayment = await this.repository.updatePayment(payment.companyId, payment.id, {
            status: PaymentStatus.Failed,
            failureReason: "Stripe checkout payment failed",
            metadata: {
                ...payment.metadata,
                stripeSession: session,
            },
        });
        if (updatedPayment) {
            await this.dunningService.handlePaymentFailure(updatedPayment, context);
        }
    }
    async applyAvailableCredits(repository, companyId, invoiceTotal) {
        let remainingInvoiceBalance = invoiceTotal;
        let applied = "0.00";
        const credits = await repository.listAvailableCredits(companyId);
        for (const credit of credits) {
            if (MoneyUtil.isZero(remainingInvoiceBalance)) {
                break;
            }
            const amountToApply = MoneyUtil.min(credit.remainingAmount, remainingInvoiceBalance);
            const remainingCredit = MoneyUtil.subtract(credit.remainingAmount, amountToApply);
            await repository.updateCredit(companyId, credit.id, {
                remainingAmount: remainingCredit,
                status: MoneyUtil.isZero(remainingCredit) ? CreditStatus.Applied : CreditStatus.Available,
            });
            applied = MoneyUtil.add(applied, amountToApply);
            remainingInvoiceBalance = MoneyUtil.subtract(remainingInvoiceBalance, amountToApply);
        }
        return applied;
    }
    async markInvoicePayment(invoice, payment) {
        const paidAmount = MoneyUtil.add(invoice.paidAmount, payment.amount);
        const status = MoneyUtil.compare(paidAmount, invoice.totalAmount) >= 0 ? InvoiceStatus.Paid : InvoiceStatus.PartiallyPaid;
        await this.repository.updateInvoice(invoice.companyId, invoice.id, {
            paidAmount,
            status,
            paidAt: status === InvoiceStatus.Paid ? new Date() : null,
        });
        if (status === InvoiceStatus.Paid && invoice.companyId) {
            await this.repository.updateSubscription(invoice.companyId, invoice.subscriptionId, {
                status: SubscriptionState.Active,
            });
        }
    }
    async getCachedResponse(companyId, context, payload) {
        if (!context.idempotencyKey || !companyId) {
            return null;
        }
        return this.repository.findIdempotencyResponse(companyId, context.idempotencyKey, payload);
    }
    async cacheResponse(companyId, context, payload, response) {
        if (context.idempotencyKey && companyId) {
            await this.repository.saveIdempotencyResponse(companyId, context.idempotencyKey, payload, response);
        }
        return response;
    }
    async requireAuthenticatorVerification(input, context, action, forceVerify = false) {
        const userId = context.securityContext.userId;
        if (!userId) {
            throw new AppError("Authenticated user required", 401, "AUTH_REQUIRED");
        }
        const trust = await this.deviceTrustService.validateTrustedSession({
            userId,
            companyId: context.securityContext.companyId ?? userId,
            sessionId: context.securityContext.sessionId,
            trustSessionId: input.mfaTrustSessionId,
            deviceId: input.deviceId,
            deviceName: input.deviceName,
            deviceType: input.deviceType,
            operatingSystem: input.operatingSystem,
            browser: input.browser,
            trustToken: input.mfaTrustToken,
            ctx: {
                ipAddress: context.ipAddress,
                userAgent: context.userAgent,
            },
        });
        if (!trust.trusted || forceVerify) {
            const totpCode = input.totpCode ?? input.mfaCode ?? input.authenticatorCode;
            if (totpCode) {
                await this.verifyAuthenticatorCode(userId, totpCode, context, action);
                return;
            }
            await this.integrations.audit({
                action: `${action}.mfa_required`,
                entityType: "authenticator_verification",
                entityId: userId,
                newValues: trust,
            }, context);
            throw new AppError("Authenticator code required", 403, "AUTHENTICATOR_CODE_REQUIRED");
        }
    }
    async verifyAuthenticatorCode(userId, code, context, action) {
        const device = await this.authRepository.findMfaDevice(userId, "auth_app_otp");
        if (!device?.secretHash || !device.verifiedAt) {
            await this.integrations.audit({
                action: `${action}.mfa_not_configured`,
                entityType: "authenticator_device",
                entityId: userId,
                newValues: { method: "auth_app_otp" },
            }, context);
            throw new AppError("Authenticator app is not configured", 403, "AUTHENTICATOR_NOT_CONFIGURED");
        }
        const secret = this.secService.decrypt(device.secretHash);
        if (!this.totpService.verify(secret, code)) {
            await this.integrations.audit({
                action: `${action}.mfa_invalid`,
                entityType: "authenticator_device",
                entityId: userId,
                newValues: { method: "auth_app_otp" },
            }, context);
            throw new AppError("Invalid authenticator code", 401, "AUTHENTICATOR_CODE_INVALID");
        }
        await this.integrations.audit({
            action: `${action}.mfa_verified`,
            entityType: "authenticator_device",
            entityId: userId,
            newValues: {
                method: "auth_app_otp",
                sessionId: context.securityContext.sessionId,
            },
        }, context);
    }
    async requirePlan(planId) {
        const plan = await this.repository.findPlanById(planId);
        if (!plan) {
            throw new AppError("Plan not found", 404, "BILLING_PLAN_NOT_FOUND");
        }
        return plan;
    }
    async requireCurrentSubscription(companyId) {
        const subscription = await this.repository.findCurrentSubscription(companyId);
        if (!subscription) {
            throw new AppError("Subscription not found", 404, "BILLING_SUBSCRIPTION_NOT_FOUND");
        }
        return subscription;
    }
    async createLifecycleInvoice(subscription, charge, periodStart, periodEnd, action, context) {
        return this.repository.createInvoice({
            companyId: subscription.userId,
            subscriptionId: subscription.id,
            invoiceNumber: this.buildInvoiceNumber(),
            status: InvoiceStatus.Open,
            subtotalAmount: charge.subtotalAmount,
            taxAmount: charge.taxAmount,
            discountAmount: "0.00",
            creditAppliedAmount: "0.00",
            totalAmount: charge.finalAmount,
            paidAmount: "0.00",
            currencyCode: charge.currencyCode,
            dueDate: BillingDateUtil.addDays(new Date(), BILLING_DEFAULTS.invoiceDueDays),
            periodStart,
            periodEnd,
            gatewayInvoiceId: null,
            idempotencyKey: context.idempotencyKey ?? null,
            metadata: { action, taxCalculationId: charge.taxCalculationId, taxBreakdown: charge.taxBreakdown },
            paidAt: null,
        });
    }
    async startCardCheckout(params) {
        const usesSetupMode = MoneyUtil.isZero(params.charge.finalAmount);
        const checkout = await this.paymentGateway.createCheckoutSession({
            companyId: params.companyId,
            subscriptionId: params.subscription.id,
            planName: params.planName,
            amount: params.charge.finalAmount,
            currencyCode: params.charge.currencyCode,
            paymentMethodTypes: ["card"],
            checkoutMode: usesSetupMode ? "setup" : "payment",
            metadata: {
                invoiceId: params.invoice.id,
                action: params.action,
                ...(params.extraMetadata ?? {}),
            },
            idempotencyKey: params.context.idempotencyKey,
        });
        const paymentMetadata = {
            action: params.action,
            checkoutMode: usesSetupMode ? "setup" : "payment",
            paymentMethodType: PaymentMethodType.Card,
            checkoutUrl: checkout.checkoutUrl,
        };
        if (params.existingPaymentId) {
            const updated = await this.repository.updatePayment(params.companyId, params.existingPaymentId, {
                status: PaymentStatus.Pending,
                gatewayPaymentId: checkout.checkoutSessionId,
                failureReason: null,
                paidAt: null,
                metadata: paymentMetadata,
            });
            if (!updated) {
                throw new AppError("Payment not found", 404, "BILLING_PAYMENT_NOT_FOUND");
            }
            await this.repository.updateInvoice(params.companyId, params.invoice.id, {
                gatewayInvoiceId: checkout.checkoutSessionId,
            });
            return { payment: updated, checkout: { checkoutSessionId: checkout.checkoutSessionId, checkoutUrl: checkout.checkoutUrl, status: checkout.status } };
        }
        const payment = await this.repository.createPayment({
            companyId: params.companyId,
            invoiceId: params.invoice.id,
            subscriptionId: params.subscription.id,
            gateway: "stripe",
            gatewayPaymentId: checkout.checkoutSessionId,
            status: PaymentStatus.Pending,
            amount: params.charge.finalAmount,
            currencyCode: params.charge.currencyCode,
            failureReason: null,
            idempotencyKey: params.context.idempotencyKey ?? null,
            metadata: paymentMetadata,
            paidAt: null,
        });
        await this.repository.updateInvoice(params.companyId, params.invoice.id, {
            gatewayInvoiceId: checkout.checkoutSessionId,
        });
        return { payment, checkout: { checkoutSessionId: checkout.checkoutSessionId, checkoutUrl: checkout.checkoutUrl, status: checkout.status } };
    }
    async createLifecyclePayment(invoice, paymentMethod, charge, action, context) {
        if (!invoice.companyId) {
            throw new AppError("Company context required", 403, "COMPANY_CONTEXT_MISSING");
        }
        const gatewayResult = await this.paymentGateway.charge({
            companyId: invoice.companyId,
            invoiceId: invoice.id,
            amount: charge.finalAmount,
            currencyCode: charge.currencyCode,
            customerId: this.decryptGatewayReference(paymentMethod?.stripeCustomerId),
            paymentMethodId: this.decryptGatewayReference(paymentMethod?.stripePaymentMethodId),
            idempotencyKey: context.idempotencyKey,
        });
        return this.repository.createPayment({
            companyId: invoice.companyId,
            invoiceId: invoice.id,
            subscriptionId: invoice.subscriptionId,
            gateway: "stripe",
            gatewayPaymentId: gatewayResult.gatewayPaymentId,
            status: gatewayResult.status === PaymentStatus.Succeeded ? PaymentStatus.Succeeded : PaymentStatus.Failed,
            amount: charge.finalAmount,
            currencyCode: charge.currencyCode,
            failureReason: gatewayResult.failureReason ?? null,
            idempotencyKey: context.idempotencyKey ?? null,
            metadata: { action, paymentMethodId: paymentMethod?.id },
            paidAt: gatewayResult.status === PaymentStatus.Succeeded ? new Date() : null,
        });
    }
    async buildPlanCharge(plan, billingCycle, context) {
        const subtotalAmount = this.planAmount(plan, billingCycle);
        const taxResult = await this.estimateBillingTax({
            subtotalAmount,
            currencyCode: this.planCurrency(plan),
            sourceModule: TaxSourceModule.Subscription,
            sourceEntityType: "subscription_plan",
            sourceEntityId: plan?.id,
            lineId: plan?.id ?? "subscription-plan",
            description: plan?.name ?? "Subscription plan",
            context,
        });
        const taxAmount = taxResult.taxAmount;
        return {
            subtotalAmount,
            taxAmount,
            finalAmount: MoneyUtil.add(subtotalAmount, taxAmount),
            currencyCode: this.planCurrency(plan),
            remainingCreditAmount: "0.00",
            taxBreakdown: taxResult.breakdown,
            taxCalculationId: taxResult.calculationId,
        };
    }
    async buildProratedUpgradeCharge(currentPlan, targetPlan, subscription, billingCycle, context) {
        const now = Date.now();
        const totalMs = Math.max(1, subscription.currentPeriodEnd.getTime() - subscription.currentPeriodStart.getTime());
        const remainingMs = Math.max(0, subscription.currentPeriodEnd.getTime() - now);
        const ratio = remainingMs / totalMs;
        const currentCredit = this.multiply(this.planAmount(currentPlan, billingCycle), ratio);
        const targetAmount = this.multiply(this.planAmount(targetPlan, billingCycle), ratio);
        const subtotalAmount = MoneyUtil.compare(targetAmount, currentCredit) > 0 ? MoneyUtil.subtract(targetAmount, currentCredit) : "0.00";
        const taxResult = await this.estimateBillingTax({
            subtotalAmount,
            currencyCode: this.planCurrency(targetPlan),
            sourceModule: TaxSourceModule.Billing,
            sourceEntityType: "subscription_upgrade",
            sourceEntityId: subscription.id,
            lineId: targetPlan.id,
            description: `Upgrade to ${targetPlan.name ?? "target plan"}`,
            context,
        });
        const taxAmount = taxResult.taxAmount;
        return {
            subtotalAmount,
            taxAmount,
            finalAmount: MoneyUtil.add(subtotalAmount, taxAmount),
            currencyCode: this.planCurrency(targetPlan),
            remainingCreditAmount: currentCredit,
            taxBreakdown: taxResult.breakdown,
            taxCalculationId: taxResult.calculationId,
        };
    }
    async estimateBillingTax(input) {
        const companyId = this.requireCompany(input.context);
        if (!this.taxEngine || MoneyUtil.isZero(input.subtotalAmount)) {
            return { taxAmount: "0.00", breakdown: { lines: [] } };
        }
        try {
            const result = await this.taxEngine.estimate({
                companyId,
                organizationId: null,
                sourceModule: input.sourceModule,
                sourceEntityType: input.sourceEntityType,
                sourceEntityId: input.sourceEntityId,
                currencyCode: input.currencyCode,
                jurisdictionCode: "GLOBAL",
                lines: [{
                        lineId: input.lineId,
                        description: input.description,
                        quantity: "1",
                        unitAmount: input.subtotalAmount,
                        taxCategory: "SUBSCRIPTION",
                        metadata: { source: "billing" },
                    }],
                metadata: {
                    requestId: input.context.requestId,
                    idempotencyKey: input.context.idempotencyKey,
                },
            }, {
                companyId,
                organizationId: null,
                userId: input.context.securityContext.userId ?? null,
                requestId: input.context.requestId,
                ipAddress: input.context.ipAddress,
                userAgent: input.context.userAgent,
            });
            return {
                taxAmount: result.taxAmount,
                breakdown: {
                    jurisdictionCode: result.jurisdictionCode,
                    lines: result.lines,
                    ruleVersionSnapshot: result.ruleVersionSnapshot,
                },
                calculationId: result.calculationId,
            };
        }
        catch {
            return {
                taxAmount: "0.00",
                breakdown: {
                    lines: [],
                    fallback: "tax_estimate_unavailable",
                    sourceModule: input.sourceModule,
                    sourceEntityType: input.sourceEntityType,
                },
            };
        }
    }
    planAmount(plan, billingCycle) {
        if (!plan || billingCycle === BillingCycle.Trial)
            return "0.00";
        const monthly = String(plan.monthlyPrice ?? "0");
        if (billingCycle === BillingCycle.Quarterly)
            return this.multiply(monthly, 3);
        if (billingCycle === BillingCycle.Yearly || billingCycle === BillingCycle.Annual)
            return String(plan.annualPrice ?? this.multiply(monthly, 12));
        return monthly;
    }
    planCurrency(plan) {
        return String(plan?.currencyCode ?? BILLING_DEFAULTS.currencyCode).toUpperCase();
    }
    durationMonths(billingCycle) {
        if (billingCycle === BillingCycle.Quarterly)
            return 3;
        if (billingCycle === BillingCycle.Yearly || billingCycle === BillingCycle.Annual)
            return 12;
        return 1;
    }
    percent(amount, percent) {
        return this.multiply(amount, percent / 100);
    }
    multiply(amount, factor) {
        return (Math.round(Number(amount) * factor * 100) / 100).toFixed(2);
    }
    snapshotPlan(plan) {
        return {
            id: plan.id,
            name: plan.name,
            code: plan.code,
            monthlyPrice: plan.monthlyPrice,
            annualPrice: plan.annualPrice,
            maxUsers: plan.maxUsers,
            maxWarehouses: plan.maxWarehouses,
            maxCompanies: plan.maxCompanies,
            maxStorageGb: plan.maxStorageGb,
            supportsApi: plan.supportsApi,
            supportsSso: plan.supportsSso,
            supportsCustomRoles: plan.supportsCustomRoles,
            supportsMultiEntity: plan.supportsMultiEntity,
            supportsAdvancedReporting: plan.supportsAdvancedReporting,
            supportsSandbox: plan.supportsSandbox,
            purchasedAt: new Date().toISOString(),
        };
    }
    actionSummary(plan, billingCycle, renewalMode, charge, nextBillingAt) {
        return {
            planName: plan.name ?? "",
            billingCycle,
            renewalMode,
            subtotalAmount: charge.subtotalAmount,
            taxAmount: charge.taxAmount,
            finalAmount: charge.finalAmount,
            currencyCode: charge.currencyCode,
            nextBillingAt,
            autoRenew: renewalMode === RenewalMode.Auto,
        };
    }
    paymentMethodSummary(paymentMethod) {
        if (!paymentMethod)
            return null;
        return {
            id: paymentMethod.id,
            type: "type" in paymentMethod ? paymentMethod.type : "card",
            displayBrand: paymentMethod.displayBrand,
            last4: paymentMethod.last4,
            isDefault: paymentMethod.isDefault,
        };
    }
    encryptGatewayReference(value) {
        if (!value)
            return null;
        return this.isEncryptedGatewayReference(value) ? value : this.secService.encrypt(value);
    }
    decryptGatewayReference(value) {
        if (!value)
            return null;
        if (!this.isEncryptedGatewayReference(value))
            return value;
        return this.secService.decrypt(value);
    }
    isEncryptedGatewayReference(value) {
        return /^[0-9a-f]{24}\.[0-9a-f]{32}\.[0-9a-f]+$/i.test(value);
    }
    downgradeImpact(subscription, targetPlan, policy) {
        return {
            currentPlanId: subscription.planId,
            targetPlanId: targetPlan.id,
            policy,
            effectiveAt: policy === SubscriptionChangePolicy.Immediate ? new Date() : subscription.currentPeriodEnd,
            accessMayReduce: true,
            limitsAfterDowngrade: {
                maxUsers: targetPlan.maxUsers,
                maxWarehouses: targetPlan.maxWarehouses,
                maxCompanies: targetPlan.maxCompanies,
            },
        };
    }
    toStripePaymentMethodTypes(type) {
        if (type === PaymentMethodType.Upi)
            return ["upi"];
        if (type === PaymentMethodType.BankAccount)
            return ["us_bank_account"];
        if (type === PaymentMethodType.Link)
            return ["link"];
        return ["card"];
    }
    displayPaymentMethod(type) {
        return type.replace(/_/g, " ");
    }
    async auditAndEmit(eventName, entityId, payload, context) {
        await this.integrations.audit({
            action: eventName,
            entityType: "billing",
            entityId,
            newValues: payload,
        }, context);
        await this.integrations.emitWorkflow(eventName, { entityId, payload: payload }, context);
    }
    requireCompany(context) {
        const companyId = context.securityContext.companyId;
        if (!companyId) {
            throw new AppError("Company context required", 403, "COMPANY_CONTEXT_MISSING");
        }
        return companyId;
    }
    requireBillingProfileScope(context) {
        const userId = context.securityContext.userId;
        if (!userId) {
            throw new AppError("Authentication required", 401, "AUTH_REQUIRED");
        }
        return {
            companyId: context.securityContext.companyId ?? null,
            userId,
        };
    }
    buildInvoiceNumber() {
        return `BILL-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(Math.random() * 1_000_000).toString().padStart(6, "0")}`;
    }
    async createPaymentProfile(dto, context) {
        await this.requireAuthenticatorVerification(dto, context, "payment.profile.create");
        const userId = context.securityContext.userId;
        if (!userId) {
            throw new AppError("Authentication required", 401, "AUTH_REQUIRED");
        }
        const companyId = context.securityContext.companyId ?? null;
        // Limit check: Max 3 profiles
        const count = await this.repository.countActivePaymentProfiles(companyId, userId);
        if (count >= 3) {
            throw new AppError("Maximum of 3 payment profiles is allowed", 422, "BILLING_MAX_PAYMENT_PROFILES_REACHED");
        }
        // Run 18-step verification on the card details
        const verificationReport = await this.cardVerificationService.verifyCardDetails(dto, context);
        // Encrypt sensitive card details
        const cardNumberEncrypted = EncryptionUtil.encrypt(dto.cardNumber);
        const cvcEncrypted = EncryptionUtil.encrypt(dto.cvc);
        const last4 = dto.cardNumber.slice(-4);
        const displayBrand = this.detectCardBrand(dto.cardNumber);
        const profile = await this.repository.createPaymentProfile({
            companyId,
            userId,
            fullName: dto.fullName,
            cardNumberEncrypted,
            expiryMonth: dto.expiryMonth,
            expiryYear: dto.expiryYear,
            cvcEncrypted,
            addressLine1: dto.addressLine1,
            addressLine2: dto.addressLine2 ?? null,
            city: dto.city,
            state: dto.state,
            country: dto.country,
            postalCode: dto.postalCode,
            last4,
            displayBrand,
            isDefault: dto.isDefault,
            metadata: {
                ...dto.metadata,
                verificationReport,
            },
        });
        await this.auditAndEmit("payment.profile.added", profile.id, profile, context);
        return profile;
    }
    async listPaymentProfiles(context) {
        const userId = context.securityContext.userId;
        if (!userId) {
            throw new AppError("Authentication required", 401, "AUTH_REQUIRED");
        }
        const companyId = context.securityContext.companyId ?? null;
        return this.repository.listPaymentProfiles(companyId, userId);
    }
    async updatePaymentProfile(id, dto, context) {
        await this.requireAuthenticatorVerification(dto, context, "payment.profile.update");
        const userId = context.securityContext.userId;
        if (!userId) {
            throw new AppError("Authentication required", 401, "AUTH_REQUIRED");
        }
        const companyId = context.securityContext.companyId ?? null;
        const updated = await this.repository.updatePaymentProfile(companyId, id, dto, userId);
        if (!updated)
            throw new AppError("Payment profile not found", 404, "BILLING_PAYMENT_PROFILE_NOT_FOUND");
        await this.auditAndEmit("payment.profile.updated", id, updated, context);
        return updated;
    }
    async removePaymentProfile(id, context) {
        const userId = context.securityContext.userId;
        if (!userId) {
            throw new AppError("Authentication required", 401, "AUTH_REQUIRED");
        }
        const companyId = context.securityContext.companyId ?? null;
        // Deletion constraint check
        const activeProfiles = await this.repository.listPaymentProfiles(companyId, userId);
        if (activeProfiles.length <= 1) {
            throw new AppError("Cannot delete the only payment profile. You must maintain at least one payment profile.", 422, "BILLING_LAST_PAYMENT_PROFILE_DELETION_BLOCKED");
        }
        const profileToDelete = activeProfiles.find(p => p.id === id);
        if (!profileToDelete) {
            throw new AppError("Payment profile not found", 404, "BILLING_PAYMENT_PROFILE_NOT_FOUND");
        }
        const wasDefault = profileToDelete.isDefault;
        const removed = await this.repository.transaction(async (tx) => {
            const deletedRecord = await tx.removePaymentProfile(companyId, id, userId);
            if (!deletedRecord) {
                throw new AppError("Payment profile not found", 404, "BILLING_PAYMENT_PROFILE_NOT_FOUND");
            }
            if (wasDefault) {
                const remainingProfiles = await tx.listPaymentProfiles(companyId, userId);
                if (remainingProfiles.length > 0) {
                    await tx.updatePaymentProfile(companyId, remainingProfiles[0].id, { isDefault: true }, userId);
                }
            }
            return deletedRecord;
        });
        await this.auditAndEmit("payment.profile.removed", id, removed, context);
        return removed;
    }
    async setDefaultPaymentProfile(id, context) {
        const userId = context.securityContext.userId;
        if (!userId) {
            throw new AppError("Authentication required", 401, "AUTH_REQUIRED");
        }
        const companyId = context.securityContext.companyId ?? null;
        const updated = await this.repository.updatePaymentProfile(companyId, id, { isDefault: true }, userId);
        if (!updated)
            throw new AppError("Payment profile not found", 404, "BILLING_PAYMENT_PROFILE_NOT_FOUND");
        await this.auditAndEmit("payment.profile.default_set", id, updated, context);
        return updated;
    }
    detectCardBrand(cardNumber) {
        const num = cardNumber.replace(/\D/g, "");
        if (/^4/.test(num))
            return "Visa";
        if (/^5[1-5]/.test(num))
            return "Mastercard";
        if (/^3[47]/.test(num))
            return "American Express";
        if (/^6(?:011|5)/.test(num))
            return "Discover";
        return "Card";
    }
}
