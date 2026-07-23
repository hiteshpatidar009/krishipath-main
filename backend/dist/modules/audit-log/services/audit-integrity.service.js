export class AuditIntegrityService {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async verifyTenantChain(companyId) {
        const rows = await this.repository.listChain(companyId);
        let previousHash = null;
        for (const row of rows) {
            if (row.previousHash !== previousHash) {
                return {
                    companyId,
                    checked: rows.length,
                    valid: false,
                    firstInvalidAuditLogId: row.id,
                };
            }
            previousHash = row.chainHash;
        }
        return {
            companyId,
            checked: rows.length,
            valid: true,
        };
    }
}
