import { ApproveReorderRecommendationUseCase, CreateReorderRuleUseCase, GenerateReorderRecommendationsUseCase, ListReorderRecommendationsUseCase, ListReorderRulesUseCase, RejectReorderRecommendationUseCase, GetReorderPolicySummaryUseCase, } from "./application";
import { ReorderStockPlanningContractAdapter } from "./contracts";
import { PostgresReorderPlanningRepository } from "./infrastructure/postgres-reorder-planning.repository";
import { ReorderStockPlanningController } from "./presentation/reorder-stock-planning.controller";
import { ReorderStockPlanningRoutes } from "./presentation/reorder-stock-planning.routes";
export class ReorderStockPlanningModule {
    repository = new PostgresReorderPlanningRepository();
    createRuleUseCase = new CreateReorderRuleUseCase(this.repository);
    generateUseCase = new GenerateReorderRecommendationsUseCase(this.repository);
    controller = new ReorderStockPlanningController(this.createRuleUseCase, new ListReorderRulesUseCase(this.repository), this.generateUseCase, new ListReorderRecommendationsUseCase(this.repository), new ApproveReorderRecommendationUseCase(this.repository), new RejectReorderRecommendationUseCase(this.repository), new GetReorderPolicySummaryUseCase(this.repository));
    routes = new ReorderStockPlanningRoutes(this.controller);
    contract = new ReorderStockPlanningContractAdapter(this.generateUseCase);
    getRouter() {
        return this.routes.getRouter();
    }
    getContract() {
        return this.contract;
    }
}
