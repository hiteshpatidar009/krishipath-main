import { Request, Response } from "express";
import { RewardService } from "../services/reward.service";
import { ApiResponse } from "../../../shared/http/api-response";
import { ErrorResponsePresenter } from "../../../shared/http/error-response.presenter";

export class RewardController {
  constructor(private readonly rewardService: RewardService) {}

  private auth(req: Request) {
    const auth = (req as any).auth;
    if (!auth?.userId) throw new Error("Unauthorized");
    return auth;
  }

  private admin(req: Request) {
    const auth = this.auth(req);
    if (!auth.isRoot && auth.userType !== "admin") {
      const error: any = new Error("Admin access is required");
      error.statusCode = 403;
      throw error;
    }
    return auth;
  }

  public getBalance = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).auth?.userId;
      if (!userId) throw new Error("Unauthorized");

      const balance = await this.rewardService.getBalance(userId);
      ApiResponse.ok(res, { balance }, "Wallet balance fetched successfully");
    } catch (e: any) {
      const err = ErrorResponsePresenter.from(e, 400);
      res.status(err.statusCode).json(err.body);
    }
  };

  public getSummary = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).auth?.userId;
      if (!userId) throw new Error("Unauthorized");
      const summary = await this.rewardService.getSummary(userId);
      ApiResponse.ok(res, summary, "Reward summary fetched successfully");
    } catch (e: any) {
      const err = ErrorResponsePresenter.from(e, 400);
      res.status(err.statusCode).json(err.body);
    }
  };

  public getCatalog = async (req: Request, res: Response): Promise<void> => {
    try {
      const data = await this.rewardService.getCatalog(this.auth(req).userId);
      ApiResponse.ok(res, data, "Reward catalog fetched successfully");
    } catch (e: any) {
      const err = ErrorResponsePresenter.from(e, 400);
      res.status(err.statusCode).json(err.body);
    }
  };

  public redeem = async (req: Request, res: Response): Promise<void> => {
    try {
      const data = await this.rewardService.redeem(this.auth(req).userId, req.params.id as string);
      ApiResponse.created(res, data, "Reward redemption requested successfully");
    } catch (e: any) {
      const err = ErrorResponsePresenter.from(e, 400);
      res.status(err.statusCode).json(err.body);
    }
  };

  public createCatalogItem = async (req: Request, res: Response): Promise<void> => {
    try {
      this.admin(req);
      ApiResponse.created(res, await this.rewardService.createCatalogItem(req.body), "Reward published successfully");
    } catch (e: any) {
      const err = ErrorResponsePresenter.from(e, 400);
      res.status(err.statusCode).json(err.body);
    }
  };

  public updateCatalogItem = async (req: Request, res: Response): Promise<void> => {
    try {
      this.admin(req);
      ApiResponse.ok(res, await this.rewardService.updateCatalogItem(req.params.id as string, req.body), "Reward updated successfully");
    } catch (e: any) {
      const err = ErrorResponsePresenter.from(e, 400);
      res.status(err.statusCode).json(err.body);
    }
  };
}
