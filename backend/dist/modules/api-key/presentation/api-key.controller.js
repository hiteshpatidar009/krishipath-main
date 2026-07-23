import { RequestContext } from "../../../shared/context/request-context";
import { ApiResponse } from "../../../shared/http/api-response";
import { ApiKeyValidator } from "./api-key.validator";
export class ApiKeyController {
    service;
    constructor(service) {
        this.service = service;
    }
    create = async (request, response) => ApiResponse.created(response, await this.service.create(RequestContext.companyId(request), RequestContext.userId(request), ApiKeyValidator.create.parse(request.body)), "API key created");
    list = async (request, response) => ApiResponse.ok(response, await this.service.list(RequestContext.companyId(request)), "API keys loaded");
    rotate = async (request, response) => ApiResponse.created(response, await this.service.rotate(RequestContext.companyId(request), RequestContext.userId(request), String(request.params.apiKeyId ?? ""), ApiKeyValidator.create.parse(request.body)), "API key rotated");
    revoke = async (request, response) => ApiResponse.ok(response, await this.service.revoke(RequestContext.companyId(request), RequestContext.userId(request), String(request.params.apiKeyId ?? "")), "API key revoked");
}
