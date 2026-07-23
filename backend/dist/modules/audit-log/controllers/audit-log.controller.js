import { ApiErrorHandler } from "../../../shared/http/api-error";
import { ApiResponse } from "../../../shared/http/api-response";
import { RequestContext } from "../../../shared/context/request-context";
import { PaginationValidator } from "../../../shared/validators/pagination.validator";
import { AuditLogValidator } from "../validators/audit-log.validator";
export class AuditLogController {
    auditLogService;
    validator = new AuditLogValidator();
    paginationValidator = new PaginationValidator();
    constructor(auditLogService) {
        this.auditLogService = auditLogService;
    }
    create = async (request, response, next) => {
        try {
            const dto = this.validator.parse({
                ...request.body,
                companyId: RequestContext.auth(request)?.companyId ?? request.body.companyId,
                userId: RequestContext.auth(request)?.userId ?? request.body.userId,
                ipAddress: request.ip,
                userAgent: request.get("user-agent"),
                requestId: RequestContext.requestId(request),
                correlationId: String(request.headers["x-correlation-id"] ?? RequestContext.requestId(request) ?? ""),
            });
            const result = await this.auditLogService.record(dto);
            ApiResponse.created(response, result, "Audit log created");
        }
        catch (error) {
            await ApiErrorHandler.handle(error, response, next, "audit-log.controller");
        }
    };
    list = async (request, response, next) => {
        try {
            const paging = this.paginationValidator.normalize(request.query);
            const result = await this.auditLogService.list(RequestContext.companyId(request), paging.limit, paging.offset);
            ApiResponse.ok(response, result, "Audit logs fetched");
        }
        catch (error) {
            await ApiErrorHandler.handle(error, response, next, "audit-log.controller");
        }
    };
}
