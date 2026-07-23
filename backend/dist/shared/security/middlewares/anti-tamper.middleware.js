import { SecurityConstants } from "../constants/security.constants";
import { SignatureService } from "../services/signature.service";
export class AntiTamperMiddleware {
    static signatureService = new SignatureService();
    static use(secret) {
        return (request, response, next) => {
            const unsafeMethod = ["POST", "PUT", "PATCH", "DELETE"].includes(request.method);
            if (!unsafeMethod || !secret) {
                next();
                return;
            }
            const signature = request.header(SecurityConstants.signatureHeader);
            const timestamp = request.header(SecurityConstants.timestampHeader);
            if (!signature || !timestamp) {
                response.status(400).json({
                    success: false,
                    message: "Request signature required",
                });
                return;
            }
            const ageSeconds = Math.abs(Date.now() - Number(timestamp)) / 1000;
            if (!Number.isFinite(ageSeconds) || ageSeconds > SecurityConstants.maxClockSkewSeconds) {
                response.status(400).json({
                    success: false,
                    message: "Request timestamp expired",
                });
                return;
            }
            const payload = `${timestamp}.${request.method}.${request.originalUrl}.${JSON.stringify(request.body ?? {})}`;
            const valid = AntiTamperMiddleware.signatureService.verify(payload, signature, secret);
            if (!valid) {
                response.status(401).json({
                    success: false,
                    message: "Invalid request signature",
                });
                return;
            }
            next();
        };
    }
}
