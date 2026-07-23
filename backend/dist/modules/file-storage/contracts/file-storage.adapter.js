import { FileSignDto } from "../dto/file-sign.dto";
export class FileStorageContractAdapter {
    service;
    moduleName = "file-storage";
    version = "1.0.0";
    constructor(service) {
        this.service = service;
    }
    async createSignedUpload(input) {
        const target = await this.service.createUploadTarget(input.companyId, "system", new FileSignDto({
            fileName: input.fileName,
            mimeType: input.contentType,
            fileSize: input.sizeBytes,
        }));
        return {
            storageKey: target.storageKey,
            uploadUrl: target.uploadUrl,
            expiresAt: new Date(target.expiresAt),
        };
    }
}
