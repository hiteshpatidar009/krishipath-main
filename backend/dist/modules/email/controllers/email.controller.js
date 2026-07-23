import { RequestContext } from "../../../shared/context/request-context";
import { ApiErrorHandler } from "../../../shared/http/api-error";
import { ApiResponse } from "../../../shared/http/api-response";
import { EmailValidator } from "../validators/email.validator";
export class EmailController {
    emailService;
    validator = new EmailValidator();
    constructor(emailService) {
        this.emailService = emailService;
    }
    send = async (request, response, next) => {
        try {
            const dto = this.validator.parse({
                ...request.body,
                companyId: RequestContext.auth(request)?.companyId,
                userId: RequestContext.auth(request)?.userId,
            });
            const result = await this.emailService.send(dto);
            ApiResponse.created(response, result, "Email accepted");
        }
        catch (error) {
            await ApiErrorHandler.handle(error, response, next, "email.controller");
        }
    };
}
