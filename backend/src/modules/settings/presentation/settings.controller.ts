import { Request, Response } from "express";
import { RequestContext } from "../../../shared/context/request-context";
import { ApiResponse } from "../../../shared/http/api-response";
import { SettingsService } from "../application/settings.service";
import { SettingsValidator } from "./settings.validator";

export class SettingsController {
  public constructor(private readonly service: SettingsService) {}

  public resolve = async (request: Request, response: Response): Promise<void> =>
    ApiResponse.ok(response, await this.service.resolve(RequestContext.companyId(request)), "Settings resolved");

  public update = async (request: Request, response: Response): Promise<void> =>
    ApiResponse.ok(response, await this.service.update(RequestContext.companyId(request), RequestContext.userId(request), SettingsValidator.update.parse(request.body)), "Settings updated");

  public feature = async (request: Request, response: Response): Promise<void> =>
    ApiResponse.ok(response, await this.service.setFeature(RequestContext.companyId(request), RequestContext.userId(request), SettingsValidator.feature.parse(request.body)), "Feature updated");
}
