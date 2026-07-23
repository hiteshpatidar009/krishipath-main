import { NextFunction, Request, Response } from "express";

import { TraceLoggerService } from "../services/trace-logger.service";

export class RequestIdMiddleware {
  private static readonly traceLoggerService = new TraceLoggerService();

  public static use(
    request: Request,
    response: Response,
    next: NextFunction,
  ): void {
    const requestWithContext = request as Request & { requestId?: string };

    requestWithContext.requestId =
      request.headers["x-request-id"]?.toString() ??
      RequestIdMiddleware.traceLoggerService.createRequestId();

    response.setHeader("x-request-id", requestWithContext.requestId);

    next();
  }
}
