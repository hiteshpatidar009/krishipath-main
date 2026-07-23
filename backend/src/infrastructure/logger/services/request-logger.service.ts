import { Request, Response } from "express";

import { logger } from "../logger.service";
import { PerformanceUtils } from "../utils/performance.utils";
import { RequestParserUtils } from "../utils/request-parser.utils";
import { ResponseParserUtils } from "../utils/response-parser.utils";

export class RequestLoggerService {
  public async write(
    request: Request,
    response: Response,
    startedAt: number,
  ): Promise<void> {
    const requestMetadata = RequestParserUtils.toMetadata(request);
    const duration = PerformanceUtils.duration(startedAt);
    const statusCode = response.statusCode;
    const message = "Request completed";
    const metadata = {
      ...requestMetadata,
      response: ResponseParserUtils.toMetadata(response, duration),
      executionDuration: duration,
    };

    if (statusCode >= 500) {
      await logger.error(new Error(message), metadata);
      return;
    }

    if (statusCode >= 400) {
      await logger.warn(message, metadata);
      return;
    }

    await logger.info(message, metadata);
  }
}
