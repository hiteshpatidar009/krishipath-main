import { logger } from "../../../infrastructure/logger";
import { AppError } from "../../../shared/errors/app.error";
export class DocumentService {
    documentRepository;
    constructor(documentRepository) {
        this.documentRepository = documentRepository;
    }
    async create(dto) {
        const id = await this.documentRepository.create(dto);
        await logger.info("Document metadata created", {
            module: "document.service",
            companyId: dto.companyId,
            userId: dto.uploadedBy,
            tags: ["document", "created"],
            payload: { id, documentType: dto.documentType, ownerType: dto.ownerType },
        });
        return { id };
    }
    async list(companyId, limit, offset) {
        return this.documentRepository.list(companyId, limit, offset);
    }
    async findById(companyId, id) {
        const document = await this.documentRepository.findById(companyId, id);
        if (!document) {
            throw new AppError("Document not found", 404, "DOCUMENT_NOT_FOUND");
        }
        return document;
    }
}
