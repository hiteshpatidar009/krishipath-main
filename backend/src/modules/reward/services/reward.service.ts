import { RewardRepository } from "../repositories/reward.repository";
import { AppError } from "../../../shared/errors/app.error";

export class RewardService {
  constructor(private readonly rewardRepository: RewardRepository) {}

  public async getBalance(userId: string): Promise<number> {
    return (await this.rewardRepository.getSummaryByUserId(userId)).balance;
  }

  public async getSummary(userId: string) {
    return this.rewardRepository.getSummaryByUserId(userId);
  }

  public async getCatalog(userId: string) {
    return this.rewardRepository.getCatalogByUserId(userId);
  }

  public async redeem(userId: string, catalogItemId: string) {
    if (!catalogItemId) throw new AppError("Reward id is required", 400, "REWARD_ID_REQUIRED");
    return this.rewardRepository.redeem(userId, catalogItemId);
  }

  public async createCatalogItem(data: any) {
    const pointsCost = Number(data?.pointsCost);
    const stock = data?.stock == null ? null : Number(data.stock);
    if (!data?.code || !data?.title || !Number.isInteger(pointsCost) || pointsCost <= 0) {
      throw new AppError("code, title and a positive integer pointsCost are required", 422, "INVALID_REWARD_ITEM");
    }
    if (stock != null && (!Number.isInteger(stock) || stock < 0)) {
      throw new AppError("stock must be a non-negative integer or null", 422, "INVALID_REWARD_STOCK");
    }
    return this.rewardRepository.createCatalogItem({
      code: String(data.code).trim().toUpperCase().replace(/[^A-Z0-9_]+/g, "_"),
      title: String(data.title).trim(),
      description: data.description ? String(data.description).trim() : null,
      pointsCost,
      icon: data.icon ? String(data.icon).slice(0, 16) : null,
      stock,
      isActive: data.isActive !== false,
    });
  }

  public async updateCatalogItem(id: string, data: any) {
    const patch: any = {};
    if (data.title !== undefined) patch.title = String(data.title).trim();
    if (data.description !== undefined) patch.description = data.description ? String(data.description).trim() : null;
    if (data.icon !== undefined) patch.icon = data.icon ? String(data.icon).slice(0, 16) : null;
    if (data.isActive !== undefined) patch.isActive = Boolean(data.isActive);
    if (data.pointsCost !== undefined) {
      const cost = Number(data.pointsCost);
      if (!Number.isInteger(cost) || cost <= 0) throw new AppError("pointsCost must be positive", 422, "INVALID_REWARD_COST");
      patch.pointsCost = cost;
    }
    if (data.stock !== undefined) {
      const stock = data.stock == null ? null : Number(data.stock);
      if (stock != null && (!Number.isInteger(stock) || stock < 0)) throw new AppError("stock is invalid", 422, "INVALID_REWARD_STOCK");
      patch.stock = stock;
    }
    const updated = await this.rewardRepository.updateCatalogItem(id, patch);
    if (!updated) throw new AppError("Reward not found", 404, "REWARD_NOT_FOUND");
    return updated;
  }

  public async awardPoints(farmerId: string, actionId: string, points: number, description?: string): Promise<void> {
    await this.rewardRepository.addPoints(farmerId, actionId, points, description);
  }
}
