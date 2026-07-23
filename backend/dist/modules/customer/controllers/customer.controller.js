import { ApiErrorHandler } from "../../../shared/http/api-error";
export class CustomerController {
    service;
    constructor(service) {
        this.service = service;
    }
    createCustomer = async (request, response, next) => {
        try {
            this.created(response, await this.service.createCustomer(request.body, this.context(request)));
        }
        catch (error) {
            await ApiErrorHandler.handle(error, response, next, "customer");
        }
    };
    listCustomers = async (request, response, next) => {
        try {
            this.ok(response, await this.service.listCustomers(request.query, this.context(request)));
        }
        catch (error) {
            await ApiErrorHandler.handle(error, response, next, "customer");
        }
    };
    getCustomer = async (request, response, next) => {
        try {
            this.ok(response, await this.service.getCustomer(this.param(request, "id"), this.context(request)));
        }
        catch (error) {
            await ApiErrorHandler.handle(error, response, next, "customer");
        }
    };
    updateCustomer = async (request, response, next) => {
        try {
            this.ok(response, await this.service.updateCustomer(this.param(request, "id"), request.body, this.context(request)));
        }
        catch (error) {
            await ApiErrorHandler.handle(error, response, next, "customer");
        }
    };
    deleteCustomer = async (request, response, next) => {
        try {
            this.ok(response, await this.service.deleteCustomer(this.param(request, "id"), this.context(request)));
        }
        catch (error) {
            await ApiErrorHandler.handle(error, response, next, "customer");
        }
    };
    addAddress = async (request, response, next) => {
        try {
            this.created(response, await this.service.addAddress(this.param(request, "id"), request.body, this.context(request)));
        }
        catch (error) {
            await ApiErrorHandler.handle(error, response, next, "customer");
        }
    };
    listAddresses = async (request, response, next) => {
        try {
            this.ok(response, await this.service.listAddresses(this.param(request, "id"), this.context(request)));
        }
        catch (error) {
            await ApiErrorHandler.handle(error, response, next, "customer");
        }
    };
    updateAddress = async (request, response, next) => {
        try {
            this.ok(response, await this.service.updateAddress(this.param(request, "id"), this.param(request, "addressId"), request.body, this.context(request)));
        }
        catch (error) {
            await ApiErrorHandler.handle(error, response, next, "customer");
        }
    };
    deleteAddress = async (request, response, next) => {
        try {
            this.ok(response, await this.service.deleteAddress(this.param(request, "id"), this.param(request, "addressId"), this.context(request)));
        }
        catch (error) {
            await ApiErrorHandler.handle(error, response, next, "customer");
        }
    };
    createGroup = async (request, response, next) => {
        try {
            this.created(response, await this.service.createGroup(request.body, this.context(request)));
        }
        catch (error) {
            await ApiErrorHandler.handle(error, response, next, "customer");
        }
    };
    listGroups = async (request, response, next) => {
        try {
            this.ok(response, await this.service.listGroups(request.query, this.context(request)));
        }
        catch (error) {
            await ApiErrorHandler.handle(error, response, next, "customer");
        }
    };
    updateCreditLimit = async (request, response, next) => {
        try {
            this.ok(response, await this.service.updateCreditLimit(this.param(request, "id"), request.body, this.context(request)));
        }
        catch (error) {
            await ApiErrorHandler.handle(error, response, next, "customer");
        }
    };
    createPricingRule = async (request, response, next) => {
        try {
            this.created(response, await this.service.createPricingRule(this.param(request, "id"), request.body, this.context(request)));
        }
        catch (error) {
            await ApiErrorHandler.handle(error, response, next, "customer");
        }
    };
    addNote = async (request, response, next) => {
        try {
            this.created(response, await this.service.addNote(this.param(request, "id"), request.body, this.context(request)));
        }
        catch (error) {
            await ApiErrorHandler.handle(error, response, next, "customer");
        }
    };
    upsertTaxExemption = async (request, response, next) => {
        try {
            this.created(response, await this.service.upsertTaxExemption(this.param(request, "id"), request.body, this.context(request)));
        }
        catch (error) {
            await ApiErrorHandler.handle(error, response, next, "customer");
        }
    };
    upsertShippingPreference = async (request, response, next) => {
        try {
            this.ok(response, await this.service.upsertShippingPreference(this.param(request, "id"), request.body, this.context(request)));
        }
        catch (error) {
            await ApiErrorHandler.handle(error, response, next, "customer");
        }
    };
    listOrderHistory = async (request, response, next) => {
        try {
            this.ok(response, await this.service.listOrderHistory(this.param(request, "id"), request.query, this.context(request)));
        }
        catch (error) {
            await ApiErrorHandler.handle(error, response, next, "customer");
        }
    };
    ok(response, payload) {
        response.status(200).json(this.envelope(payload));
    }
    created(response, payload) {
        response.status(201).json(this.envelope(payload));
    }
    envelope(payload) {
        if (payload && typeof payload === "object" && "items" in payload && "total" in payload) {
            const { items, ...meta } = payload;
            return { success: true, data: items, meta };
        }
        return { success: true, data: payload, meta: {} };
    }
    context(request) {
        return {
            securityContext: request.securityContext ?? { roles: [], permissions: [], requestFingerprint: "" },
            idempotencyKey: request.header("Idempotency-Key") ?? undefined,
            ipAddress: request.ip,
            userAgent: request.header("user-agent"),
            requestId: request.requestId,
        };
    }
    param(request, name) {
        const value = request.params[name];
        return Array.isArray(value) ? value[0] : value;
    }
}
