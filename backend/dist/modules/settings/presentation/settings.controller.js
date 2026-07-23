import { RequestContext } from "../../../shared/context/request-context";
import { ApiResponse } from "../../../shared/http/api-response";
import { SettingsValidator } from "./settings.validator";
export class SettingsController {
    service;
    constructor(service) {
        this.service = service;
    }
    resolve = async (request, response) => ApiResponse.ok(response, await this.service.resolve(RequestContext.companyId(request)), "Settings resolved");
    update = async (request, response) => ApiResponse.ok(response, await this.service.update(RequestContext.companyId(request), RequestContext.userId(request), SettingsValidator.update.parse(request.body)), "Settings updated");
    feature = async (request, response) => ApiResponse.ok(response, await this.service.setFeature(RequestContext.companyId(request), RequestContext.userId(request), SettingsValidator.feature.parse(request.body)), "Feature updated");
}
