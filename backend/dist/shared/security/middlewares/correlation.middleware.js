import { randomUUID } from "crypto";
export class CorrelationMiddleware {
    static use(request, response, next) {
        const correlationId = request.header("x-correlation-id") ?? randomUUID();
        const traceId = request.header("x-trace-id") ?? correlationId;
        const contextualRequest = request;
        contextualRequest.correlationId = correlationId;
        contextualRequest.traceId = traceId;
        response.setHeader("x-correlation-id", correlationId);
        response.setHeader("x-trace-id", traceId);
        next();
    }
}
