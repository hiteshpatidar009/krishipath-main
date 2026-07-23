import { TraceLoggerService } from "../services/trace-logger.service";
export class RequestIdMiddleware {
    static traceLoggerService = new TraceLoggerService();
    static use(request, response, next) {
        const requestWithContext = request;
        requestWithContext.requestId =
            request.headers["x-request-id"]?.toString() ??
                RequestIdMiddleware.traceLoggerService.createRequestId();
        response.setHeader("x-request-id", requestWithContext.requestId);
        next();
    }
}
