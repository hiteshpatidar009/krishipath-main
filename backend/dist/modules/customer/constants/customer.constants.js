export var CustomerStatus;
(function (CustomerStatus) {
    CustomerStatus["Active"] = "ACTIVE";
    CustomerStatus["Inactive"] = "INACTIVE";
    CustomerStatus["Blocked"] = "BLOCKED";
    CustomerStatus["Blacklisted"] = "BLACKLISTED";
})(CustomerStatus || (CustomerStatus = {}));
export var CustomerType;
(function (CustomerType) {
    CustomerType["Retail"] = "RETAIL";
    CustomerType["Wholesale"] = "WHOLESALE";
    CustomerType["Distributor"] = "DISTRIBUTOR";
    CustomerType["Corporate"] = "CORPORATE";
})(CustomerType || (CustomerType = {}));
export var CustomerAddressType;
(function (CustomerAddressType) {
    CustomerAddressType["Billing"] = "BILLING";
    CustomerAddressType["Shipping"] = "SHIPPING";
    CustomerAddressType["Other"] = "OTHER";
})(CustomerAddressType || (CustomerAddressType = {}));
export var PricingRuleType;
(function (PricingRuleType) {
    PricingRuleType["DiscountPercent"] = "DISCOUNT_PERCENT";
    PricingRuleType["FixedPrice"] = "FIXED_PRICE";
    PricingRuleType["PriceList"] = "PRICE_LIST";
})(PricingRuleType || (PricingRuleType = {}));
export var CustomerNoteVisibility;
(function (CustomerNoteVisibility) {
    CustomerNoteVisibility["Internal"] = "INTERNAL";
    CustomerNoteVisibility["Portal"] = "PORTAL";
})(CustomerNoteVisibility || (CustomerNoteVisibility = {}));
export var CustomerPermission;
(function (CustomerPermission) {
    CustomerPermission["Create"] = "sales.customer.create";
    CustomerPermission["Read"] = "sales.customer.read";
    CustomerPermission["Update"] = "sales.customer.update";
})(CustomerPermission || (CustomerPermission = {}));
export const CUSTOMER_DEFAULTS = {
    page: 1,
    limit: 20,
    maxLimit: 100,
    defaultCurrency: "USD",
    cacheTtlSeconds: 300,
};
export const CUSTOMER_SORT_FIELDS = [
    "customerName",
    "customerCode",
    "email",
    "companyName",
    "status",
    "createdAt",
    "updatedAt",
];
