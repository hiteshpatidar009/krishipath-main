import { z } from "zod";
import { SchemaValidator } from "../validators/schema.validator";
export class SchemaValidationMiddleware {
    static validator = new SchemaValidator();
    static validate(schema, target = "body") {
        return (request, response, next) => {
            try {
                const validated = SchemaValidationMiddleware.validator.validate(schema, request[target]);
                SchemaValidationMiddleware.assignValidatedTarget(request, target, validated);
                next();
            }
            catch (error) {
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
    static assignValidatedTarget(request, target, value) {
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
