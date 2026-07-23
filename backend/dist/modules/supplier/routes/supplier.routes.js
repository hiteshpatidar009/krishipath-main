import { Router } from "express";
import { PermGuard, IdempotencyMiddleware, SharedAuthMiddleware, CompanyGuard, } from "../../../shared/security";
import { SupplierPermissions } from "../constants/supplier.constants";
export class SupplierRoutes {
    controller;
    router = Router();
    constructor(controller) {
        this.controller = controller;
        this.register();
    }
    getRouter() {
        return this.router;
    }
    register() {
        this.router.use(SharedAuthMiddleware.use, CompanyGuard.requireCompany);
        this.router.post("/", PermGuard.require(SupplierPermissions.CREATE), IdempotencyMiddleware.requireForMutations(), this.controller.createSupplier);
        this.router.get("/", PermGuard.require(SupplierPermissions.READ), this.controller.listSuppliers);
        this.router.get("/:supplierId", PermGuard.require(SupplierPermissions.READ), this.controller.getSupplier);
        this.router.patch("/:supplierId", PermGuard.require(SupplierPermissions.UPDATE), IdempotencyMiddleware.requireForMutations(), this.controller.updateSupplier);
        this.router.delete("/:supplierId", PermGuard.require(SupplierPermissions.DELETE), IdempotencyMiddleware.requireForMutations(), this.controller.deleteSupplier);
        this.router.post("/:supplierId/contacts", PermGuard.require(SupplierPermissions.MANAGE_CONTACTS), IdempotencyMiddleware.requireForMutations(), this.controller.addContact);
        this.router.get("/:supplierId/contacts", PermGuard.require(SupplierPermissions.READ), this.controller.listContacts);
        this.router.patch("/:supplierId/contacts/:contactId", PermGuard.require(SupplierPermissions.MANAGE_CONTACTS), IdempotencyMiddleware.requireForMutations(), this.controller.updateContact);
        this.router.delete("/:supplierId/contacts/:contactId", PermGuard.require(SupplierPermissions.MANAGE_CONTACTS), IdempotencyMiddleware.requireForMutations(), this.controller.deleteContact);
        this.router.post("/:supplierId/pricing", PermGuard.require(SupplierPermissions.MANAGE_PRICING), IdempotencyMiddleware.requireForMutations(), this.controller.setPricing);
        this.router.get("/:supplierId/pricing", PermGuard.require(SupplierPermissions.READ), this.controller.listPricing);
        this.router.patch("/:supplierId/pricing/:pricingId", PermGuard.require(SupplierPermissions.MANAGE_PRICING), IdempotencyMiddleware.requireForMutations(), this.controller.updatePricing);
        this.router.post("/:supplierId/documents", PermGuard.require(SupplierPermissions.MANAGE_DOCUMENTS), IdempotencyMiddleware.requireForMutations(), this.controller.uploadDocument);
        this.router.get("/:supplierId/documents", PermGuard.require(SupplierPermissions.READ), this.controller.listDocuments);
        this.router.delete("/:supplierId/documents/:documentId", PermGuard.require(SupplierPermissions.MANAGE_DOCUMENTS), IdempotencyMiddleware.requireForMutations(), this.controller.deleteDocument);
        this.router.get("/:supplierId/performance", PermGuard.require(SupplierPermissions.READ), this.controller.getPerformance);
        this.router.post("/:supplierId/notes", PermGuard.require(SupplierPermissions.UPDATE), IdempotencyMiddleware.requireForMutations(), this.controller.addNote);
        this.router.get("/:supplierId/notes", PermGuard.require(SupplierPermissions.READ), this.controller.listNotes);
    }
}
