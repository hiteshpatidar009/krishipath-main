import { NextFunction, Response } from "express";
import { LoggerUtils } from "../../../infrastructure/logger/logger.utils";
import {
  AuditActionResolver,
  AuditContext,
  AuditLoggingService,
} from "../../audit";
import { SecurityRequest } from "../types/security-request.type";

export class AuditLogMiddleware {
  public static use(request: SecurityRequest, response: Response, next: NextFunction): void {
    let responseBody: unknown;
    const originalJson = response.json.bind(response);
    response.json = ((body: unknown) => {
      responseBody = body;
      return originalJson(body);
    }) as typeof response.json;

    response.on("finish", () => {
      if (!AuditActionResolver.isAuditable(request)) {
        return;
      }

      const context = AuditContext.get(request);
      const status = response.statusCode >= 200 && response.statusCode < 400 ? "success" : "failed";
      void AuditLoggingService.record({
        companyId: request.securityContext?.companyId,
        organizationId: context.organizationId,
        warehouseId: context.warehouseId,
        userId: request.securityContext?.userId,
        action: context.action ?? AuditActionResolver.action(request),
        module: context.module ?? AuditActionResolver.module(request),
        entityType: context.entityType ?? AuditActionResolver.entityType(request),
        entityId: context.entityId ?? AuditActionResolver.entityId(request),
        status,
        requestId: request.requestId,
        correlationId: String(request.headers["x-correlation-id"] ?? request.requestId ?? ""),
        ipAddress: request.ip,
        userAgent: request.get("user-agent"),
        beforeState: context.beforeState,
        afterState: context.afterState ?? (status === "success" ? this.extractResponseData(responseBody) : undefined),
        metadata: {
          ...(context.metadata ?? {}),
          method: request.method,
          route: request.originalUrl,
          statusCode: response.statusCode,
          requestBody: LoggerUtils.maskSensitiveData(request.body),
          responseBody: LoggerUtils.maskSensitiveData(responseBody),
          fingerprint: request.securityContext?.requestFingerprint,
        },
      });
    });

    next();
  }

  private static extractResponseData(responseBody: unknown): unknown {
    if (!responseBody || typeof responseBody !== "object") {
      return undefined;
    }

    const body = responseBody as Record<string, unknown>;
    return body.data ?? body;
  }
}
