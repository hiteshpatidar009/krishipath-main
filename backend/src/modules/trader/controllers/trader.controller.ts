import { Request, Response } from "express";
import { TraderService } from "../services/trader.service";
import { ApiResponse } from "../../../shared/http/api-response";
import { ErrorResponsePresenter } from "../../../shared/http/error-response.presenter";

export class TraderController {
  constructor(private readonly traderService: TraderService) {}

  public getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).auth?.userId;
      if (!userId) throw new Error("Unauthorized");

      const profile = await this.traderService.getProfile(userId);
      ApiResponse.ok(res, profile, "Trader profile fetched successfully");
    } catch (e: any) {
      const err = ErrorResponsePresenter.from(e, 400);
      res.status(err.statusCode).json(err.body);
    }
  };

  public updatePrices = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).auth?.userId;
      if (!userId) throw new Error("Unauthorized");

      const profile = await this.traderService.getProfile(userId);
      if (!profile) {
        ApiResponse.notFound(res, "Trader profile not found");
        return;
      }

      const { mandiId, productId, pricePerQuintal } = req.body;
      await this.traderService.updatePrice(
        profile.id,
        mandiId,
        productId,
        pricePerQuintal,
        userId,
      );

      ApiResponse.ok(res, null, "Price updated successfully");
    } catch (e: any) {
      const err = ErrorResponsePresenter.from(e, 400);
      res.status(err.statusCode).json(err.body);
    }
  };
}
