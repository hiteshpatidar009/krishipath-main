import { createHash } from "crypto";
import { Request } from "express";
import { LogMetadata } from "../logger.types";
import { RequestContextType } from "../types/request-context.types";

export class RequestParserUtils {
  public static toMetadata(request: Request): LogMetadata {
    const requestWithContext = request as Request & RequestContextType;
    const userAgentHeader = request.headers["user-agent"];
    const userAgent = Array.isArray(userAgentHeader)
      ? userAgentHeader.join(",")
      : userAgentHeader;

    return {
      companyId: requestWithContext.auth?.companyId,
      userId: requestWithContext.auth?.userId,
      actorId: requestWithContext.auth?.userId,
      method: request.method,
      route: request.originalUrl,
      requestId: requestWithContext.requestId,
      traceId: requestWithContext.requestId,
      correlationId: String(request.headers["x-correlation-id"] ?? requestWithContext.requestId ?? ""),
      ipAddress: request.ip,
      deviceFingerprint: RequestParserUtils.deviceFingerprint(userAgent, request.headers["x-device-id"]),
      userAgent,
      payload: request.body,
      headers: request.headers as Record<string, unknown>,
      category: "platform",
      action: "http.request.completed",
    };
  }

  private static deviceFingerprint(userAgent: string | undefined, deviceId: unknown): string {
    return createHash("sha256")
      .update(`${String(deviceId ?? "")}|${userAgent ?? ""}`)
      .digest("hex");
  }
}
