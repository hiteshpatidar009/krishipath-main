import { Request, Response } from "express";
import { MandiProductService } from "../services/mandi-product.service";
import { MandiTraderService } from "../services/mandi-trader.service";
import { MandiPriceService } from "../services/mandi-price.service";
import { ApiResponse } from "../../../shared/http/api-response";
import { ErrorResponsePresenter } from "../../../shared/http/error-response.presenter";

export class MandiCropController {
  constructor(private readonly mandiProductService: MandiProductService) {}

  public getCrops = async (req: Request, res: Response): Promise<void> => {
    try {
      const products = await this.mandiProductService.getCrops(req.params.id as string, req.lang);
      ApiResponse.ok(res, products, "Mandi products fetched");
    } catch (e: any) {
      const err = ErrorResponsePresenter.from(e, 400);
      res.status(err.statusCode).json(err.body);
    }
  };

  public toggleCrop = async (req: Request, res: Response): Promise<void> => {
    try {
      const { productId, isEnabled, priceInitStrategy, sourcePriceMandiId } = req.body;
      if (!productId || isEnabled === undefined) {
        ApiResponse.badRequest(res, "productId and isEnabled are required"); return;
      }
      const result = await this.mandiProductService.toggleCrop(
        req.params.id as string, productId, isEnabled, priceInitStrategy, sourcePriceMandiId,
      );
      ApiResponse.ok(res, result, "Product updated");
    } catch (e: any) {
      const err = ErrorResponsePresenter.from(e, 400);
      res.status(err.statusCode).json(err.body);
    }
  };

  public bulkToggleCrops = async (req: Request, res: Response): Promise<void> => {
    try {
      const { products } = req.body;
      if (!Array.isArray(products)) { ApiResponse.badRequest(res, "products array required"); return; }
      await this.mandiProductService.bulkToggleCrops(req.params.id as string, products);
      ApiResponse.ok(res, null, "Products updated");
    } catch (e: any) {
      const err = ErrorResponsePresenter.from(e, 400);
      res.status(err.statusCode).json(err.body);
    }
  };

  public bulkAssignCrops = async (req: Request, res: Response): Promise<void> => {
    try {
      const { mandiIds, productIds } = req.body;
      if (!Array.isArray(mandiIds) || !Array.isArray(productIds)) {
        ApiResponse.badRequest(res, "mandiIds and productIds arrays required"); return;
      }
      const result = await this.mandiProductService.bulkAssignCrops(mandiIds, productIds);
      ApiResponse.ok(res, result, "Products bulk assigned");
    } catch (e: any) {
      const err = ErrorResponsePresenter.from(e, 400);
      res.status(err.statusCode).json(err.body);
    }
  };
}

export class MandiTraderController {
  constructor(private readonly mandiTraderService: MandiTraderService) {}

  public listAllTraders = async (_req: Request, res: Response): Promise<void> => {
    try {
      ApiResponse.ok(res, await this.mandiTraderService.listAllTraders(), "Traders fetched");
    } catch (e: any) {
      const err = ErrorResponsePresenter.from(e, 400); res.status(err.statusCode).json(err.body);
    }
  };

  public createTrader = async (req: Request, res: Response): Promise<void> => {
    try {
      ApiResponse.created(res, await this.mandiTraderService.createTrader(req.body), "Trader created");
    } catch (e: any) {
      const err = ErrorResponsePresenter.from(e, 400); res.status(err.statusCode).json(err.body);
    }
  };

  public updateTrader = async (req: Request, res: Response): Promise<void> => {
    try {
      ApiResponse.ok(res, await this.mandiTraderService.updateTrader(req.params.traderId as string, req.body), "Trader updated");
    } catch (e: any) {
      const err = ErrorResponsePresenter.from(e, 400); res.status(err.statusCode).json(err.body);
    }
  };

  public getTraders = async (req: Request, res: Response): Promise<void> => {
    try {
      const traders = await this.mandiTraderService.getTraders(req.params.id as string);
      ApiResponse.ok(res, traders, "Traders fetched");
    } catch (e: any) {
      const err = ErrorResponsePresenter.from(e, 400);
      res.status(err.statusCode).json(err.body);
    }
  };

  public assignTrader = async (req: Request, res: Response): Promise<void> => {
    try {
      const assignedBy = (req as any).auth?.userId;
      const { traderId, notes } = req.body;
      if (!traderId) { ApiResponse.badRequest(res, "traderId required"); return; }
      const result = await this.mandiTraderService.assignTrader(req.params.id as string, traderId, assignedBy, notes);
      ApiResponse.created(res, result, "Trader assigned");
    } catch (e: any) {
      const err = ErrorResponsePresenter.from(e, 400);
      res.status(err.statusCode).json(err.body);
    }
  };

  public removeTrader = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.mandiTraderService.removeTrader(req.params.id as string, req.params.traderId as string);
      ApiResponse.ok(res, null, "Trader removed");
    } catch (e: any) {
      const err = ErrorResponsePresenter.from(e, 400);
      res.status(err.statusCode).json(err.body);
    }
  };

  public transferTrader = async (req: Request, res: Response): Promise<void> => {
    try {
      const transferredBy = (req as any).auth?.userId;
      const { fromMandiId, toMandiId } = req.body;
      await this.mandiTraderService.transferTrader(req.params.traderId as string, fromMandiId, toMandiId, transferredBy);
      ApiResponse.ok(res, null, "Trader transferred");
    } catch (e: any) {
      const err = ErrorResponsePresenter.from(e, 400);
      res.status(err.statusCode).json(err.body);
    }
  };
}

export class MandiPriceController {
  constructor(private readonly mandiPriceService: MandiPriceService) {}

  public getOfficialPrices = async (req: Request, res: Response): Promise<void> => {
    try {
      const prices = await this.mandiPriceService.getOfficialPrices(req.params.id as string);
      ApiResponse.ok(res, prices, "Official prices fetched");
    } catch (e: any) {
      const err = ErrorResponsePresenter.from(e, 400);
      res.status(err.statusCode).json(err.body);
    }
  };

  public upsertOfficialPrice = async (req: Request, res: Response): Promise<void> => {
    try {
      const setBy = (req as any).auth?.userId;
      const { productId, priceModal, priceDate, priceMin, priceMax, arrivalQuantity, arrivalUnit, source, grade, unit } = req.body;
      if (!productId || !priceModal || !priceDate) {
        ApiResponse.badRequest(res, "productId, priceModal, and priceDate are required"); return;
      }
      const price = await this.mandiPriceService.setOfficialPrice({
        mandiId: req.params.id as string,
        variantId: productId, priceModal, priceDate, priceMin, priceMax, arrivalQuantity, arrivalUnit, source, grade, unit, setBy,
      });
      ApiResponse.ok(res, price, "Official price saved");
    } catch (e: any) {
      const err = ErrorResponsePresenter.from(e, 400);
      res.status(err.statusCode).json(err.body);
    }
  };

  public upsertOfficialPrices = async (req: Request, res: Response): Promise<void> => {
    try {
      const setBy = (req as any).auth?.userId;
      const records = req.body?.records;
      if (!Array.isArray(records) || records.length === 0) {
        ApiResponse.badRequest(res, "records must be a non-empty array"); return;
      }
      const prices = await this.mandiPriceService.setOfficialPrices(req.params.id as string, records, setBy);
      ApiResponse.ok(res, prices, "Official prices imported");
    } catch (e: any) {
      const err = ErrorResponsePresenter.from(e, 400);
      res.status(err.statusCode).json(err.body);
    }
  };

  public copyPrices = async (req: Request, res: Response): Promise<void> => {
    try {
      const setBy = (req as any).auth?.userId;
      const { sourceMandiId, targetMandiId, productIds } = req.body;
      if (!sourceMandiId || !targetMandiId) {
        ApiResponse.badRequest(res, "sourceMandiId and targetMandiId are required"); return;
      }
      const result = await this.mandiPriceService.copyPrices(
        sourceMandiId, targetMandiId, productIds ?? null, setBy,
      );
      ApiResponse.ok(res, result, "Prices copied successfully");
    } catch (e: any) {
      const err = ErrorResponsePresenter.from(e, 400);
      res.status(err.statusCode).json(err.body);
    }
  };

  public getPricesForCrop = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id as string;
      const productId = req.params.productId as string;
      const priceDate = (req.query.date as string) || new Date().toISOString().split("T")[0];
      const result = await this.mandiPriceService.getTraderPrices(id, productId, priceDate);
      ApiResponse.ok(res, result, "Prices fetched successfully");
    } catch (e: any) {
      const err = ErrorResponsePresenter.from(e, 400);
      res.status(err.statusCode).json(err.body);
    }
  };

  public updatePricesForCrop = async (req: Request, res: Response): Promise<void> => {
    try {
      const setBy = (req as any).auth?.userId;
      const id = req.params.id as string;
      const productId = req.params.productId as string;
      const { traderId, pricePerQuintal, priceDate, grade, officialPrice, traderPrices } = req.body;
      
      const date = priceDate || new Date().toISOString().split("T")[0];

      if (officialPrice !== undefined || Array.isArray(traderPrices)) {
        const result = await this.mandiPriceService.updateCropPriceSheet({
          mandiId: id,
          productId,
          priceDate: date,
          updatedBy: setBy,
          officialPrice,
          traderPrices,
        });
        ApiResponse.ok(res, result, "Price sheet updated successfully");
        return;
      }

      if (!traderId || !pricePerQuintal) {
        ApiResponse.badRequest(res, "traderId and pricePerQuintal are required"); return;
      }

      const result = await this.mandiPriceService.updateTraderPrice(
        traderId, id, productId, pricePerQuintal, setBy, date, grade
      );
      ApiResponse.ok(res, result, "Prices updated successfully");
    } catch (e: any) {
      const err = ErrorResponsePresenter.from(e, 400);
      res.status(err.statusCode).json(err.body);
    }
  };
}
