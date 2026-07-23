import { RequestContext } from "../../../shared/context/request-context";
import { ApiResponse } from "../../../shared/http/api-response";
import { SetupWizardValidator } from "./setup-wizard.validator";
export class SetupWizardController {
    service;
    constructor(service) {
        this.service = service;
    }
    status = async (request, response) => {
        ApiResponse.ok(response, await this.service.status(RequestContext.companyId(request)), "Setup wizard status loaded");
    };
    progress = async (request, response) => {
        const input = SetupWizardValidator.progress.parse(request.body);
        ApiResponse.ok(response, await this.service.progress(RequestContext.companyId(request), input.step), "Setup wizard progress updated");
    };
    complete = async (request, response) => {
        ApiResponse.ok(response, await this.service.complete(RequestContext.companyId(request)), "Setup wizard completed");
    };
}
