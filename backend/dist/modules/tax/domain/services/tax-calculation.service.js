import { createHash } from "crypto";
import { TAX_DEFAULTS, TaxCalculationMethod, TaxCompoundingMode, TaxExemptionStatus, TaxRuleStatus, TaxRuleType, } from "../../constants/tax.constants";
export class TaxCalculationService {
    calculate(input, rules, profiles = []) {
        const effectiveDate = input.transactionDate ?? new Date();
        const jurisdictionCode = input.jurisdictionCode
            ?? input.buyerJurisdictionCode
            ?? input.sellerJurisdictionCode
            ?? TAX_DEFAULTS.defaultJurisdictionCode;
        const profileExemptions = this.profileExemptions(profiles);
        const activeRules = rules
            .filter((rule) => this.isActive(rule, effectiveDate))
            .sort((left, right) => left.priority - right.priority || left.ruleCode.localeCompare(right.ruleCode));
        const lines = input.lines.map((line) => this.calculateLine(line, activeRules, profileExemptions));
        const taxableAmount = this.sum(lines.map((line) => line.taxableAmount));
        const taxAmount = this.sum(lines.map((line) => line.taxAmount));
        const totalAmount = this.sum(lines.map((line) => line.totalAmount));
        const ruleVersionSnapshot = this.ruleSnapshot(lines);
        const inputSnapshot = this.safeInputSnapshot(input);
        return {
            companyId: input.companyId,
            organizationId: input.organizationId ?? null,
            sourceModule: String(input.sourceModule),
            sourceEntityType: input.sourceEntityType,
            sourceEntityId: input.sourceEntityId,
            taxableAmount,
            taxAmount,
            totalAmount,
            currencyCode: input.currencyCode,
            jurisdictionCode,
            effectiveDate,
            lines,
            ruleVersionSnapshot,
            inputSnapshot,
            calculationHash: this.hash({ inputSnapshot, ruleVersionSnapshot, lines }),
        };
    }
    calculateLine(line, rules, profileExemptions) {
        const grossLineAmount = this.lineGross(line);
        const discountAmount = this.money(line.discountAmount ?? "0.00");
        const startingBase = Math.max(0, grossLineAmount - discountAmount);
        const selectedRules = this.selectLineRules(line, rules);
        const appliedExemptions = [...profileExemptions];
        if (line.exempt) {
            appliedExemptions.push("LINE_EXEMPTION");
        }
        if (line.exempt || appliedExemptions.length > 0) {
            return {
                lineId: line.lineId,
                taxableAmount: this.format(startingBase),
                taxAmount: "0.00",
                totalAmount: this.format(startingBase),
                exempt: true,
                appliedExemptions,
                components: [],
            };
        }
        if (line.taxOverrideAmount !== undefined) {
            const overrideAmount = this.money(line.taxOverrideAmount);
            return {
                lineId: line.lineId,
                taxableAmount: this.format(startingBase),
                taxAmount: this.format(overrideAmount),
                totalAmount: this.format(startingBase + overrideAmount),
                exempt: false,
                appliedExemptions: [],
                components: [this.overrideComponent(line, overrideAmount, startingBase)],
            };
        }
        let taxableBase = startingBase;
        let runningBase = startingBase;
        let totalTax = 0;
        const components = [];
        for (const rule of selectedRules) {
            const baseForRule = rule.compoundingMode === TaxCompoundingMode.Compound ? runningBase : taxableBase;
            const taxAmount = this.ruleTaxAmount(rule, baseForRule, line);
            const inclusive = rule.calculationMethod === TaxCalculationMethod.Inclusive || line.taxIncluded === true;
            const componentTax = inclusive ? Math.min(taxAmount, runningBase) : taxAmount;
            if (inclusive) {
                taxableBase = Math.max(0, taxableBase - componentTax);
                runningBase = Math.max(0, runningBase - componentTax);
            }
            else {
                runningBase += componentTax;
            }
            totalTax += componentTax;
            components.push(this.component(rule, baseForRule, componentTax));
        }
        const totalAmount = this.hasInclusiveTax(selectedRules, line)
            ? startingBase
            : startingBase + totalTax;
        return {
            lineId: line.lineId,
            taxableAmount: this.format(taxableBase),
            taxAmount: this.format(totalTax),
            totalAmount: this.format(totalAmount),
            exempt: false,
            appliedExemptions: [],
            components,
        };
    }
    selectLineRules(line, rules) {
        if (line.taxRuleIds && line.taxRuleIds.length > 0) {
            return rules.filter((rule) => line.taxRuleIds?.includes(rule.id));
        }
        const category = line.taxCategory ?? TAX_DEFAULTS.generalCategory;
        return rules.filter((rule) => {
            const categoryMatches = rule.taxCategory === category || rule.taxCategory === TAX_DEFAULTS.generalCategory;
            const groupMatches = !line.taxGroupCode || !rule.taxGroupCode || rule.taxGroupCode === line.taxGroupCode;
            return categoryMatches && groupMatches;
        });
    }
    ruleTaxAmount(rule, baseAmount, line) {
        if (rule.taxType === TaxRuleType.Fixed) {
            return this.money(rule.fixedAmount ?? "0.00") * this.money(line.quantity);
        }
        const rate = this.money(rule.ratePercent ?? "0.00");
        if (rule.calculationMethod === TaxCalculationMethod.Inclusive || line.taxIncluded === true) {
            return baseAmount - (baseAmount / (1 + rate / 100));
        }
        return baseAmount * rate / 100;
    }
    lineGross(line) {
        return this.money(line.quantity) * this.money(line.unitAmount);
    }
    component(rule, taxableAmount, taxAmount) {
        return {
            ruleId: rule.id,
            ruleCode: rule.ruleCode,
            ruleName: rule.ruleName,
            ruleVersion: rule.version,
            taxType: rule.taxType,
            calculationMethod: rule.calculationMethod,
            compoundingMode: rule.compoundingMode,
            ratePercent: rule.ratePercent,
            fixedAmount: rule.fixedAmount,
            jurisdictionCode: rule.jurisdictionCode,
            taxableAmount: this.format(taxableAmount),
            taxAmount: this.format(taxAmount),
            metadata: rule.metadata,
        };
    }
    overrideComponent(line, taxAmount, taxableAmount) {
        return {
            ruleId: "override",
            ruleCode: "TAX_OVERRIDE",
            ruleName: "Line Tax Override",
            ruleVersion: 1,
            taxType: TaxRuleType.Fixed,
            calculationMethod: TaxCalculationMethod.Exclusive,
            compoundingMode: TaxCompoundingMode.Standard,
            ratePercent: null,
            fixedAmount: this.format(taxAmount),
            jurisdictionCode: String(line.metadata?.jurisdictionCode ?? TAX_DEFAULTS.defaultJurisdictionCode),
            taxableAmount: this.format(taxableAmount),
            taxAmount: this.format(taxAmount),
            metadata: { source: "line_override" },
        };
    }
    isActive(rule, effectiveDate) {
        return rule.status === TaxRuleStatus.Active
            && rule.effectiveFrom <= effectiveDate
            && (!rule.effectiveTo || rule.effectiveTo >= effectiveDate);
    }
    profileExemptions(profiles) {
        return profiles
            .filter((profile) => profile.exemptionStatus === TaxExemptionStatus.Exempt)
            .map((profile) => `${profile.ownerType}_EXEMPT:${profile.ownerId}`);
    }
    hasInclusiveTax(rules, line) {
        return line.taxIncluded === true || rules.some((rule) => rule.calculationMethod === TaxCalculationMethod.Inclusive);
    }
    ruleSnapshot(lines) {
        return {
            rules: lines.flatMap((line) => line.components).map((component) => ({
                ruleId: component.ruleId,
                ruleCode: component.ruleCode,
                version: component.ruleVersion,
                ratePercent: component.ratePercent,
                fixedAmount: component.fixedAmount,
                jurisdictionCode: component.jurisdictionCode,
            })),
        };
    }
    safeInputSnapshot(input) {
        return {
            ...input,
            transactionDate: input.transactionDate?.toISOString(),
        };
    }
    hash(payload) {
        return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
    }
    sum(values) {
        return this.format(values.reduce((total, value) => total + this.money(value), 0));
    }
    money(value) {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : 0;
    }
    format(value) {
        return value.toFixed(TAX_DEFAULTS.calculationPrecision);
    }
}
