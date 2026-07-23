export class RequestTraceValidator {
    static validateRequestId(requestId) {
        if (!requestId) {
            return;
        }
        if (requestId.length > 200) {
            throw new Error("requestId length exceeded");
        }
    }
}
