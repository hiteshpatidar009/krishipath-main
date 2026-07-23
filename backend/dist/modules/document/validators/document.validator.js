import { z } from "zod";
import { DocumentDto } from "../dto/document.dto";
export class DocumentValidator {
    schema = z.object({
        companyId: z.string().uuid(),
        ownerType: z.string().min(2).max(100),
        ownerId: z.string().uuid(),
        documentType: z.string().min(2).max(80),
        fileName: z.string().min(1).max(255),
        mimeType: z.string().min(3).max(120),
        sizeBytes: z.number().int().nonnegative().max(50 * 1024 * 1024),
        checksumSha256: z.string().regex(/^[a-fA-F0-9]{64}$/).optional(),
        storageProvider: z.string().min(2).max(40).default("s3"),
        storageKey: z.string().min(1).max(2000),
        status: z.enum(["uploading", "scanning", "active", "rejected", "archived"]).default("uploading"),
        uploadedBy: z.string().uuid(),
    });
    parse(input) {
        return new DocumentDto(this.schema.parse(input));
    }
}
