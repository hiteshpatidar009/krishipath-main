import { ErrorLoggerService } from "../services/error-logger.service";
export class ErrorLoggerMiddleware {
    static errorLoggerService = new ErrorLoggerService();
    static use(error, request, _response, next) {
        const requestWithContext = request;
        const userAgentHeader = request.headers["user-agent"];
        const userAgent = Array.isArray(userAgentHeader)
            ? userAgentHeader.join(",")
            : userAgentHeader;
        void ErrorLoggerMiddleware.errorLoggerService.write(error, {
            companyId: requestWithContext.auth?.companyId,
            userId: requestWithContext.auth?.userId,
            method: request.method,
            route: request.originalUrl,
            requestId: requestWithContext.requestId,
            ipAddress: request.ip,
            userAgent,
            payload: request.body,
        });
        next(error);
    }
}
