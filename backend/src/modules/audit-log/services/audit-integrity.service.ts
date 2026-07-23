import { AuditLogRepository } from "../repositories/audit-log.repository";

export interface AuditIntegrityResult {
  readonly companyId: string;
  readonly checked: number;
  readonly valid: boolean;
  readonly firstInvalidAuditLogId?: string;
}

export class AuditIntegrityService {
  constructor(private readonly repository: AuditLogRepository) {}

  public async verifyTenantChain(companyId: string): Promise<AuditIntegrityResult> {
    const rows = await this.repository.listChain(companyId);
    let previousHash: string | null = null;

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
