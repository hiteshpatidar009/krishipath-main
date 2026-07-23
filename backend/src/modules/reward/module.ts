import { Router } from "express";
import { RewardController } from "./controllers/reward.controller";
import { RewardRepository } from "./repositories/reward.repository";
import { RewardRoutes } from "./routes/reward.routes";
import { RewardService } from "./services/reward.service";
import { CoreEventBus } from "../../core/events";
import { KrishiGuruUsedRewardHandler } from "./events/krishiguru-used.handler";

export class RewardModule {
  private readonly rewardRepository: RewardRepository;
  private readonly rewardService: RewardService;
  private readonly rewardController: RewardController;
  private readonly rewardRoutes: RewardRoutes;
  private readonly krishiGuruUsedRewardHandler: KrishiGuruUsedRewardHandler;

  constructor() {
    this.rewardRepository = new RewardRepository();
    this.rewardService = new RewardService(this.rewardRepository);
    this.rewardController = new RewardController(this.rewardService);
    this.rewardRoutes = new RewardRoutes(this.rewardController);

    // Register event handlers
    this.krishiGuruUsedRewardHandler = new KrishiGuruUsedRewardHandler(this.rewardService);
    CoreEventBus.subscribe("KrishiGuruUsed", this.krishiGuruUsedRewardHandler);
  }

  public getRouter(): Router {
    return this.rewardRoutes.getRouter();
  }
}
