import { NextFunction, Request, Response } from "express";

import { RequestLoggerService } from "../services/request-logger.service";
import { PerformanceUtils } from "../utils/performance.utils";

export class RequestLoggerMiddleware {
  private static readonly requestLoggerService = new RequestLoggerService();

  public static use(
    request: Request,
    response: Response,
    next: NextFunction,
  ): void {
    const startedAt = PerformanceUtils.now();

    response.on("finish", () => {
      void RequestLoggerMiddleware.requestLoggerService.write(
        request,
        response,
        startedAt,
      );
    });

    next();
  }
}
