import { EventHandler } from "../../../core/events";
import { KrishiGuruUsedEvent } from "../../../core/events/types/krishiguru-used.event";
import { RewardService } from "../services/reward.service";
import { logger } from "../../../infrastructure/logger";

export class KrishiGuruUsedRewardHandler implements EventHandler<KrishiGuruUsedEvent> {
  public readonly eventType = "domain";
  public readonly eventName = "KrishiGuruUsed";
  public readonly handlerName = "KrishiGuruUsedRewardHandler";

  constructor(private readonly rewardService: RewardService) {}

  public async handle(event: KrishiGuruUsedEvent): Promise<void> {
    try {
      const { farmerId } = event.payload;
      
      // BDM Rule D66: Using AI = 15 points
      await this.rewardService.awardPoints(
        farmerId,
        "AI_CHAT",
        15,
        "Reward for using KrishiGuru AI Assistant"
      );

      logger.info("Awarded KrishiPoints for AI usage", { farmerId, points: 15 });
    } catch (error) {
      logger.error(new Error("Failed to award points for AI usage"), {
        originalError: error instanceof Error ? error.message : String(error),
        farmerId: event.payload.farmerId,
      });
    }
  }
}
