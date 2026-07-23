import { RequestContext } from "../../../shared/context/request-context";
import { ApiErrorHandler } from "../../../shared/http/api-error";
import { ApiResponse } from "../../../shared/http/api-response";
import { PaginationValidator } from "../../../shared/validators/pagination.validator";
import { NotificationValidator } from "../validators/notification.validator";
import { TemplateValidator } from "../validators/template.validator";
export class NotificationController {
    notificationService;
    notificationValidator = new NotificationValidator();
    templateValidator = new TemplateValidator();
    paginationValidator = new PaginationValidator();
    constructor(notificationService) {
        this.notificationService = notificationService;
    }
    create = async (request, response, next) => {
        try {
            const dto = this.notificationValidator.parse({
                ...request.body,
                companyId: RequestContext.companyId(request),
                userId: typeof request.body?.userId === "string" && request.body.userId.length > 0
                    ? request.body.userId
                    : RequestContext.userId(request),
            });
            const result = await this.notificationService.create(dto);
            ApiResponse.created(response, result, "Notification created");
        }
        catch (error) {
            await ApiErrorHandler.handle(error, response, next, "notification.controller");
        }
    };
    list = async (request, response, next) => {
        try {
            const paging = this.paginationValidator.normalize(request.query);
            const result = await this.notificationService.list(RequestContext.companyId(request), RequestContext.userId(request), paging.limit, paging.offset);
            ApiResponse.ok(response, result, "Notifications fetched");
        }
        catch (error) {
            await ApiErrorHandler.handle(error, response, next, "notification.controller");
        }
    };
    createTemplate = async (request, response, next) => {
        try {
            const dto = this.templateValidator.parse({
                ...request.body,
                companyId: RequestContext.companyId(request),
            });
            const result = await this.notificationService.createTemplate(dto);
            ApiResponse.created(response, result, "Template created");
        }
        catch (error) {
            await ApiErrorHandler.handle(error, response, next, "notification.controller");
        }
    };
    listTemplates = async (request, response, next) => {
        try {
            const paging = this.paginationValidator.normalize(request.query);
            const result = await this.notificationService.listTemplates(RequestContext.companyId(request), paging.limit, paging.offset);
            ApiResponse.ok(response, result, "Templates fetched");
        }
        catch (error) {
            await ApiErrorHandler.handle(error, response, next, "notification.controller");
        }
    };
}
