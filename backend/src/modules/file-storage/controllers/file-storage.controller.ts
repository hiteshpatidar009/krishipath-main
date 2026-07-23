import { NextFunction, Request, Response } from "express";
import { RequestContext } from "../../../shared/context/request-context";
import { ApiErrorHandler } from "../../../shared/http/api-error";
import { ApiResponse } from "../../../shared/http/api-response";
import { FileStorageService } from "../services/file-storage.service";
import { FileSignValidator } from "../validators/file-sign.validator";

export class FileStorageController {
  private readonly validator = new FileSignValidator();

  constructor(private readonly fileStorageService: FileStorageService) {}

  public signUpload = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = this.validator.parse(request.body);
      const result = await this.fileStorageService.createUploadTarget(
        RequestContext.companyId(request),
        RequestContext.userId(request),
        dto,
      );
      ApiResponse.created(response, result, "Upload target created");
    } catch (error) {
      await ApiErrorHandler.handle(error, response, next, "file-storage.controller");
    }
  };
}
