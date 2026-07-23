import { createHash } from "crypto";
export class FingerprintUtil {
    static fromRequest(request) {
        const userAgent = request.headers["user-agent"] ?? "";
        const forwardedFor = request.headers["x-forwarded-for"] ?? "";
        const source = `${request.ip}|${String(forwardedFor)}|${String(userAgent)}`;
        return createHash("sha256").update(source).digest("hex");
    }
}
