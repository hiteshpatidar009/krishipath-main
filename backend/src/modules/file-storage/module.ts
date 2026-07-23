import { Router } from "express";
import {
  FileStorageContract,
  FileStorageContractAdapter,
} from "./contracts";
import { FileStorageController } from "./controllers/file-storage.controller";
import { FileStorageRoutes } from "./routes/file-storage.routes";
import { FileStorageService } from "./services/file-storage.service";

export class FileStorageModule {
  private readonly fileStorageService = new FileStorageService();
  private readonly fileStorageController = new FileStorageController(this.fileStorageService);
  private readonly fileStorageRoutes = new FileStorageRoutes(this.fileStorageController);
  private readonly fileStorageContract = new FileStorageContractAdapter(
    this.fileStorageService,
  );

  public getRouter(): Router {
    return this.fileStorageRoutes.getRouter();
  }

  public getService(): FileStorageService {
    return this.fileStorageService;
  }

  public getContract(): FileStorageContract {
    return this.fileStorageContract;
  }
}
