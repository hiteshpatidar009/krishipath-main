import { ApiErrorHandler } from "../../../shared/http/api-error";
import { ApiResponse } from "../../../shared/http/api-response";
import { RequestContext } from "../../../shared/context/request-context";
import { PaginationValidator } from "../../../shared/validators/pagination.validator";
import { ActivityLogValidator } from "../validators/activity-log.validator";
export class ActivityLogController {
    activityLogService;
    validator = new ActivityLogValidator();
    paginationValidator = new PaginationValidator();
    constructor(activityLogService) {
        this.activityLogService = activityLogService;
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
            });
            const result = await this.activityLogService.record(dto);
            ApiResponse.created(response, result, "Activity log created");
        }
        catch (error) {
            await ApiErrorHandler.handle(error, response, next, "activity-log.controller");
        }
    };
    list = async (request, response, next) => {
        try {
            const paging = this.paginationValidator.normalize(request.query);
            const result = await this.activityLogService.list(RequestContext.companyId(request), paging.limit, paging.offset);
            ApiResponse.ok(response, result, "Activity logs fetched");
        }
        catch (error) {
            await ApiErrorHandler.handle(error, response, next, "activity-log.controller");
        }
    };
}
