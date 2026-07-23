import { randomUUID } from "crypto";
import { CoreEventBus, EventEnvelopeFactory } from "../../../core";
import { logger } from "../../../infrastructure/logger";
import { AppError } from "../../../shared/errors/app.error";
import { SubscriptionEvents } from "../events/subscription.events";
export class SubscriptionService {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    plans() {
        return this.repo.listPlans().then((plans) => {
            const comparisonSections = [
                {
                    title: "Scale & Limits",
                    rows: [
                        {
                            label: "Users",
                            values: plans.reduce((acc, plan) => {
                                const limit = plan.maxUsers ?? 0;
                                acc[String(plan.code ?? "").toLowerCase()] = limit >= 500 ? "Unlimited" : String(limit);
                                return acc;
                            }, {})
                        },
                        {
                            label: "Companies",
                            values: plans.reduce((acc, plan) => {
                                const limit = plan.maxCompanies ?? 0;
                                acc[String(plan.code ?? "").toLowerCase()] = limit >= 25 ? "Unlimited" : String(limit);
                                return acc;
                            }, {})
                        },
                        {
                            label: "Warehouses",
                            values: plans.reduce((acc, plan) => {
                                const limit = plan.maxWarehouses ?? 0;
                                acc[String(plan.code ?? "").toLowerCase()] = limit >= 100 ? "Unlimited" : String(limit);
                                return acc;
                            }, {})
                        },
                        {
                            label: "Products",
                            values: plans.reduce((acc, plan) => {
                                const limit = plan.maxProducts ?? 0;
                                acc[String(plan.code ?? "").toLowerCase()] = limit >= 1000000 ? "Unlimited" : limit.toLocaleString();
                                return acc;
                            }, {})
                        },
                        {
                            label: "Storage",
                            values: plans.reduce((acc, plan) => {
                                const limit = plan.maxStorageGb ?? 0;
                                acc[String(plan.code ?? "").toLowerCase()] = limit >= 1024 ? `${limit / 1024} TB` : `${limit} GB`;
                                return acc;
                            }, {})
                        },
                    ]
                },
                {
                    title: "Operations & Orders",
                    rows: [
                        {
                            label: "Bin Locations",
                            values: plans.reduce((acc, plan) => {
                                const warehouses = plan.maxWarehouses ?? 0;
                                acc[String(plan.code ?? "").toLowerCase()] = warehouses >= 100 ? "Unlimited" : warehouses >= 5 ? "5,000" : warehouses >= 2 ? "500" : false;
                                return acc;
                            }, {})
                        },
                        {
                            label: "Pick, Pack, & Ship Workflows",
                            values: plans.reduce((acc, plan) => {
                                const warehouses = plan.maxWarehouses ?? 0;
                                acc[String(plan.code ?? "").toLowerCase()] = warehouses >= 2;
                                return acc;
                            }, {})
                        },
                        {
                            label: "Sales Orders / Month",
                            values: plans.reduce((acc, plan) => {
                                const limit = plan.maxSalesOrders ?? 0;
                                acc[String(plan.code ?? "").toLowerCase()] = limit >= 1000000 ? "Unlimited" : limit.toLocaleString();
                                return acc;
                            }, {})
                        },
                        {
                            label: "Purchase Orders / Month",
                            values: plans.reduce((acc, plan) => {
                                const limit = plan.maxPurchaseOrders ?? 0;
                                acc[String(plan.code ?? "").toLowerCase()] = limit >= 1000000 ? "Unlimited" : limit.toLocaleString();
                                return acc;
                            }, {})
                        },
                    ]
                },
                {
                    title: "Integrations & Security",
                    rows: [
                        {
                            label: "API Keys",
                            values: plans.reduce((acc, plan) => {
                                const limit = plan.maxApiKeys ?? 0;
                                acc[String(plan.code ?? "").toLowerCase()] = limit >= 100 ? "Unlimited" : limit > 0 ? (plan.code === "starter" ? "1 (Read-Only)" : `${limit} (Full)`) : false;
                                return acc;
                            }, {})
                        },
                        {
                            label: "Webhooks",
                            values: plans.reduce((acc, plan) => {
                                const limit = plan.maxWebhooks ?? 0;
                                acc[String(plan.code ?? "").toLowerCase()] = limit >= 100 ? "Unlimited" : limit > 0 ? String(limit) : false;
                                return acc;
                            }, {})
                        },
                        {
                            label: "Single Sign-On (SSO)",
                            values: plans.reduce((acc, plan) => {
                                acc[String(plan.code ?? "").toLowerCase()] = plan.enterpriseEnabled ? "Unlimited" : (plan.code === "growth" ? "25" : "0");
                                return acc;
                            }, {})
                        },
                        {
                            label: "Multi-Currency Support",
                            values: plans.reduce((acc, plan) => {
                                acc[String(plan.code ?? "").toLowerCase()] = plan.supportsMultiEntity ?? false;
                                return acc;
                            }, {})
                        },
                    ]
                },
                {
                    title: "Support & SLA",
                    rows: [
                        {
                            label: "Support Channels",
                            values: plans.reduce((acc, plan) => {
                                acc[String(plan.code ?? "").toLowerCase()] = plan.enterpriseEnabled ? "Dedicated" : (plan.code === "growth" ? "Email + Phone" : (plan.code === "starter" ? "Email" : "Community"));
                                return acc;
                            }, {})
                        },
                        {
                            label: "SLA Response Time",
                            values: plans.reduce((acc, plan) => {
                                acc[String(plan.code ?? "").toLowerCase()] = plan.enterpriseEnabled ? "1 Hour" : (plan.code === "growth" ? "4 Hours" : (plan.code === "starter" ? "24 Hours" : false));
                                return acc;
                            }, {})
                        },
                    ]
                }
            ];
            const decoratedPlans = plans.map((plan) => {
                const code = String(plan.code ?? plan.name ?? "").toLowerCase();
                const isFree = code.includes("free") || code.includes("solo");
                const isStarter = code.includes("starter") || code.includes("grow");
                const isGrowth = code.includes("growth") || code.includes("scale");
                const isEnterprise = code.includes("enterprise");
                const monthlyPrice = Number(plan.monthlyPrice ?? 0);
                const annualPrice = Number(plan.annualPrice ?? 0);
                const annualSavingPercent = monthlyPrice > 0 && annualPrice > 0
                    ? Math.max(0, Math.round(((monthlyPrice * 12 - annualPrice) / (monthlyPrice * 12)) * 100))
                    : 0;
                return {
                    ...plan,
                    ui: {
                        icon: isFree ? "free" : isStarter ? "starter" : isGrowth ? "growth" : "enterprise",
                        popular: isGrowth,
                        tagline: isFree
                            ? "Establish your inventory foundation."
                            : isStarter
                                ? "Perfect for small teams getting started."
                                : isGrowth
                                    ? "Best for growing businesses and teams."
                                    : "For large organizations with advanced needs.",
                        sectionLabel: isFree
                            ? "Core Inventory Features"
                            : isStarter
                                ? "Everything in Free, plus"
                                : isGrowth
                                    ? "Everything in Starter, plus"
                                    : "Everything in Growth, plus",
                        trial: {
                            days: 14,
                            title: "14-day free trial",
                            subtitle: "Valid payment profile required",
                        },
                        billing: {
                            monthlyLabel: "Monthly billing",
                            annualLabel: "Annual billing",
                            annualSavingPercent,
                        },
                        comparison: this.buildPlanComparison(plan),
                        featureCategories: [
                            { title: "Inventory Management", description: "Real-time stock, variants, serial tracking & more", icon: "inventory" },
                            { title: "Warehouse Management", description: "Putaway, pick, pack, ship, locations & zones", icon: "warehouse" },
                            { title: "Purchase & Sales", description: "PO, SO, returns, invoices & subscriptions", icon: "sales" },
                            { title: "Reports & Analytics", description: "Powerful insights to grow your business", icon: "analytics" },
                            { title: "Mobile App", description: "Scan, manage & operate on the go", icon: "mobile" },
                        ],
                    },
                    features: this.planFeatures(plan),
                };
            });
            return {
                plans: decoratedPlans,
                comparisonSections,
            };
        });
    }
    buildPlanComparison(plan) {
        const code = String(plan.code ?? "").toLowerCase();
        const limitToString = (limit, threshold) => {
            if (limit === null || limit === undefined || limit >= threshold)
                return "Unlimited";
            return String(limit);
        };
        return {
            enterprises: plan.enterpriseEnabled ? "Unlimited" : "0",
            companies: limitToString(plan.maxCompanies, 25),
            organizations: limitToString(plan.maxOrganizations, 1000),
            warehouses: limitToString(plan.maxWarehouses, 100),
            teams: plan.enterpriseEnabled ? "Unlimited" : (code === "growth" ? "10" : (code === "starter" ? "2" : "0")),
            users: limitToString(plan.maxUsers, 500),
            roles: plan.enterpriseEnabled ? "Unlimited" : (code === "growth" ? "50" : (code === "starter" ? "10" : "Default")),
            permissionSets: plan.enterpriseEnabled ? "Unlimited" : (code === "growth" ? "25" : (code === "starter" ? "5" : false)),
            ssoUsers: plan.enterpriseEnabled ? "Unlimited" : (code === "growth" ? "25" : "0"),
            customRoles: plan.supportsCustomRoles ?? false,
            products: limitToString(plan.maxProducts, 1000000),
            productVariants: plan.enterpriseEnabled ? "Unlimited" : (code === "growth" ? "200,000" : (code === "starter" ? "20,000" : "500")),
            categories: plan.enterpriseEnabled ? "Unlimited" : (code === "growth" ? "1,000" : (code === "starter" ? "100" : "10")),
            brands: plan.enterpriseEnabled ? "Unlimited" : (code === "growth" ? "1,000" : (code === "starter" ? "100" : "10")),
            customers: limitToString(plan.maxCustomers, 1000000),
            suppliers: limitToString(plan.maxSuppliers, 1000000),
            attachmentsDocuments: plan.enterpriseEnabled ? "Unlimited" : (code === "growth" ? "100,000" : (code === "starter" ? "10,000" : "500")),
            warehouseZones: plan.enterpriseEnabled ? "Unlimited" : (code === "growth" ? "50" : (code === "starter" ? "10" : false)),
            binLocations: plan.enterpriseEnabled ? "Unlimited" : (code === "growth" ? "5,000" : (code === "starter" ? "500" : false)),
            barcodeScanner: true,
            barcodeLabelPrinting: plan.code !== "free",
            qrCodeSupport: plan.code !== "free",
            receivingPutawayLogs: plan.code !== "free",
            pickListsPackingSlips: plan.code !== "free",
            stockReservations: plan.code !== "free",
            cycleCounting: plan.enterpriseEnabled ? "Unlimited" : (code === "growth" ? "200 / Month" : (code === "starter" ? "20 / Month" : false)),
            stockAdjustments: plan.enterpriseEnabled ? "Unlimited" : (code === "growth" ? "5,000" : (code === "starter" ? "500" : "10")),
            stockTransfers: plan.enterpriseEnabled ? "Unlimited" : (code === "growth" ? "2,000" : (code === "starter" ? "200" : "5")),
            intercompanyTransfers: plan.enterpriseEnabled ? true : false,
            purchaseOrders: limitToString(plan.maxPurchaseOrders, 1000000),
            salesOrders: limitToString(plan.maxSalesOrders, 1000000),
            quotations: plan.enterpriseEnabled ? "Unlimited" : (code === "growth" ? "20,000" : (code === "starter" ? "2,000" : "50")),
            goodsReceipts: plan.enterpriseEnabled ? "Unlimited" : (code === "growth" ? "5,000" : (code === "starter" ? "500" : "10")),
            shipments: plan.enterpriseEnabled ? "Unlimited" : (code === "growth" ? "20,000" : (code === "starter" ? "2,000" : "50")),
            returnsRma: plan.enterpriseEnabled ? "Unlimited" : (code === "growth" ? "1,000" : (code === "starter" ? "100" : "5")),
            invoiceGeneration: plan.enterpriseEnabled ? "Unlimited" : (code === "growth" ? "20,000" : (code === "starter" ? "2,000" : "50")),
            paymentTransactions: plan.enterpriseEnabled ? "Unlimited" : (code === "growth" ? "20,000" : (code === "starter" ? "2,000" : "50")),
            multiCurrencySupport: plan.supportsMultiEntity ?? false,
            taxGroups: plan.enterpriseEnabled ? "Unlimited" : (code === "growth" ? "Unlimited" : (code === "starter" ? "Advanced (5)" : "Basic (1)")),
            auditLogHistory: plan.enterpriseEnabled ? "Unlimited" : (code === "growth" ? "90 Days" : (code === "starter" ? "7 Days" : false)),
            activityLogHistory: plan.enterpriseEnabled ? "Unlimited" : (code === "growth" ? "180 Days" : (code === "starter" ? "30 Days" : "7 Days")),
            automationRules: plan.enterpriseEnabled ? "Unlimited" : (code === "growth" ? "50" : (code === "starter" ? "5" : false)),
            approvalWorkflows: plan.enterpriseEnabled ? "Unlimited" : (code === "growth" ? "20" : (code === "starter" ? "2" : false)),
            customFields: plan.enterpriseEnabled ? "Unlimited" : (code === "growth" ? "100" : (code === "starter" ? "10" : false)),
            mobileSyncDevices: plan.enterpriseEnabled ? "Unlimited" : (code === "growth" ? "25" : (code === "starter" ? "5" : "1")),
            apiKeys: plan.enterpriseEnabled ? "Unlimited" : (code === "growth" ? "10 (Full)" : (code === "starter" ? "1 (Read-Only)" : false)),
            webhooksLimit: plan.enterpriseEnabled ? "Unlimited" : (code === "growth" ? "20" : "0"),
            apiRequests: plan.enterpriseEnabled ? "Unlimited" : (code === "growth" ? "500,000" : (code === "starter" ? "10,000" : false)),
            thirdPartyIntegrations: plan.enterpriseEnabled ? "Unlimited" : (code === "growth" ? "10" : (code === "starter" ? "2" : false)),
            storage: (plan.maxStorageGb ?? 1) >= 1024 ? `${(plan.maxStorageGb ?? 1) / 1024} TB` : `${plan.maxStorageGb ?? 1} GB`,
            emailNotifications: plan.enterpriseEnabled ? "Unlimited" : (code === "growth" ? "20,000" : (code === "starter" ? "2,000" : "200")),
            smsNotifications: plan.enterpriseEnabled ? "Unlimited" : (code === "growth" ? "1,000" : (code === "starter" ? "100" : false)),
            pushNotifications: plan.enterpriseEnabled ? "Unlimited" : (code === "growth" ? "50,000" : (code === "starter" ? "5,000" : "500")),
            dashboardWidgets: plan.enterpriseEnabled ? "Unlimited" : (code === "growth" ? "32" : (code === "starter" ? "12" : "4")),
            savedReports: plan.enterpriseEnabled ? "Unlimited" : (code === "growth" ? "100" : (code === "starter" ? "15" : "3")),
            savedFilters: plan.enterpriseEnabled ? "Unlimited" : (code === "growth" ? "150" : (code === "starter" ? "25" : "5")),
            scheduledReports: plan.enterpriseEnabled ? "Unlimited" : (code === "growth" ? "20" : (code === "starter" ? "2" : false)),
            communitySupport: code === "free",
            emailSupport: code !== "free",
            prioritySupport: code === "growth" || plan.enterpriseEnabled,
            dedicatedAccountManager: plan.enterpriseEnabled,
            sla: plan.enterpriseEnabled ? "Enterprise" : (code === "growth" ? "Business" : false),
        };
    }
    planFeatures(plan) {
        const code = String(plan.code ?? plan.name ?? "").toLowerCase();
        const isStarter = code.includes("starter");
        const isGrowth = code.includes("growth");
        const isEnterprise = code.includes("enterprise");
        const maxUsers = plan.maxUsers ?? 10;
        const maxCompanies = plan.maxCompanies ?? 1;
        const maxWarehouses = plan.maxWarehouses ?? 1;
        const maxProducts = plan.maxProducts ?? 100;
        const maxStorageGb = plan.maxStorageGb ?? 1;
        const maxSalesOrders = plan.maxSalesOrders ?? 50;
        const maxPurchaseOrders = plan.maxPurchaseOrders ?? 10;
        const formatLimit = (limit) => limit >= 1000000 ? "Unlimited" : limit.toLocaleString();
        if (isStarter) {
            return [
                `Up to ${maxUsers} Users (Included)`,
                `${maxCompanies} Company & ${maxWarehouses} Warehouses`,
                `${formatLimit(maxProducts)} Products`,
                "Warehouse Zones & Bin Locations",
                "Quotations, Sales, & Purchase Orders",
                "Pick, Pack, & Ship Workflows",
                `${maxStorageGb} GB Storage & CSV Exports`,
                "Email Support (24-Hour SLA)",
            ];
        }
        if (isGrowth) {
            return [
                `Up to ${maxUsers} Users (Included)`,
                `${maxCompanies} Companies & ${maxWarehouses} Warehouses`,
                `${formatLimit(maxProducts)} Products`,
                "REST API & Webhooks",
                "Automation Rules & Approvals",
                "Custom Roles & Permissions",
                "SSO (Single Sign-On)",
                "Priority Support & Business SLA",
            ];
        }
        if (isEnterprise) {
            return [
                "Unlimited Users & Teams",
                `${maxCompanies} Companies & ${maxWarehouses} Warehouses`,
                "Unlimited Products & Variants",
                "Intercompany Transactions",
                "Custom Fields & Custom Workflows",
                "Unlimited API Requests & Webhooks",
                "Dedicated Account Manager",
                "On-Premise / Private Cloud Optional",
            ];
        }
        // Default to Free
        return [
            "14-Day Free Trial",
            `${maxUsers} Users / ${maxCompanies} Company / ${maxWarehouses} Warehouse`,
            `${formatLimit(maxProducts)} Products`,
            "Basic Inventory Tracking",
            `${maxSalesOrders} Sales & ${maxPurchaseOrders} Purchase Orders / Month`,
            "Quotations & Invoicing",
            `${maxStorageGb} GB Secure Cloud Storage`,
            "7-Day Activity History",
        ];
    }
    async createPlan(userId, input) {
        const plan = await this.repo.createPlan(input);
        await logger.info("subscription.plan.created", { module: "subscription", userId, payload: plan });
        return plan;
    }
    async updatePlan(planId, userId, input) {
        const plan = await this.repo.updatePlan(planId, input);
        if (!plan)
            throw new AppError("Plan not found", 404, "SUBSCRIPTION_PLAN_NOT_FOUND");
        await logger.info("subscription.plan.updated", { module: "subscription", userId, payload: plan });
        return plan;
    }
    async create(companyId, userId, input) {
        const result = await this.repo.create({ companyId, subscriptionPlanId: input.subscriptionPlanId, billingCycle: input.billingCycle, trialEndsAt: input.trialDays ? new Date(Date.now() + input.trialDays * 86400000) : undefined });
        await this.event(SubscriptionEvents.created, companyId, userId, result);
        return result;
    }
    async current(companyId) {
        const current = await this.repo.current(companyId);
        if (!current)
            throw new AppError("Subscription not found", 404, "SUBSCRIPTION_NOT_FOUND");
        return current;
    }
    async activate(companyId, userId) {
        await this.repo.status(companyId, "active");
        await this.event(SubscriptionEvents.activated, companyId, userId, {});
        return { status: "active" };
    }
    async suspend(companyId, userId) {
        await this.repo.status(companyId, "suspended");
        await this.event(SubscriptionEvents.suspended, companyId, userId, {});
        return { status: "suspended" };
    }
    async cancel(companyId, userId, reason) {
        await this.repo.status(companyId, "cancelled", reason);
        await this.event(SubscriptionEvents.cancelled, companyId, userId, { reason });
        return { status: "cancelled" };
    }
    async usage(companyId, userId, input) {
        const current = await this.current(companyId);
        await this.repo.usage({ companyId, subscriptionId: current.id, metricName: input.metricName, metricValue: input.metricValue });
        await this.event(SubscriptionEvents.usageRecorded, companyId, userId, input);
        return { recorded: true };
    }
    async entitlements(companyId) {
        const current = await this.current(companyId);
        return { subscription: current, access: current.status === "active" || current.status === "trial" ? "allowed" : "blocked" };
    }
    async event(name, companyId, userId, payload) {
        await logger.info(name, { module: "subscription", companyId, userId, payload });
        await CoreEventBus.publish(EventEnvelopeFactory.create({ id: randomUUID(), name, source: "subscription", payload, metadata: { companyId, userId } }));
    }
}
