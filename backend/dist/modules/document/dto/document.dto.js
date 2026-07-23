export class DocumentDto {
    companyId;
    ownerType;
    ownerId;
    documentType;
    fileName;
    mimeType;
    sizeBytes;
    checksumSha256;
    storageProvider;
    storageKey;
    status;
    uploadedBy;
    constructor(input) {
        this.companyId = input.companyId;
        this.ownerType = input.ownerType;
        this.ownerId = input.ownerId;
        this.documentType = input.documentType;
        this.fileName = input.fileName;
        this.mimeType = input.mimeType;
        this.sizeBytes = input.sizeBytes;
        this.checksumSha256 = input.checksumSha256;
        this.storageProvider = input.storageProvider;
        this.storageKey = input.storageKey;
        this.status = input.status;
        this.uploadedBy = input.uploadedBy;
    }
}
