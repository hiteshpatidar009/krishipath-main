export var TaxRuleStatus;
(function (TaxRuleStatus) {
    TaxRuleStatus["Active"] = "ACTIVE";
    TaxRuleStatus["Inactive"] = "INACTIVE";
})(TaxRuleStatus || (TaxRuleStatus = {}));
export var TaxRuleType;
(function (TaxRuleType) {
    TaxRuleType["Percentage"] = "PERCENTAGE";
    TaxRuleType["Fixed"] = "FIXED";
})(TaxRuleType || (TaxRuleType = {}));
export var TaxCalculationMethod;
(function (TaxCalculationMethod) {
    TaxCalculationMethod["Inclusive"] = "INCLUSIVE";
    TaxCalculationMethod["Exclusive"] = "EXCLUSIVE";
})(TaxCalculationMethod || (TaxCalculationMethod = {}));
export var TaxCompoundingMode;
(function (TaxCompoundingMode) {
    TaxCompoundingMode["Standard"] = "STANDARD";
    TaxCompoundingMode["Compound"] = "COMPOUND";
    TaxCompoundingMode["Stacked"] = "STACKED";
})(TaxCompoundingMode || (TaxCompoundingMode = {}));
export var TaxScopeLevel;
(function (TaxScopeLevel) {
    TaxScopeLevel["Platform"] = "PLATFORM";
    TaxScopeLevel["Country"] = "COUNTRY";
    TaxScopeLevel["State"] = "STATE";
    TaxScopeLevel["Region"] = "REGION";
    TaxScopeLevel["Company"] = "TENANT";
    TaxScopeLevel["Organization"] = "ORGANIZATION";
})(TaxScopeLevel || (TaxScopeLevel = {}));
export var TaxProfileOwnerType;
(function (TaxProfileOwnerType) {
    TaxProfileOwnerType["Organization"] = "ORGANIZATION";
    TaxProfileOwnerType["Customer"] = "CUSTOMER";
    TaxProfileOwnerType["Supplier"] = "SUPPLIER";
})(TaxProfileOwnerType || (TaxProfileOwnerType = {}));
export var TaxExemptionStatus;
(function (TaxExemptionStatus) {
    TaxExemptionStatus["None"] = "NONE";
    TaxExemptionStatus["Exempt"] = "EXEMPT";
    TaxExemptionStatus["Partial"] = "PARTIAL";
})(TaxExemptionStatus || (TaxExemptionStatus = {}));
export var TaxApprovalStatus;
(function (TaxApprovalStatus) {
    TaxApprovalStatus["Draft"] = "DRAFT";
    TaxApprovalStatus["PendingApproval"] = "PENDING_APPROVAL";
    TaxApprovalStatus["Approved"] = "APPROVED";
    TaxApprovalStatus["Rejected"] = "REJECTED";
})(TaxApprovalStatus || (TaxApprovalStatus = {}));
export var TaxSourceModule;
(function (TaxSourceModule) {
    TaxSourceModule["Billing"] = "BILLING";
    TaxSourceModule["Subscription"] = "SUBSCRIPTION";
    TaxSourceModule["Procurement"] = "PROCUREMENT";
    TaxSourceModule["PurchaseOrder"] = "PURCHASE_ORDER";
    TaxSourceModule["Receiving"] = "RECEIVING";
    TaxSourceModule["Sales"] = "SALES";
    TaxSourceModule["Quotation"] = "QUOTATION";
    TaxSourceModule["Invoice"] = "INVOICE";
    TaxSourceModule["Product"] = "PRODUCT";
})(TaxSourceModule || (TaxSourceModule = {}));
export var TaxPermission;
(function (TaxPermission) {
    TaxPermission["RuleCreate"] = "tax.rule.create";
    TaxPermission["RuleRead"] = "tax.rule.read";
    TaxPermission["RuleUpdate"] = "tax.rule.update";
    TaxPermission["RuleDeactivate"] = "tax.rule.deactivate";
    TaxPermission["Calculate"] = "tax.calculate";
    TaxPermission["ProfileRead"] = "tax.profile.read";
    TaxPermission["ProfileUpdate"] = "tax.profile.update";
    TaxPermission["SnapshotRead"] = "tax.snapshot.read";
    TaxPermission["ReportRead"] = "tax.report.read";
})(TaxPermission || (TaxPermission = {}));
export const TAX_DEFAULTS = {
    currencyCode: "INR",
    generalCategory: "GENERAL",
    defaultJurisdictionCode: "GLOBAL",
    calculationPrecision: 2,
};
