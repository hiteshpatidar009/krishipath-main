import { ApiErrorHandler } from "../../../shared/http/api-error";
import { ApiResponse } from "../../../shared/http/api-response";
import { platformLogCategorySchema, platformLogListSchema, } from "../validators/platform-log.validator";
export class PlatformLogController {
    service;
    constructor(service) {
        this.service = service;
    }
    list = async (request, response, next) => {
        try {
            const params = platformLogCategorySchema.parse(request.params);
            const query = platformLogListSchema.parse(request.query);
            ApiResponse.ok(response, await this.service.list(params.category, query), "Platform logs fetched");
        }
        catch (error) {
            await ApiErrorHandler.handle(error, response, next, "platform-log");
        }
    };
    metrics = async (_request, response, next) => {
        try {
            ApiResponse.ok(response, await this.service.metrics(), "Log metrics fetched");
        }
        catch (error) {
            await ApiErrorHandler.handle(error, response, next, "platform-log");
        }
    };
}
