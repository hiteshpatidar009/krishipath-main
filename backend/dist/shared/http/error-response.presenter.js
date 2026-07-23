import { ZodError } from "zod";
import { env } from "../../infrastructure/config/env";
import { AppError } from "../errors/app.error";
const POSTGRES_STATUS_BY_CODE = {
    "23502": 400,
    "23503": 409,
    "23505": 409,
    "23514": 400,
    "22P02": 400,
    "42703": 500,
    "42P01": 500,
};
const PRODUCTION_MESSAGE_BY_STATUS = {
    400: "Invalid request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not found",
    409: "Already exists",
    422: "Validation failed",
};
const SAFE_PRODUCTION_AUTH_MESSAGES = new Set([
    "Invalid credentials",
    "Invalid verification code",
    "Invalid MFA code",
    "Invalid OTP code",
    "Invalid authenticator code",
    "Authenticator app is not configured. Complete signup authenticator setup first.",
]);
export class ErrorResponsePresenter {
    static from(error, fallbackStatusCode = 500) {
        console.error("DEBUG ERROR PRESENTER:", error);
        const statusCode = this.resolveStatusCode(error, fallbackStatusCode);
        const code = this.resolveCode(error);
        if (env.isEnvironmentDevelopment) {
            const body = {
                success: false,
                message: this.resolveMessage(error),
                code,
                details: this.buildDevelopmentDetails(error),
            };
            if (error instanceof ZodError) {
                const formatted = {};
                for (const issue of error.issues) {
                    const path = issue.path.join(".") || "root";
                    formatted[path] = [...(formatted[path] ?? []), issue.message];
                }
                body.errors = formatted;
            }
            return {
                statusCode,
                body,
            };
        }
        const body = {
            success: false,
            message: this.resolveProductionMessage(error, statusCode),
            code,
        };
        if (error instanceof ZodError) {
            const formatted = {};
            for (const issue of error.issues) {
                const path = issue.path.join(".") || "root";
                formatted[path] = [...(formatted[path] ?? []), issue.message];
            }
            body.errors = formatted;
        }
        return {
            statusCode,
            body,
        };
    }
    static resolveStatusCode(error, fallbackStatusCode) {
        if (error instanceof ZodError) {
            return 422;
        }
        if (error instanceof AppError) {
            return error.statusCode;
        }
        const errorLike = this.asErrorLike(error);
        const numericCode = this.asNumber(errorLike.code);
        const postgresCode = this.asString(errorLike.code);
        const causeCode = this.asString(this.asErrorLike(errorLike.cause).code);
        if (numericCode && numericCode >= 400 && numericCode <= 599) {
            return numericCode;
        }
        if (postgresCode && POSTGRES_STATUS_BY_CODE[postgresCode]) {
            return POSTGRES_STATUS_BY_CODE[postgresCode];
        }
        if (causeCode && POSTGRES_STATUS_BY_CODE[causeCode]) {
            return POSTGRES_STATUS_BY_CODE[causeCode];
        }
        const statusCode = this.asNumber(errorLike.statusCode);
        if (statusCode && statusCode >= 400 && statusCode <= 599) {
            return statusCode;
        }
        return fallbackStatusCode;
    }
    static resolveMessage(error) {
        if (error instanceof ZodError) {
            return "Validation failed";
        }
        const errorLike = this.asErrorLike(error);
        const message = this.asString(errorLike.message);
        return message || "Unknown error";
    }
    static PASSTHROUGH_CODES = new Set([
        "BILLING_GATEWAY_AUTH_FAILED",
        "WAREHOUSE_LIMIT_REACHED",
        "USER_LIMIT_REACHED",
        "PRODUCT_LIMIT_REACHED",
        "ORGANIZATION_LIMIT_REACHED",
        "SUPPLIER_LIMIT_REACHED",
        "CUSTOMER_LIMIT_REACHED",
        "API_KEY_LIMIT_REACHED",
        "WEBHOOK_LIMIT_REACHED",
        "INTEGRATION_LIMIT_REACHED",
        "PURCHASE_ORDER_LIMIT_REACHED",
        "SALES_ORDER_LIMIT_REACHED",
        "COMPANY_LIMIT_REACHED",
        "SUBSCRIPTION_RESTRICTED",
        "SUBSCRIPTION_REQUIRED",
        "TWILIO_SMS_NOT_CONFIGURED",
        "TWILIO_DELIVERY_FAILED",
        "TWILIO_WHATSAPP_FROM_INVALID",
        "DUPLICATE_WAVE_CODE",
        "WAVE_CAPACITY_EXCEEDED",
        "DUPLICATE_ORDER_ASSIGNMENT",
        "INVALID_PACKING_STATUS_TRANSITION",
    ]);
    static resolveProductionMessage(error, statusCode) {
        if (error instanceof AppError && ErrorResponsePresenter.PASSTHROUGH_CODES.has(error.code)) {
            return error.message;
        }
        const errorLike = this.asErrorLike(error);
        const message = this.asString(errorLike.message);
        if (errorLike.name === "AuthError" && message) {
            return message;
        }
        if (message && SAFE_PRODUCTION_AUTH_MESSAGES.has(message)) {
            return message;
        }
        const numericCode = this.asNumber(errorLike.code);
        if (numericCode && numericCode >= 400 && numericCode <= 499) {
            return this.genericMessageForStatus(numericCode);
        }
        return this.genericMessageForStatus(statusCode);
    }
    static genericMessageForStatus(statusCode) {
        return PRODUCTION_MESSAGE_BY_STATUS[statusCode] ?? "Something went wrong";
    }
    static resolveCode(error) {
        if (error instanceof AppError) {
            return error.code;
        }
        const errorLike = this.asErrorLike(error);
        const causeLike = this.asErrorLike(errorLike.cause);
        const code = this.asString(errorLike.code) ?? this.asString(causeLike.code);
        if (!code || /^\d{3}$/.test(code)) {
            return undefined;
        }
        return code;
    }
    static buildDevelopmentDetails(error) {
        if (error instanceof ZodError) {
            return {
                issues: error.issues,
            };
        }
        const errorLike = this.asErrorLike(error);
        const causeLike = this.asErrorLike(errorLike.cause);
        return {
            name: this.asString(errorLike.name),
            stack: this.asString(errorLike.stack),
            database: this.databaseDetails(errorLike, causeLike),
            cause: this.causeDetails(causeLike),
        };
    }
    static databaseDetails(errorLike, causeLike) {
        return {
            code: this.asString(causeLike.code) ?? this.asString(errorLike.code),
            detail: this.asString(causeLike.detail) ?? this.asString(errorLike.detail),
            constraint: this.asString(causeLike.constraint) ??
                this.asString(errorLike.constraint),
            schema: this.asString(causeLike.schema) ?? this.asString(errorLike.schema),
            table: this.asString(causeLike.table) ?? this.asString(errorLike.table),
            column: this.asString(causeLike.column) ?? this.asString(errorLike.column),
            query: this.asString(errorLike.query),
            params: this.sanitizeParams(errorLike.params),
        };
    }
    static causeDetails(causeLike) {
        return {
            name: this.asString(causeLike.name),
            message: this.asString(causeLike.message),
            stack: this.asString(causeLike.stack),
        };
    }
    static sanitizeParams(params) {
        if (!Array.isArray(params)) {
            return undefined;
        }
        return params.map((value) => {
            if (typeof value !== "string") {
                return value;
            }
            if (value.length > 64) {
                return "[redacted-long-value]";
            }
            return value;
        });
    }
    static asErrorLike(error) {
        if (typeof error === "object" && error !== null) {
            return error;
        }
        return {};
    }
    static asString(value) {
        return typeof value === "string" && value.length > 0 ? value : undefined;
    }
    static asNumber(value) {
        return typeof value === "number" && Number.isFinite(value)
            ? value
            : undefined;
    }
}
