import { RequestContext } from "../../../shared/context/request-context";
import { ApiResponse } from "../../../shared/http/api-response";
import { ReorderStockPlanningValidator } from "./reorder-stock-planning.validator";
export class ReorderStockPlanningController {
    createRuleUseCase;
    listRulesUseCase;
    generateUseCase;
    listRecommendationsUseCase;
    approveUseCase;
    rejectUseCase;
    summaryUseCase;
    constructor(createRuleUseCase, listRulesUseCase, generateUseCase, listRecommendationsUseCase, approveUseCase, rejectUseCase, summaryUseCase) {
        this.createRuleUseCase = createRuleUseCase;
        this.listRulesUseCase = listRulesUseCase;
        this.generateUseCase = generateUseCase;
        this.listRecommendationsUseCase = listRecommendationsUseCase;
        this.approveUseCase = approveUseCase;
        this.rejectUseCase = rejectUseCase;
        this.summaryUseCase = summaryUseCase;
    }
    rulesSummary = async (request, response) => {
        const companyId = RequestContext.companyId(request);
        const result = await this.summaryUseCase.execute(companyId);
        ApiResponse.ok(response, result, "Reorder policy summary loaded");
    };
    createRule = async (request, response) => {
        const dto = ReorderStockPlanningValidator.createRule.parse(request.body);
        ApiResponse.created(response, await this.createRuleUseCase.execute({
            ...dto,
            companyId: RequestContext.companyId(request),
            createdBy: RequestContext.userId(request),
        }), "Reorder rule created");
    };
    listRules = async (request, response) => {
        const query = ReorderStockPlanningValidator.listRules.parse(request.query);
        ApiResponse.ok(response, await this.listRulesUseCase.execute({ ...query, companyId: RequestContext.companyId(request) }), "Reorder rules loaded");
    };
    generate = async (request, response) => {
        const dto = ReorderStockPlanningValidator.generate.parse(request.body);
        ApiResponse.ok(response, await this.generateUseCase.execute({ ...dto, companyId: RequestContext.companyId(request), actorId: RequestContext.userId(request) }), "Recommendations generated");
    };
    listRecommendations = async (request, response) => {
        const query = ReorderStockPlanningValidator.listRecommendations.parse(request.query);
        ApiResponse.ok(response, await this.listRecommendationsUseCase.execute({ ...query, companyId: RequestContext.companyId(request) }), "Recommendations loaded");
    };
    approve = async (request, response) => {
        ApiResponse.ok(response, await this.approveUseCase.execute({
            companyId: RequestContext.companyId(request),
            actorId: RequestContext.userId(request),
            recommendationId: String(request.params.recommendationId),
        }), "Recommendation approved");
    };
    reject = async (request, response) => {
        const dto = ReorderStockPlanningValidator.reject.parse(request.body);
        ApiResponse.ok(response, await this.rejectUseCase.execute({
            ...dto,
            companyId: RequestContext.companyId(request),
            actorId: RequestContext.userId(request),
            recommendationId: String(request.params.recommendationId),
        }), "Recommendation rejected");
    };
}
