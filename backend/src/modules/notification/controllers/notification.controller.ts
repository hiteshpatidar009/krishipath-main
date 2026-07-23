import { NextFunction, Request, Response } from "express";
import { RequestContext } from "../../../shared/context/request-context";
import { ApiErrorHandler } from "../../../shared/http/api-error";
import { ApiResponse } from "../../../shared/http/api-response";
import { PaginationValidator } from "../../../shared/validators/pagination.validator";
import { NotificationService } from "../services/notification.service";
import { NotificationValidator } from "../validators/notification.validator";
import { TemplateValidator } from "../validators/template.validator";

export class NotificationController {
  private readonly notificationValidator = new NotificationValidator();
  private readonly templateValidator = new TemplateValidator();
  private readonly paginationValidator = new PaginationValidator();

  constructor(private readonly notificationService: NotificationService) {}

  public create = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
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
    } catch (error) {
      await ApiErrorHandler.handle(error, response, next, "notification.controller");
    }
  };

  public list = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const paging = this.paginationValidator.normalize(request.query);
      const result = await this.notificationService.list(
        RequestContext.companyId(request),
        RequestContext.userId(request),
        paging.limit,
        paging.offset,
      );
      ApiResponse.ok(response, result, "Notifications fetched");
    } catch (error) {
      await ApiErrorHandler.handle(error, response, next, "notification.controller");
    }
  };

  public createTemplate = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = this.templateValidator.parse({
        ...request.body,
        companyId: RequestContext.companyId(request),
      });
      const result = await this.notificationService.createTemplate(dto);
      ApiResponse.created(response, result, "Template created");
    } catch (error) {
      await ApiErrorHandler.handle(error, response, next, "notification.controller");
    }
  };

  public listTemplates = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const paging = this.paginationValidator.normalize(request.query);
      const result = await this.notificationService.listTemplates(RequestContext.companyId(request), paging.limit, paging.offset);
      ApiResponse.ok(response, result, "Templates fetched");
    } catch (error) {
      await ApiErrorHandler.handle(error, response, next, "notification.controller");
    }
  };
}
