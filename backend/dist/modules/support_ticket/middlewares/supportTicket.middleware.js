export class SupportTicketMiddleware {
    static ensureAuthenticated(request, response, next) {
        if (!request.headers.authorization) {
            response.status(401).json({
                success: false,
                message: "Authentication required to access support ticket resources",
            });
            return;
        }
        next();
    }
    static ensureSupportAgent(request, response, next) {
        if (request.headers["x-user-role"] !== "support_agent") {
            response.status(403).json({
                success: false,
                message: "Support agent role is required",
            });
            return;
        }
        next();
    }
}
