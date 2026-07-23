import { Router } from "express";
import { SchemaValidationMiddleware, IdempotencyMiddleware, SharedAuthMiddleware, CompanyGuard, PermGuard } from "../../../shared/security";
import { CustomerPermission } from "../constants/customer.constants";
import { CustomerRateLimitMiddleware } from "../middleware/customer-rate-limit.middleware";
import { addCustomerAddressSchema, addCustomerNoteSchema, createCustomerGroupSchema, createCustomerSchema, createPricingRuleSchema, customerAddressIdParamSchema, customerIdParamSchema, listCustomersSchema, updateCreditLimitSchema, updateCustomerAddressSchema, updateCustomerSchema, upsertShippingPreferenceSchema, upsertTaxExemptionSchema, } from "../validators/customer.validator";
export class CustomerRoutes {
    controller;
    router = Router();
    customerGroupsRouter = Router();
    constructor(controller) {
        this.controller = controller;
        this.registerCustomers();
        this.registerGroups();
    }
    getCustomerRouter() {
        return this.router;
    }
    getCustomerGroupsRouter() {
        return this.customerGroupsRouter;
    }
    registerCustomers() {
        this.router.post("/", SharedAuthMiddleware.use, CompanyGuard.requireCompany, PermGuard.require(CustomerPermission.Create), CustomerRateLimitMiddleware.use, IdempotencyMiddleware.requireForMutations(), SchemaValidationMiddleware.validate(createCustomerSchema), this.controller.createCustomer);
        this.router.get("/", SharedAuthMiddleware.use, CompanyGuard.requireCompany, PermGuard.require(CustomerPermission.Read), CustomerRateLimitMiddleware.use, SchemaValidationMiddleware.validate(listCustomersSchema, "query"), this.controller.listCustomers);
        this.router.get("/get/:id", SharedAuthMiddleware.use, CompanyGuard.requireCompany, PermGuard.require(CustomerPermission.Read), CustomerRateLimitMiddleware.use, SchemaValidationMiddleware.validate(customerIdParamSchema, "params"), this.controller.getCustomer);
        this.router.get("/:id", SharedAuthMiddleware.use, CompanyGuard.requireCompany, PermGuard.require(CustomerPermission.Read), CustomerRateLimitMiddleware.use, SchemaValidationMiddleware.validate(customerIdParamSchema, "params"), this.controller.getCustomer);
        this.router.patch("/:id", SharedAuthMiddleware.use, CompanyGuard.requireCompany, PermGuard.require(CustomerPermission.Update), CustomerRateLimitMiddleware.use, IdempotencyMiddleware.requireForMutations(), SchemaValidationMiddleware.validate(customerIdParamSchema, "params"), SchemaValidationMiddleware.validate(updateCustomerSchema), this.controller.updateCustomer);
        this.router.delete("/:id", SharedAuthMiddleware.use, CompanyGuard.requireCompany, PermGuard.require(CustomerPermission.Update), CustomerRateLimitMiddleware.use, IdempotencyMiddleware.requireForMutations(), SchemaValidationMiddleware.validate(customerIdParamSchema, "params"), this.controller.deleteCustomer);
        this.router.post("/:id/addresses", SharedAuthMiddleware.use, CompanyGuard.requireCompany, PermGuard.require(CustomerPermission.Update), CustomerRateLimitMiddleware.use, IdempotencyMiddleware.requireForMutations(), SchemaValidationMiddleware.validate(customerIdParamSchema, "params"), SchemaValidationMiddleware.validate(addCustomerAddressSchema), this.controller.addAddress);
        this.router.get("/:id/addresses", SharedAuthMiddleware.use, CompanyGuard.requireCompany, PermGuard.require(CustomerPermission.Read), CustomerRateLimitMiddleware.use, SchemaValidationMiddleware.validate(customerIdParamSchema, "params"), this.controller.listAddresses);
        this.router.patch("/:id/addresses/:addressId", SharedAuthMiddleware.use, CompanyGuard.requireCompany, PermGuard.require(CustomerPermission.Update), CustomerRateLimitMiddleware.use, IdempotencyMiddleware.requireForMutations(), SchemaValidationMiddleware.validate(customerAddressIdParamSchema, "params"), SchemaValidationMiddleware.validate(updateCustomerAddressSchema), this.controller.updateAddress);
        this.router.delete("/:id/addresses/:addressId", SharedAuthMiddleware.use, CompanyGuard.requireCompany, PermGuard.require(CustomerPermission.Update), CustomerRateLimitMiddleware.use, IdempotencyMiddleware.requireForMutations(), SchemaValidationMiddleware.validate(customerAddressIdParamSchema, "params"), this.controller.deleteAddress);
        this.router.patch("/:id/credit-limit", SharedAuthMiddleware.use, CompanyGuard.requireCompany, PermGuard.require(CustomerPermission.Update), CustomerRateLimitMiddleware.use, IdempotencyMiddleware.requireForMutations(), SchemaValidationMiddleware.validate(customerIdParamSchema, "params"), SchemaValidationMiddleware.validate(updateCreditLimitSchema), this.controller.updateCreditLimit);
        this.router.post("/:id/pricing-rules", SharedAuthMiddleware.use, CompanyGuard.requireCompany, PermGuard.require(CustomerPermission.Update), CustomerRateLimitMiddleware.use, IdempotencyMiddleware.requireForMutations(), SchemaValidationMiddleware.validate(customerIdParamSchema, "params"), SchemaValidationMiddleware.validate(createPricingRuleSchema), this.controller.createPricingRule);
        this.router.post("/:id/notes", SharedAuthMiddleware.use, CompanyGuard.requireCompany, PermGuard.require(CustomerPermission.Update), CustomerRateLimitMiddleware.use, IdempotencyMiddleware.requireForMutations(), SchemaValidationMiddleware.validate(customerIdParamSchema, "params"), SchemaValidationMiddleware.validate(addCustomerNoteSchema), this.controller.addNote);
        this.router.post("/:id/tax-exemptions", SharedAuthMiddleware.use, CompanyGuard.requireCompany, PermGuard.require(CustomerPermission.Update), CustomerRateLimitMiddleware.use, IdempotencyMiddleware.requireForMutations(), SchemaValidationMiddleware.validate(customerIdParamSchema, "params"), SchemaValidationMiddleware.validate(upsertTaxExemptionSchema), this.controller.upsertTaxExemption);
        this.router.patch("/:id/shipping-preferences", SharedAuthMiddleware.use, CompanyGuard.requireCompany, PermGuard.require(CustomerPermission.Update), CustomerRateLimitMiddleware.use, IdempotencyMiddleware.requireForMutations(), SchemaValidationMiddleware.validate(customerIdParamSchema, "params"), SchemaValidationMiddleware.validate(upsertShippingPreferenceSchema), this.controller.upsertShippingPreference);
        this.router.get("/:id/orders", SharedAuthMiddleware.use, CompanyGuard.requireCompany, PermGuard.require(CustomerPermission.Read), CustomerRateLimitMiddleware.use, SchemaValidationMiddleware.validate(customerIdParamSchema, "params"), SchemaValidationMiddleware.validate(listCustomersSchema.pick({ page: true, limit: true, cursor: true, sortBy: true, sortOrder: true }), "query"), this.controller.listOrderHistory);
    }
    registerGroups() {
        this.customerGroupsRouter.post("/", SharedAuthMiddleware.use, CompanyGuard.requireCompany, PermGuard.require(CustomerPermission.Create), CustomerRateLimitMiddleware.use, IdempotencyMiddleware.requireForMutations(), SchemaValidationMiddleware.validate(createCustomerGroupSchema), this.controller.createGroup);
        this.customerGroupsRouter.get("/", SharedAuthMiddleware.use, CompanyGuard.requireCompany, PermGuard.require(CustomerPermission.Read), CustomerRateLimitMiddleware.use, SchemaValidationMiddleware.validate(listCustomersSchema.pick({ page: true, limit: true, search: true, cursor: true, sortBy: true, sortOrder: true }), "query"), this.controller.listGroups);
    }
}
