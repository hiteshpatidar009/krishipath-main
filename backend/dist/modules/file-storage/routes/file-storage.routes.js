import { Router } from "express";
import { AuthorizationMiddleware, IdempotencyMiddleware, SharedAuthMiddleware, CompanyGuard, } from "../../../shared/security";
export class FileStorageRoutes {
    fileStorageController;
    router = Router();
    constructor(fileStorageController) {
        this.fileStorageController = fileStorageController;
        this.register();
    }
    getRouter() {
        return this.router;
    }
    register() {
        this.router.use(SharedAuthMiddleware.use);
        this.router.use(CompanyGuard.requireCompany);
        this.router.post("/sign", AuthorizationMiddleware.requirePermissions("file.storage.sign"), IdempotencyMiddleware.requireForMutations(), this.fileStorageController.signUpload);
    }
}
