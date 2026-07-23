import { describe, expect, it } from "vitest";
import { TaxCalculationMethod, TaxCompoundingMode, TaxExemptionStatus, TaxProfileOwnerType, TaxRuleStatus, TaxRuleType, TaxScopeLevel, TaxSourceModule } from "./constants/tax.constants";
import { TaxCalculationService } from "./domain/services";
const baseRule = {
    id: "11111111-1111-1111-1111-111111111111",
    companyId: "22222222-2222-2222-2222-222222222222",
    organizationId: null,
    ruleCode: "GST18",
    ruleName: "GST 18",
    description: null,
    taxType: TaxRuleType.Percentage,
    calculationMethod: TaxCalculationMethod.Exclusive,
    compoundingMode: TaxCompoundingMode.Standard,
    ratePercent: "18",
    fixedAmount: null,
    currencyCode: "INR",
    jurisdictionId: null,
    jurisdictionCode: "IN",
    taxCategory: "GENERAL",
    taxGroupCode: null,
    priority: 100,
    scopeLevel: TaxScopeLevel.Company,
    appliesTo: "ALL",
    isRecoverable: false,
    requiresApproval: false,
    approvalStatus: "APPROVED",
    version: 1,
    parentRuleId: null,
    effectiveFrom: new Date("2026-01-01T00:00:00.000Z"),
    effectiveTo: null,
    status: TaxRuleStatus.Active,
    metadata: {},
    createdBy: null,
    updatedBy: null,
    deactivatedAt: null,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};
const input = {
    companyId: "22222222-2222-2222-2222-222222222222",
    sourceModule: TaxSourceModule.Invoice,
    transactionDate: new Date("2026-05-29T00:00:00.000Z"),
    currencyCode: "INR",
    jurisdictionCode: "IN",
    lines: [{ lineId: "L1", quantity: "2", unitAmount: "100.00", taxCategory: "GENERAL" }],
};
describe("TaxCalculationService", () => {
    it("calculates exclusive percentage taxes", () => {
        const result = new TaxCalculationService().calculate(input, [baseRule]);
        expect(result.taxableAmount).toBe("200.00");
        expect(result.taxAmount).toBe("36.00");
        expect(result.totalAmount).toBe("236.00");
    });
    it("extracts inclusive percentage taxes", () => {
        const result = new TaxCalculationService().calculate({ ...input, lines: [{ ...input.lines[0], taxIncluded: true }] }, [{ ...baseRule, calculationMethod: TaxCalculationMethod.Inclusive }]);
        expect(result.taxAmount).toBe("30.51");
        expect(result.totalAmount).toBe("200.00");
    });
    it("supports fixed taxes", () => {
        const result = new TaxCalculationService().calculate(input, [{ ...baseRule, taxType: TaxRuleType.Fixed, fixedAmount: "5.00", ratePercent: null }]);
        expect(result.taxAmount).toBe("10.00");
        expect(result.totalAmount).toBe("210.00");
    });
    it("supports compound taxes", () => {
        const cessRule = { ...baseRule, id: "33333333-3333-3333-3333-333333333333", ruleCode: "CESS10", ruleName: "CESS 10", ratePercent: "10", priority: 200, compoundingMode: TaxCompoundingMode.Compound };
        const result = new TaxCalculationService().calculate(input, [baseRule, cessRule]);
        expect(result.taxAmount).toBe("59.60");
        expect(result.totalAmount).toBe("259.60");
    });
    it("applies profile exemptions", () => {
        const profile = {
            id: "44444444-4444-4444-4444-444444444444",
            companyId: input.companyId,
            organizationId: null,
            ownerType: TaxProfileOwnerType.Customer,
            ownerId: "55555555-5555-5555-5555-555555555555",
            taxRegistrationNumber: null,
            gstNumber: null,
            vatNumber: null,
            taxIdentifier: null,
            businessTaxCategory: null,
            taxCategory: "GENERAL",
            exemptionStatus: TaxExemptionStatus.Exempt,
            exemptionReason: "certificate",
            jurisdictionCode: "IN",
            registrationDetails: {},
            metadata: {},
            version: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        const result = new TaxCalculationService().calculate(input, [baseRule], [profile]);
        expect(result.taxAmount).toBe("0.00");
        expect(result.lines[0].exempt).toBe(true);
    });
    it("creates stable snapshots", () => {
        const result = new TaxCalculationService().calculate(input, [baseRule]);
        expect(result.calculationHash).toHaveLength(64);
        expect(result.ruleVersionSnapshot).toMatchObject({ rules: [{ ruleCode: "GST18", version: 1 }] });
    });
});
