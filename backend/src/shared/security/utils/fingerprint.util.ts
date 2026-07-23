import { createHash } from "crypto";
import { Request } from "express";

export class FingerprintUtil {
  public static fromRequest(request: Request): string {
    const userAgent = request.headers["user-agent"] ?? "";
    const forwardedFor = request.headers["x-forwarded-for"] ?? "";
    const source = `${request.ip}|${String(forwardedFor)}|${String(userAgent)}`;
    return createHash("sha256").update(source).digest("hex");
  }
}
