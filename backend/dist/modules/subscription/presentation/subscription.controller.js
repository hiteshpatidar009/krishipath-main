import { RequestContext } from "../../../shared/context/request-context";
import { ApiResponse } from "../../../shared/http/api-response";
import { SubscriptionValidator } from "./subscription.validator";
export class SubscriptionController {
    service;
    constructor(service) {
        this.service = service;
    }
    plans = async (_request, response) => ApiResponse.ok(response, await this.service.plans(), "Plans loaded");
    createPlan = async (request, response) => ApiResponse.created(response, await this.service.createPlan(RequestContext.userId(request), SubscriptionValidator.plan.parse(request.body)), "Plan created");
    updatePlan = async (request, response) => ApiResponse.ok(response, await this.service.updatePlan(SubscriptionValidator.planId.parse(request.params).id, RequestContext.userId(request), SubscriptionValidator.updatePlan.parse(request.body)), "Plan updated");
    create = async (request, response) => ApiResponse.created(response, await this.service.create(RequestContext.userId(request), RequestContext.userId(request), SubscriptionValidator.create.parse(request.body)), "Subscription created");
    current = async (request, response) => ApiResponse.ok(response, await this.service.current(RequestContext.userId(request)), "Subscription loaded");
    activate = async (request, response) => ApiResponse.ok(response, await this.service.activate(RequestContext.userId(request), RequestContext.userId(request)), "Subscription activated");
    suspend = async (request, response) => ApiResponse.ok(response, await this.service.suspend(RequestContext.userId(request), RequestContext.userId(request)), "Subscription suspended");
    cancel = async (request, response) => ApiResponse.ok(response, await this.service.cancel(RequestContext.userId(request), RequestContext.userId(request), SubscriptionValidator.cancel.parse(request.body).reason), "Subscription cancelled");
    usage = async (request, response) => ApiResponse.created(response, await this.service.usage(RequestContext.userId(request), RequestContext.userId(request), SubscriptionValidator.usage.parse(request.body)), "Usage recorded");
    entitlements = async (request, response) => ApiResponse.ok(response, await this.service.entitlements(RequestContext.userId(request)), "Entitlements resolved");
}
