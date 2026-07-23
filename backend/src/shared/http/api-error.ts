import { NextFunction, Response } from "express";
import { ZodError } from "zod";
import { logger } from "../../infrastructure/logger";
import { AppError } from "../errors/app.error";
import { ErrorResponsePresenter } from "./error-response.presenter";

export class ApiErrorHandler {
  public static async handle(
    error: unknown,
    response: Response,
    next: NextFunction,
    moduleName: string,
  ): Promise<void> {
    const normalized = error instanceof Error ? error : new Error("Unknown error");

    await logger.error(normalized, {
      module: moduleName,
      tags: [moduleName, "controller", "error"],
    });

    if (error instanceof ZodError) {
      const formatted = ErrorResponsePresenter.from(error, 422);
      response.status(formatted.statusCode).json(formatted.body);
      return;
    }

    if (normalized instanceof AppError) {
      const formatted = ErrorResponsePresenter.from(normalized);
      response.status(formatted.statusCode).json(formatted.body);
      return;
    }

    next(normalized);
  }
}
