import { EnterpriseLogRepository, LogRouterService } from "../../../shared/logger";
import { HashUtil } from "../../../shared/utils/hash.util";
import { AuditLogDto } from "../dto/audit-log.dto";

export interface AuditLogChainRecord {
  readonly id: string;
  readonly previousHash: string | null;
  readonly chainHash: string;
}

export class AuditLogRepository {
  private readonly enterpriseLogRepository = new EnterpriseLogRepository();
  private readonly logRouterService = new LogRouterService(this.enterpriseLogRepository);

  public async create(dto: AuditLogDto): Promise<string> {
    const metadata = dto.metadata ?? {};
    const payloadHash = HashUtil.sha256({ ...dto, metadata });
    const previousHash = await this.getPreviousChainHash(dto.companyId);
    const chainHash = HashUtil.sha256(
      `${previousHash ?? "GENESIS"}:${payloadHash}`,
    );

    const result = await this.logRouterService.route({
      category: "audit",
      severity: "security",
      module: dto.module ?? "audit-log",
      action: dto.action,
      message: `${dto.entityType} audit event recorded`,
      companyId: dto.companyId,
      organizationId: dto.organizationId,
      warehouseId: dto.warehouseId,
      userId: dto.userId,
      actorId: dto.userId,
      status: dto.status ?? "success",
      requestId: dto.requestId,
      correlationId: dto.correlationId,
      ipAddress: dto.ipAddress,
      userAgent: dto.userAgent,
      metadata: {
        entityType: dto.entityType,
        entityId: dto.entityId,
        warehouseId: dto.warehouseId,
        status: dto.status ?? "success",
        beforeState: dto.beforeState,
        afterState: dto.afterState,
        changedFields: dto.changedFields,
        previousHash,
        payloadHash,
        chainHash,
        metadata,
      },
    });
    return result.logId;
  }

  public async list(
    companyId: string,
    limit: number,
    offset: number,
  ): Promise<unknown[]> {
    return this.logRouterService.listCategory("audit", companyId, limit, offset);
  }

  public async listChain(companyId: string): Promise<readonly AuditLogChainRecord[]> {
    const records = await this.enterpriseLogRepository.list(
      "audit_logs",
      { companyId },
      10000,
      0,
    );
    return records.reverse().map((row) => ({
      id: row.logId,
      previousHash: typeof row.metadata.previousHash === "string" ? row.metadata.previousHash : null,
      chainHash: String(row.metadata.chainHash ?? ""),
    }));
  }

  private async getPreviousChainHash(
    companyId?: string,
  ): Promise<string | null> {
    return this.enterpriseLogRepository.latestAuditHash(companyId);
  }
}
