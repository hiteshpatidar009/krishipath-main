import { RequestContext } from "../../../shared/context/request-context";
import { ApiResponse } from "../../../shared/http/api-response";
import { DashboardQueryValidator } from "../validators/dashboard.validator";
export class DashboardController {
    service;
    constructor(service) {
        this.service = service;
    }
    overview = async (request, response) => {
        const parsed = DashboardQueryValidator.parse(request.query);
        ApiResponse.ok(response, await this.service.overview(RequestContext.companyId(request), parsed.warehouseId), "Dashboard loaded");
    };
    home = async (request, response) => {
        ApiResponse.ok(response, await this.service.home(RequestContext.companyId(request), RequestContext.userId(request)), "Home Dashboard loaded");
    };
}
