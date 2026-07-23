import { NextFunction, Request, Response } from "express";
import { RequestContext } from "../../../shared/context/request-context";
import { ApiErrorHandler } from "../../../shared/http/api-error";
import { ApiResponse } from "../../../shared/http/api-response";
import { SmsService } from "../services/sms.service";
import { SmsValidator } from "../validators/sms.validator";

export class SmsController {
  private readonly validator = new SmsValidator();

  constructor(private readonly smsService: SmsService) {}

  public send = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = this.validator.parse({
        ...request.body,
        companyId: RequestContext.auth(request)?.companyId,
        userId: RequestContext.auth(request)?.userId,
      });
      const result = await this.smsService.send(dto);
      ApiResponse.created(response, result, "SMS accepted");
    } catch (error) {
      await ApiErrorHandler.handle(error, response, next, "sms.controller");
    }
  };
}
