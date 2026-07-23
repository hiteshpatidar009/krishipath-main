import { NextFunction, Request, Response } from "express";
import { SqlSanitizer } from "../sanitizers/sql.sanitizer";
import { XssSanitizer } from "../sanitizers/xss.sanitizer";

export class InputSanitizationMiddleware {
  private static readonly xss = new XssSanitizer();
  private static readonly sql = new SqlSanitizer();

  public static use(request: Request, _response: Response, next: NextFunction): void {
    request.body = InputSanitizationMiddleware.sanitize(request.body);

    if (InputSanitizationMiddleware.isRecord(request.query)) {
      const sanitizedQuery = InputSanitizationMiddleware.sanitize(request.query);
      if (InputSanitizationMiddleware.isRecord(sanitizedQuery)) {
        InputSanitizationMiddleware.replaceObjectContent(request.query, sanitizedQuery);
      }
    }

    if (InputSanitizationMiddleware.isRecord(request.params)) {
      const sanitizedParams = InputSanitizationMiddleware.sanitize(request.params);
      if (InputSanitizationMiddleware.isRecord(sanitizedParams)) {
        InputSanitizationMiddleware.replaceObjectContent(request.params, sanitizedParams);
      }
    }

    next();
  }

  private static sanitize(value: unknown): unknown {
    return InputSanitizationMiddleware.sql.normalize(
      InputSanitizationMiddleware.xss.sanitize(value),
    );
  }

  private static isRecord(value: unknown): value is Record<string, unknown> {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
  }

  private static replaceObjectContent(
    target: Record<string, unknown>,
    source: Record<string, unknown>,
  ): void {
    for (const key of Object.keys(target)) {
      delete target[key];
    }

    for (const [key, value] of Object.entries(source)) {
      target[key] = value;
    }
  }
}
