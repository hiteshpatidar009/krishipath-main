import { logger } from "../../../infrastructure/logger";
export class KrishiGuruUsedRewardHandler {
    rewardService;
    eventType = "domain";
    eventName = "KrishiGuruUsed";
    handlerName = "KrishiGuruUsedRewardHandler";
    constructor(rewardService) {
        this.rewardService = rewardService;
    }
    async handle(event) {
        try {
            const { farmerId } = event.payload;
            // BDM Rule D66: Using AI = 15 points
            await this.rewardService.awardPoints(farmerId, "AI_CHAT", 15, "Reward for using KrishiGuru AI Assistant");
            logger.info("Awarded KrishiPoints for AI usage", { farmerId, points: 15 });
        }
        catch (error) {
            logger.error(new Error("Failed to award points for AI usage"), {
                originalError: error instanceof Error ? error.message : String(error),
                farmerId: event.payload.farmerId,
            });
        }
    }
}
