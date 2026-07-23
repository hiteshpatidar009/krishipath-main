import { Router } from "express";
import {
  AuthorizationMiddleware,
  IdempotencyMiddleware,
  SharedAuthMiddleware,
  CompanyGuard,
} from "../../../shared/security";
import { FileStorageController } from "../controllers/file-storage.controller";

export class FileStorageRoutes {
  private readonly router = Router();

  constructor(private readonly fileStorageController: FileStorageController) {
    this.register();
  }

  public getRouter(): Router {
    return this.router;
  }

  private register(): void {
    this.router.use(SharedAuthMiddleware.use);
    this.router.use(CompanyGuard.requireCompany);
    this.router.post(
      "/sign",
      AuthorizationMiddleware.requirePermissions("file.storage.sign"),
      IdempotencyMiddleware.requireForMutations(),
      this.fileStorageController.signUpload,
    );
  }
}
