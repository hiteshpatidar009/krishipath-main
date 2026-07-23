import { RequestContext } from "../../../shared/context/request-context";
import { ApiErrorHandler } from "../../../shared/http/api-error";
import { ApiResponse } from "../../../shared/http/api-response";
import { PushValidator } from "../validators/push.validator";
export class PushController {
    pushService;
    validator = new PushValidator();
    constructor(pushService) {
        this.pushService = pushService;
    }
    send = async (request, response, next) => {
        try {
            const dto = this.validator.parse({
                ...request.body,
                companyId: RequestContext.auth(request)?.companyId,
            });
            const result = await this.pushService.send(dto);
            ApiResponse.created(response, result, "Push accepted");
        }
        catch (error) {
            await ApiErrorHandler.handle(error, response, next, "push.controller");
        }
    };
}
