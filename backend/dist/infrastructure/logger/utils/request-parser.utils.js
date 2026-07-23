import { createHash } from "crypto";
export class RequestParserUtils {
    static toMetadata(request) {
        const requestWithContext = request;
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
            headers: request.headers,
            category: "platform",
            action: "http.request.completed",
        };
    }
    static deviceFingerprint(userAgent, deviceId) {
        return createHash("sha256")
            .update(`${String(deviceId ?? "")}|${userAgent ?? ""}`)
            .digest("hex");
    }
}
