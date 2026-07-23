import { NextFunction, Request, Response } from "express";

export class ResponseLoggerMiddleware {
  public static use(
    _request: Request,
    response: Response,
    next: NextFunction,
  ): void {
    response.setHeader("x-response-timestamp", new Date().toISOString());
    next();
  }
}
