import { NextFunction, Request, Response } from "express";
import { z, ZodType } from "zod";
import { ValidationTargetDto } from "../dtos/validation-target.dto";
import { SchemaValidator } from "../validators/schema.validator";

export class SchemaValidationMiddleware {
  private static readonly validator = new SchemaValidator();

  public static validate<T>(
    schema: ZodType<T>,
    target: ValidationTargetDto = "body",
  ) {
    return (request: Request, response: Response, next: NextFunction): void => {
      try {
        const validated = SchemaValidationMiddleware.validator.validate(
          schema,
          request[target],
        ) as Request[typeof target];

        SchemaValidationMiddleware.assignValidatedTarget(
          request,
          target,
          validated,
        );
        next();
      } catch (error: unknown) {
        if (error instanceof z.ZodError) {
          const statusCode = target === "params" ? 400 : 422;
          response.status(statusCode).json({
            success: false,
            message: target === "params" ? "Invalid request parameters" : "Validation failed",
            errors: SchemaValidationMiddleware.validator.format(error),
          });
          return;
        }

        next(error);
      }
    };
  }
  private static assignValidatedTarget(
    request: Request,
    target: ValidationTargetDto,
    value: Request[typeof target],
  ): void {
    if (target === "query") {
      Object.defineProperty(request, "query", {
        configurable: true,
        enumerable: true,
        value,
        writable: true,
      });
      return;
    }

    request[target] = value;
  }
}
