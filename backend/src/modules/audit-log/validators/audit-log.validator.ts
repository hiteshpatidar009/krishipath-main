import { z } from "zod";
import { AuditLogDto } from "../dto/audit-log.dto";

export class AuditLogValidator {
  private readonly schema = z.object({
    companyId: z.string().uuid().optional(),
    organizationId: z.string().uuid().optional(),
    warehouseId: z.string().uuid().optional(),
    userId: z.string().uuid().optional(),
    action: z.string().min(2).max(160),
    module: z.string().min(2).max(120).optional(),
    entityType: z.string().min(2).max(120),
    entityId: z.string().uuid().optional(),
    status: z.enum(["success", "failed"]).optional(),
    requestId: z.string().max(200).optional(),
    correlationId: z.string().max(200).optional(),
    ipAddress: z.string().max(100).optional(),
    userAgent: z.string().max(1000).optional(),
    beforeState: z.unknown().optional(),
    afterState: z.unknown().optional(),
    changedFields: z.unknown().optional(),
    metadata: z.unknown().optional(),
  });

  public parse(input: unknown): AuditLogDto {
    return new AuditLogDto(this.schema.parse(input));
  }
}
