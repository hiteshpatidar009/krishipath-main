import { describe, expect, it } from "vitest";
import { join } from "path";
import { registerEnterpriseModuleTests } from "../../shared/testing/enterprise-test-kit";
import { EnterpriseModule } from "./module";
import { EnterpriseService } from "./services/enterprise.service";
registerEnterpriseModuleTests({
    moduleName: "enterprise-management",
    moduleDir: join(__dirname),
    ModuleClass: EnterpriseModule,
    expectedRouteCount: 38,
    requiresAuth: true,
});
describe("EnterpriseService", () => {
    it("rejects enterprise creation when selected company is not owned by actor", async () => {
        const repository = fakeRepository({
            isCompanyOwner: false,
            companyHasEnterpriseEnabled: true,
        });
        const service = new EnterpriseService(repository);
        await expect(service.create({
            enterpriseCode: "ABC",
            enterpriseName: "ABC Holdings",
            enterpriseType: "PARENT_ENTERPRISE",
            ownerUserId: "11111111-1111-4111-8111-111111111111",
            anchorCompanyId: "22222222-2222-4222-8222-222222222222",
        })).rejects.toMatchObject({ code: "ENTERPRISE_COMPANY_OWNER_REQUIRED" });
    });
    it("rejects enterprise creation when subscription capability is disabled", async () => {
        const repository = fakeRepository({
            isCompanyOwner: true,
            companyHasEnterpriseEnabled: false,
        });
        const service = new EnterpriseService(repository);
        await expect(service.create({
            enterpriseCode: "ABC",
            enterpriseName: "ABC Holdings",
            enterpriseType: "PARENT_ENTERPRISE",
            ownerUserId: "11111111-1111-4111-8111-111111111111",
            anchorCompanyId: "22222222-2222-4222-8222-222222222222",
        })).rejects.toMatchObject({ code: "ENTERPRISE_CAPABILITY_REQUIRED" });
    });
    it("rejects intercompany transfer outside enterprise company set", async () => {
        const repository = fakeRepository({
            hasEnterpriseAdminAccess: true,
            enterpriseBelongsToHierarchy: false,
        });
        const service = new EnterpriseService(repository);
        await expect(service.createTransfer({
            enterpriseId: "33333333-3333-4333-8333-333333333333",
            sourceEnterpriseId: "44444444-4444-4444-8444-444444444444",
            destinationEnterpriseId: "55555555-5555-4555-8555-555555555555",
            sourceCompanyId: "44444444-4444-4444-8444-444444444444",
            destinationCompanyId: "55555555-5555-4555-8555-555555555555",
            transferNumber: "ICT-001",
            transferType: "STOCK_TRANSFER",
            transferDate: "2026-06-22",
            priority: "NORMAL",
            reason: "Stock replenishment",
            settlementMethod: "Intercompany Invoice",
            billingEnterpriseId: "44444444-4444-4444-8444-444444444444",
            currency: "INR",
            items: [{
                    productSku: "PRD-1001",
                    productName: "Wireless Bluetooth Headphones",
                    availableStock: "10",
                    transferQuantity: "2",
                    uom: "Each",
                    unitCost: "1250",
                }],
            createdBy: "11111111-1111-4111-8111-111111111111",
            contextCompanyId: "44444444-4444-4444-8444-444444444444",
        })).rejects.toMatchObject({ code: "INTERCOMPANY_ENTERPRISE_SCOPE_INVALID" });
    });
    it("creates an intercompany transfer with tax handling and invoice generation options", async () => {
        const repository = fakeRepository({
            hasEnterpriseAdminAccess: true,
            enterpriseBelongsToHierarchy: true,
            companyBelongsToEnterprise: true,
            createTransfer: async (input) => ({
                overview: {
                    transfer_id: "test-id",
                    tax_handling: input.taxHandling,
                    invoice_generation: input.invoiceGeneration,
                },
            }),
        });
        const service = new EnterpriseService(repository);
        const result = await service.createTransfer({
            enterpriseId: "33333333-3333-4333-8333-333333333333",
            sourceEnterpriseId: "44444444-4444-4444-8444-444444444444",
            destinationEnterpriseId: "55555555-5555-4555-8555-555555555555",
            sourceCompanyId: "44444444-4444-4444-8444-444444444444",
            destinationCompanyId: "55555555-5555-4555-8555-555555555555",
            transferNumber: "ICT-001",
            transferType: "STOCK_TRANSFER",
            transferDate: "2026-06-22",
            priority: "NORMAL",
            reason: "Stock replenishment",
            settlementMethod: "Intercompany Invoice",
            billingEnterpriseId: "44444444-4444-4444-8444-444444444444",
            currency: "INR",
            taxHandling: "exclusive",
            invoiceGeneration: "automatic",
            items: [{
                    productSku: "PRD-1001",
                    productName: "Wireless Bluetooth Headphones",
                    availableStock: "10",
                    transferQuantity: "2",
                    uom: "Each",
                    unitCost: "1250",
                }],
            createdBy: "11111111-1111-4111-8111-111111111111",
            contextCompanyId: "44444444-4444-4444-8444-444444444444",
        });
        expect(result.overview).toMatchObject({
            tax_handling: "exclusive",
            invoice_generation: "automatic",
        });
    });
});
function fakeRepository(overrides) {
    const repository = {
        listForUser: async () => [],
        findById: async () => null,
        create: async () => ({
            id: "33333333-3333-4333-8333-333333333333",
            code: "ABC",
            name: "ABC Holdings",
            enterpriseType: "PARENT_ENTERPRISE",
            parentEnterpriseId: null,
            parentEnterpriseName: null,
            hierarchyLevel: 0,
            hierarchyPath: "/33333333-3333-4333-8333-333333333333",
            description: null,
            status: "ACTIVE",
            legalName: null,
            taxId: null,
            country: null,
            state: null,
            city: null,
            postalCode: null,
            address: null,
            timezone: "Asia/Kolkata",
            currency: "INR",
            complianceScore: 100,
            complianceStatus: "COMPLIANT",
            ownerUserId: "11111111-1111-4111-8111-111111111111",
            createdBy: "11111111-1111-4111-8111-111111111111",
            updatedBy: "11111111-1111-4111-8111-111111111111",
            createdAt: new Date(),
            updatedAt: new Date(),
        }),
        getDetails: async () => null,
        update: async () => null,
        archive: async () => null,
        activate: async () => null,
        deactivate: async () => null,
        move: async () => null,
        parentExists: async () => false,
        wouldCreateCycle: async () => false,
        codeExists: async () => false,
        hierarchyTree: async () => [],
        getConfiguration: async () => ({}),
        replaceConfiguration: async () => ({}),
        inheritAllConfiguration: async () => ({}),
        resetConfigurationOverride: async () => ({}),
        copyConfiguration: async () => ({}),
        listDocuments: async () => [],
        addDocument: async () => ({}),
        deleteDocument: async () => false,
        auditLogs: async () => [],
        hasEnterpriseAccess: async () => false,
        hasEnterpriseAdminAccess: async () => Boolean(overrides.hasEnterpriseAdminAccess),
        isCompanyOwner: async () => Boolean(overrides.isCompanyOwner),
        companyHasEnterpriseEnabled: async () => Boolean(overrides.companyHasEnterpriseEnabled),
        listCompanies: async () => [],
        addCompany: async () => ({}),
        removeCompany: async () => false,
        companyHasAnyEnterprise: async () => false,
        listUsers: async () => [],
        addUser: async () => ({}),
        removeUser: async () => false,
        companyBelongsToEnterprise: async () => Boolean(overrides.companyBelongsToEnterprise),
        listTransfers: async () => ({}),
        getTransfer: async () => null,
        createTransfer: overrides.createTransfer
            ? overrides.createTransfer
            : (async () => ({})),
        decideTransfer: async () => null,
        transitionTransfer: async () => null,
        enterpriseBelongsToHierarchy: async () => Boolean(overrides.enterpriseBelongsToHierarchy),
        listInvoices: async () => [],
        createInvoice: async () => ({}),
        reportingSummary: async () => ({}),
    };
    return repository;
}
