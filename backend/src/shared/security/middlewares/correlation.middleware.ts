import { randomUUID } from "crypto";
import { NextFunction, Request, Response } from "express";

export class CorrelationMiddleware {
  public static use(request: Request, response: Response, next: NextFunction): void {
    const correlationId = request.header("x-correlation-id") ?? randomUUID();
    const traceId = request.header("x-trace-id") ?? correlationId;
    const contextualRequest = request as Request & {
      correlationId?: string;
      traceId?: string;
    };
    contextualRequest.correlationId = correlationId;
    contextualRequest.traceId = traceId;
    response.setHeader("x-correlation-id", correlationId);
    response.setHeader("x-trace-id", traceId);
    next();
  }
}
