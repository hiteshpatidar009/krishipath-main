import { Request, Response } from "express";
import { MarketInsightService } from "../services/market-insight.service";
import { ApiResponse } from "../../../shared/http/api-response";
import { ErrorResponsePresenter } from "../../../shared/http/error-response.presenter";

export class MarketInsightController {
  constructor(private readonly marketInsightService: MarketInsightService) {}

  public getInsight = async (req: Request, res: Response): Promise<void> => {
    try {
      const { productId, mandiId } = req.query;
      
      if (!productId || typeof productId !== "string") {
        ApiResponse.badRequest(res, "productId is required");
        return;
      }

      const insight = await this.marketInsightService.getActiveInsight(
        productId,
        typeof mandiId === "string" ? mandiId : undefined,
      );

      ApiResponse.ok(res, insight, "Market insight fetched successfully");
    } catch (e: any) {
      const err = ErrorResponsePresenter.from(e, 400);
      res.status(err.statusCode).json(err.body);
    }
  };

  public listAdmin = async (req: Request, res: Response): Promise<void> => {
    try {
      const insights = await this.marketInsightService.listAdmin({
        productId: typeof req.query.productId === "string" ? req.query.productId : undefined,
        mandiId: typeof req.query.mandiId === "string" ? req.query.mandiId : undefined,
        status: typeof req.query.status === "string" ? req.query.status : undefined,
      });
      ApiResponse.ok(res, insights, "Market insights fetched");
    } catch (e: any) {
      const err = ErrorResponsePresenter.from(e, 400);
      res.status(err.statusCode).json(err.body);
    }
  };

  public createAdmin = async (req: Request, res: Response): Promise<void> => {
    try {
      const createdBy = (req as any).auth?.userId;
      const insight = await this.marketInsightService.createInsight(req.body, createdBy);
      ApiResponse.created(res, insight, "Market insight created");
    } catch (e: any) {
      const err = ErrorResponsePresenter.from(e, 400);
      res.status(err.statusCode).json(err.body);
    }
  };

  public updateAdmin = async (req: Request, res: Response): Promise<void> => {
    try {
      const insight = await this.marketInsightService.updateInsight(req.params.id as string, req.body);
      ApiResponse.ok(res, insight, "Market insight updated");
    } catch (e: any) {
      const err = ErrorResponsePresenter.from(e, 400);
      res.status(err.statusCode).json(err.body);
    }
  };
}
