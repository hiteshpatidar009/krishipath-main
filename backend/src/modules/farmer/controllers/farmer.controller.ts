import { Request, Response } from "express";
import { FarmerService } from "../services/farmer.service";
import { ApiResponse } from "../../../shared/http/api-response";
import { ErrorResponsePresenter } from "../../../shared/http/error-response.presenter";

export class FarmerController {
  constructor(private readonly farmerService: FarmerService) {}

  public getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).auth?.userId;
      if (!userId) throw new Error("Unauthorized");

      const profile = await this.farmerService.getProfile(userId);
      ApiResponse.ok(res, profile, "Farmer profile fetched successfully");
    } catch (e: any) {
      const err = ErrorResponsePresenter.from(e, 400);
      res.status(err.statusCode).json(err.body);
    }
  };

  public updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).auth?.userId;
      if (!userId) throw new Error("Unauthorized");

      const profile = await this.farmerService.updateProfile(userId, req.body);
      ApiResponse.ok(res, profile, "Farmer profile updated successfully");
    } catch (e: any) {
      const err = ErrorResponsePresenter.from(e, 400);
      res.status(err.statusCode).json(err.body);
    }
  };

  public updatePreferences = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).auth?.userId;
      if (!userId) throw new Error("Unauthorized");

      const { mandiIds, productIds } = req.body;
      const profile = await this.farmerService.updatePreferences(userId, mandiIds, productIds);
      
      ApiResponse.ok(res, profile, "Preferences updated successfully");
    } catch (e: any) {
      const err = ErrorResponsePresenter.from(e, 400);
      res.status(err.statusCode).json(err.body);
    }
  };

  public getNotificationPreferences = async (req: Request, res: Response): Promise<void> => {
    try {
      ApiResponse.ok(
        res,
        await this.farmerService.getNotificationPreferences(this.userId(req)),
        "Notification preferences fetched",
      );
    } catch (e: any) {
      const err = ErrorResponsePresenter.from(e, 400);
      res.status(err.statusCode).json(err.body);
    }
  };

  public updateNotificationPreferences = async (req: Request, res: Response): Promise<void> => {
    try {
      ApiResponse.ok(
        res,
        await this.farmerService.updateNotificationPreferences(this.userId(req), req.body || {}),
        "Notification preferences updated",
      );
    } catch (e: any) {
      const err = ErrorResponsePresenter.from(e, 400);
      res.status(err.statusCode).json(err.body);
    }
  };

  private userId(req: Request): string {
    const userId = (req as any).auth?.userId;
    if (!userId) throw new Error("Unauthorized");
    return userId;
  }

  public getCalendar = async (req: Request, res: Response): Promise<void> => {
    try {
      const data = await this.farmerService.getCalendar(this.userId(req), Number(req.query.year), Number(req.query.month));
      ApiResponse.ok(res, data, "Farm calendar fetched successfully");
    } catch (e: any) {
      const err = ErrorResponsePresenter.from(e, 400); res.status(err.statusCode).json(err.body);
    }
  };

  public getMarketWatchlist = async (req: Request, res: Response): Promise<void> => {
    try {
      ApiResponse.ok(res, await this.farmerService.getMarketWatchlist(this.userId(req)), "Market watchlist fetched");
    } catch (e: any) {
      const err = ErrorResponsePresenter.from(e, 400); res.status(err.statusCode).json(err.body);
    }
  };

  public saveMarketWatch = async (req: Request, res: Response): Promise<void> => {
    try {
      const data = await this.farmerService.saveMarketWatch(
        this.userId(req),
        req.body?.mandiId,
        req.body?.productId,
      );
      ApiResponse.created(res, data, "Market item saved");
    } catch (e: any) {
      const err = ErrorResponsePresenter.from(e, 400); res.status(err.statusCode).json(err.body);
    }
  };

  public removeMarketWatch = async (req: Request, res: Response): Promise<void> => {
    try {
      const data = await this.farmerService.removeMarketWatch(
        this.userId(req),
        req.params.mandiId as string,
        req.params.productId as string,
      );
      ApiResponse.ok(res, data, "Market item removed");
    } catch (e: any) {
      const err = ErrorResponsePresenter.from(e, 400); res.status(err.statusCode).json(err.body);
    }
  };

  public createCalendarEvent = async (req: Request, res: Response): Promise<void> => {
    try {
      const data = await this.farmerService.createCalendarEvent(this.userId(req), req.body);
      ApiResponse.created(res, data, "Calendar event created");
    } catch (e: any) {
      const err = ErrorResponsePresenter.from(e, 400); res.status(err.statusCode).json(err.body);
    }
  };

  public getTasks = async (req: Request, res: Response): Promise<void> => {
    try {
      ApiResponse.ok(res, await this.farmerService.getTasks(this.userId(req)), "Farmer tasks fetched");
    } catch (e: any) {
      const err = ErrorResponsePresenter.from(e, 400); res.status(err.statusCode).json(err.body);
    }
  };

  public createTask = async (req: Request, res: Response): Promise<void> => {
    try {
      ApiResponse.created(res, await this.farmerService.createTask(this.userId(req), req.body), "Farmer task created");
    } catch (e: any) {
      const err = ErrorResponsePresenter.from(e, 400); res.status(err.statusCode).json(err.body);
    }
  };

  public completeTask = async (req: Request, res: Response): Promise<void> => {
    try {
      ApiResponse.ok(res, await this.farmerService.completeTask(this.userId(req), req.params.id as string), "Task completed");
    } catch (e: any) {
      const err = ErrorResponsePresenter.from(e, 400); res.status(err.statusCode).json(err.body);
    }
  };
}
