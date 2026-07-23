import { RequestContext } from "../../../shared/context/request-context";
import { ApiErrorHandler } from "../../../shared/http/api-error";
import { ApiResponse } from "../../../shared/http/api-response";
import { SmsValidator } from "../validators/sms.validator";
export class SmsController {
    smsService;
    validator = new SmsValidator();
    constructor(smsService) {
        this.smsService = smsService;
    }
    send = async (request, response, next) => {
        try {
            const dto = this.validator.parse({
                ...request.body,
                companyId: RequestContext.auth(request)?.companyId,
                userId: RequestContext.auth(request)?.userId,
            });
            const result = await this.smsService.send(dto);
            ApiResponse.created(response, result, "SMS accepted");
        }
        catch (error) {
            await ApiErrorHandler.handle(error, response, next, "sms.controller");
        }
    };
}
