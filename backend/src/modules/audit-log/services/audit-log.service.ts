import { logger } from "../../../infrastructure/logger";
import { AuditLogDto } from "../dto/audit-log.dto";
import { AuditLogRepository } from "../repositories/audit-log.repository";
import { AuditIntegrityService } from "./audit-integrity.service";

export class AuditLogService {
  private readonly auditIntegrityService: AuditIntegrityService;

  constructor(private readonly auditLogRepository: AuditLogRepository) {
    this.auditIntegrityService = new AuditIntegrityService(auditLogRepository);
  }

  public async record(dto: AuditLogDto): Promise<{ id: string }> {
    const id = await this.auditLogRepository.create(dto);
    await logger.info("Audit log recorded", {
      category: "audit",
      module: "audit-log.service",
      action: dto.action,
      companyId: dto.companyId,
      userId: dto.userId,
      tags: ["audit-log", "recorded"],
      payload: { id, action: dto.action, entityType: dto.entityType },
    });
    return { id };
  }

  public async list(companyId: string, limit: number, offset: number): Promise<unknown[]> {
    return this.auditLogRepository.list(companyId, limit, offset);
  }

  public async verifyIntegrity(companyId: string): Promise<unknown> {
    return this.auditIntegrityService.verifyTenantChain(companyId);
  }
}
