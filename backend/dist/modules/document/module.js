import { DocumentContractAdapter } from "./contracts";
import { DocumentController } from "./controllers/document.controller";
import { DocumentRepository } from "./repositories/document.repository";
import { DocumentRoutes } from "./routes/document.routes";
import { DocumentService } from "./services/document.service";
export class DocumentModule {
    documentRepository = new DocumentRepository();
    documentService = new DocumentService(this.documentRepository);
    documentController = new DocumentController(this.documentService);
    documentRoutes = new DocumentRoutes(this.documentController);
    documentContract = new DocumentContractAdapter(this.documentService);
    getRouter() {
        return this.documentRoutes.getRouter();
    }
    getService() {
        return this.documentService;
    }
    getContract() {
        return this.documentContract;
    }
}
