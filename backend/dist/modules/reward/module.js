import { RewardController } from "./controllers/reward.controller";
import { RewardRepository } from "./repositories/reward.repository";
import { RewardRoutes } from "./routes/reward.routes";
import { RewardService } from "./services/reward.service";
import { CoreEventBus } from "../../core/events";
import { KrishiGuruUsedRewardHandler } from "./events/krishiguru-used.handler";
export class RewardModule {
    rewardRepository;
    rewardService;
    rewardController;
    rewardRoutes;
    krishiGuruUsedRewardHandler;
    constructor() {
        this.rewardRepository = new RewardRepository();
        this.rewardService = new RewardService(this.rewardRepository);
        this.rewardController = new RewardController(this.rewardService);
        this.rewardRoutes = new RewardRoutes(this.rewardController);
        // Register event handlers
        this.krishiGuruUsedRewardHandler = new KrishiGuruUsedRewardHandler(this.rewardService);
        CoreEventBus.subscribe("KrishiGuruUsed", this.krishiGuruUsedRewardHandler);
    }
    getRouter() {
        return this.rewardRoutes.getRouter();
    }
}
