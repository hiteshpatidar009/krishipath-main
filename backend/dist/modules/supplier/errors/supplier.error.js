import { AppError } from "../../../shared/errors/app.error";
export class SupplierError extends AppError {
    httpStatus;
    constructor(statusCode, message) {
        super(message, statusCode, "SUPPLIER_ERROR");
        this.httpStatus = statusCode;
    }
}
