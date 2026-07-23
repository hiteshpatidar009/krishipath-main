import { Router } from "express";
import { AuthorizationMiddleware, IdempotencyMiddleware, SharedAuthMiddleware, CompanyGuard, } from "../../../shared/security";
export class DocumentRoutes {
    documentController;
    router = Router();
    constructor(documentController) {
        this.documentController = documentController;
        this.register();
    }
    getRouter() {
        return this.router;
    }
    register() {
        this.router.use(SharedAuthMiddleware.use);
        this.router.use(CompanyGuard.requireCompany);
        this.router.post("/", AuthorizationMiddleware.requirePermissions("docs.document.create"), IdempotencyMiddleware.requireForMutations(), this.documentController.create);
        this.router.get("/", AuthorizationMiddleware.requirePermissions("docs.document.read"), this.documentController.list);
        this.router.get("/:id", AuthorizationMiddleware.requirePermissions("docs.document.read"), this.documentController.getById);
    }
}
