import { ApiErrorHandler } from "../../../shared/http/api-error";
export class SupplierController {
    service;
    constructor(service) {
        this.service = service;
    }
    createSupplier = async (request, response, next) => {
        try {
            this.created(response, await this.service.createSupplier(this.companyId(request), request.body));
        }
        catch (error) {
            await ApiErrorHandler.handle(error, response, next, "supplier");
        }
    };
    listSuppliers = async (request, response, next) => {
        try {
            this.ok(response, await this.service.listSuppliers(this.companyId(request), request.query, this.service.parsePaginationParams(request.query)));
        }
        catch (error) {
            await ApiErrorHandler.handle(error, response, next, "supplier");
        }
    };
    getSupplier = async (request, response, next) => {
        try {
            this.ok(response, await this.service.getSupplier(this.companyId(request), this.param(request, "supplierId")));
        }
        catch (error) {
            await ApiErrorHandler.handle(error, response, next, "supplier");
        }
    };
    updateSupplier = async (request, response, next) => {
        try {
            this.ok(response, await this.service.updateSupplier(this.companyId(request), this.param(request, "supplierId"), request.body));
        }
        catch (error) {
            await ApiErrorHandler.handle(error, response, next, "supplier");
        }
    };
    deleteSupplier = async (request, response, next) => {
        try {
            await this.service.deleteSupplier(this.companyId(request), this.param(request, "supplierId"));
            this.ok(response, { deleted: true });
        }
        catch (error) {
            await ApiErrorHandler.handle(error, response, next, "supplier");
        }
    };
    addContact = async (request, response, next) => {
        try {
            this.created(response, await this.service.addSupplierContact(this.companyId(request), this.param(request, "supplierId"), request.body));
        }
        catch (error) {
            await ApiErrorHandler.handle(error, response, next, "supplier");
        }
    };
    listContacts = async (request, response, next) => {
        try {
            this.ok(response, await this.service.getSupplierContacts(this.companyId(request), this.param(request, "supplierId")));
        }
        catch (error) {
            await ApiErrorHandler.handle(error, response, next, "supplier");
        }
    };
    updateContact = async (request, response, next) => {
        try {
            this.ok(response, await this.service.updateSupplierContact(this.companyId(request), this.param(request, "supplierId"), this.param(request, "contactId"), request.body));
        }
        catch (error) {
            await ApiErrorHandler.handle(error, response, next, "supplier");
        }
    };
    deleteContact = async (request, response, next) => {
        try {
            await this.service.deleteSupplierContact(this.companyId(request), this.param(request, "supplierId"), this.param(request, "contactId"));
            this.ok(response, { deleted: true });
        }
        catch (error) {
            await ApiErrorHandler.handle(error, response, next, "supplier");
        }
    };
    setPricing = async (request, response, next) => {
        try {
            this.created(response, await this.service.setPricing(this.companyId(request), this.param(request, "supplierId"), request.body));
        }
        catch (error) {
            await ApiErrorHandler.handle(error, response, next, "supplier");
        }
    };
    listPricing = async (request, response, next) => {
        try {
            this.ok(response, await this.service.getPricing(this.companyId(request), this.param(request, "supplierId")));
        }
        catch (error) {
            await ApiErrorHandler.handle(error, response, next, "supplier");
        }
    };
    updatePricing = async (request, response, next) => {
        try {
            this.ok(response, await this.service.updatePricing(this.companyId(request), this.param(request, "supplierId"), this.param(request, "pricingId"), request.body));
        }
        catch (error) {
            await ApiErrorHandler.handle(error, response, next, "supplier");
        }
    };
    uploadDocument = async (request, response, next) => {
        try {
            const body = request.body;
            const companyId = this.companyId(request);
            const supplierId = this.param(request, "supplierId");
            this.created(response, await this.service.uploadDocument(companyId, supplierId, request.body, this.optionalString(body.fileKey) ?? this.defaultFileKey(companyId, supplierId, body.documentType), this.optionalString(body.fileName) ?? "supplier-document.pdf", this.numberOrDefault(body.fileSize, 0), this.optionalString(body.mimeType) ?? "application/pdf", this.userId(request)));
        }
        catch (error) {
            await ApiErrorHandler.handle(error, response, next, "supplier");
        }
    };
    listDocuments = async (request, response, next) => {
        try {
            this.ok(response, await this.service.getDocuments(this.companyId(request), this.param(request, "supplierId")));
        }
        catch (error) {
            await ApiErrorHandler.handle(error, response, next, "supplier");
        }
    };
    deleteDocument = async (request, response, next) => {
        try {
            await this.service.deleteDocument(this.companyId(request), this.param(request, "supplierId"), this.param(request, "documentId"));
            this.ok(response, { deleted: true });
        }
        catch (error) {
            await ApiErrorHandler.handle(error, response, next, "supplier");
        }
    };
    getPerformance = async (request, response, next) => {
        try {
            this.ok(response, await this.service.getPerformance(this.companyId(request), this.param(request, "supplierId")));
        }
        catch (error) {
            await ApiErrorHandler.handle(error, response, next, "supplier");
        }
    };
    addNote = async (request, response, next) => {
        try {
            this.created(response, await this.service.addNote(this.companyId(request), this.param(request, "supplierId"), request.body, this.userId(request)));
        }
        catch (error) {
            await ApiErrorHandler.handle(error, response, next, "supplier");
        }
    };
    listNotes = async (request, response, next) => {
        try {
            this.ok(response, await this.service.getNotes(this.companyId(request), this.param(request, "supplierId")));
        }
        catch (error) {
            await ApiErrorHandler.handle(error, response, next, "supplier");
        }
    };
    ok(response, data) {
        response.status(200).json({ success: true, data });
    }
    created(response, data) {
        response.status(201).json({ success: true, data });
    }
    companyId(request) {
        return this.requiredString(request.securityContext?.companyId, "companyId");
    }
    userId(request) {
        return this.requiredString(request.securityContext?.userId, "userId");
    }
    param(request, name) {
        return this.requiredString(request.params[name], name);
    }
    requiredString(value, name) {
        if (typeof value === "string" && value.length > 0) {
            return value;
        }
        throw new Error(`${name} required`);
    }
    optionalString(value) {
        if (typeof value === "string" && value.trim().length > 0) {
            return value.trim();
        }
        return undefined;
    }
    numberOrDefault(value, fallback) {
        const parsed = Number(value);
        return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
    }
    defaultFileKey(companyId, supplierId, documentType) {
        const type = this.optionalString(documentType)?.toLowerCase() ?? "document";
        return `companies/${companyId}/suppliers/${supplierId}/documents/${type}-${Date.now()}.pdf`;
    }
}
