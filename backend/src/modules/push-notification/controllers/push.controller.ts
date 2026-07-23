import { NextFunction, Request, Response } from "express";
import { RequestContext } from "../../../shared/context/request-context";
import { ApiErrorHandler } from "../../../shared/http/api-error";
import { ApiResponse } from "../../../shared/http/api-response";
import { PushService } from "../services/push.service";
import { PushValidator } from "../validators/push.validator";

export class PushController {
  private readonly validator = new PushValidator();

  constructor(private readonly pushService: PushService) {}

  public send = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = this.validator.parse({
        ...request.body,
        companyId: RequestContext.auth(request)?.companyId,
      });
      const result = await this.pushService.send(dto);
      ApiResponse.created(response, result, "Push accepted");
    } catch (error) {
      await ApiErrorHandler.handle(error, response, next, "push.controller");
    }
  };
}
