export class DocumentContractAdapter {
    service;
    moduleName = "document";
    version = "1.0.0";
    constructor(service) {
        this.service = service;
    }
    async getById(companyId, documentId) {
        try {
            const document = (await this.service.findById(companyId, documentId));
            if (!document.id || !document.storageKey) {
                return null;
            }
            return {
                id: document.id,
                companyId,
                ownerType: document.ownerType ?? "",
                ownerId: document.ownerId ?? "",
                documentType: document.documentType ?? "",
                storageKey: document.storageKey,
            };
        }
        catch {
            return null;
        }
    }
}
