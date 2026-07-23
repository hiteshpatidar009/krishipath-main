export class AppError extends Error {
    statusCode;
    code;
    constructor(message, statusCode = 500, code = "APP_ERROR") {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
    }
}
