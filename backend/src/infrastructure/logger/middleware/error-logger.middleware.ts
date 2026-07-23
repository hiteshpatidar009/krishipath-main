import { NextFunction, Request, Response } from "express";

import { ErrorLoggerService } from "../services/error-logger.service";
import { RequestContextType } from "../types/request-context.types";

export class ErrorLoggerMiddleware {
  private static readonly errorLoggerService = new ErrorLoggerService();

  public static use(
    error: Error,
    request: Request,
    _response: Response,
    next: NextFunction,
  ): void {
    const requestWithContext = request as Request & RequestContextType;
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
