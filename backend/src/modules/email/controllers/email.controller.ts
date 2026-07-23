import { NextFunction, Request, Response } from "express";
import { RequestContext } from "../../../shared/context/request-context";
import { ApiErrorHandler } from "../../../shared/http/api-error";
import { ApiResponse } from "../../../shared/http/api-response";
import { EmailService } from "../services/email.service";
import { EmailValidator } from "../validators/email.validator";

export class EmailController {
  private readonly validator = new EmailValidator();

  constructor(private readonly emailService: EmailService) {}

  public send = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = this.validator.parse({
        ...request.body,
        companyId: RequestContext.auth(request)?.companyId,
        userId: RequestContext.auth(request)?.userId,
      });
      const result = await this.emailService.send(dto);
      ApiResponse.created(response, result, "Email accepted");
    } catch (error) {
      await ApiErrorHandler.handle(error, response, next, "email.controller");
    }
  };
}
