export var SupplierStatus;
(function (SupplierStatus) {
    SupplierStatus["ACTIVE"] = "ACTIVE";
    SupplierStatus["INACTIVE"] = "INACTIVE";
    SupplierStatus["BLOCKED"] = "BLOCKED";
    SupplierStatus["BLACKLISTED"] = "BLACKLISTED";
})(SupplierStatus || (SupplierStatus = {}));
export var DocumentType;
(function (DocumentType) {
    DocumentType["ASN"] = "ASN";
    DocumentType["INVOICE"] = "INVOICE";
    DocumentType["PACKING_LIST"] = "PACKING_LIST";
    DocumentType["CERTIFICATE"] = "CERTIFICATE";
    DocumentType["CONTRACT"] = "CONTRACT";
    DocumentType["COMPLIANCE"] = "COMPLIANCE";
})(DocumentType || (DocumentType = {}));
export var SupplierPermissions;
(function (SupplierPermissions) {
    SupplierPermissions["CREATE"] = "procurement.supplier.create";
    SupplierPermissions["READ"] = "procurement.supplier.read";
    SupplierPermissions["UPDATE"] = "procurement.supplier.update";
    SupplierPermissions["DELETE"] = "procurement.supplier.delete";
    SupplierPermissions["MANAGE_CONTACTS"] = "procurement.supplier.contacts.manage";
    SupplierPermissions["MANAGE_PRICING"] = "procurement.supplier.pricing.manage";
    SupplierPermissions["MANAGE_DOCUMENTS"] = "procurement.supplier.documents.manage";
})(SupplierPermissions || (SupplierPermissions = {}));
export const PAGINATION_DEFAULT_LIMIT = 20;
export const PAGINATION_MAX_LIMIT = 100;
