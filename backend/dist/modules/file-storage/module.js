import { FileStorageContractAdapter, } from "./contracts";
import { FileStorageController } from "./controllers/file-storage.controller";
import { FileStorageRoutes } from "./routes/file-storage.routes";
import { FileStorageService } from "./services/file-storage.service";
export class FileStorageModule {
    fileStorageService = new FileStorageService();
    fileStorageController = new FileStorageController(this.fileStorageService);
    fileStorageRoutes = new FileStorageRoutes(this.fileStorageController);
    fileStorageContract = new FileStorageContractAdapter(this.fileStorageService);
    getRouter() {
        return this.fileStorageRoutes.getRouter();
    }
    getService() {
        return this.fileStorageService;
    }
    getContract() {
        return this.fileStorageContract;
    }
}
