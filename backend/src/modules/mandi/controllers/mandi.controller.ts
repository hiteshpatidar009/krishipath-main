import { Request, Response } from "express";
import { MandiService } from "../services/mandi.service";
import { MandiPriceService } from "../services/mandi-price.service";
import { MandiProductService } from "../services/mandi-product.service";
import { MandiPublicService } from "../services/mandi-public.service";
import { ApiResponse } from "../../../shared/http/api-response";
import { ErrorResponsePresenter } from "../../../shared/http/error-response.presenter";

export class MandiController {
  constructor(
    private readonly mandiService: MandiService,
    private readonly mandiPriceService?: MandiPriceService,
    private readonly mandiProductService?: MandiProductService,
    private readonly mandiPublicService?: MandiPublicService,
  ) {}

  private commaSeparated(value: unknown): string[] {
    if (Array.isArray(value)) return value.flatMap((item) => String(item).split(",")).map((item) => item.trim()).filter(Boolean);
    return value ? String(value).split(",").map((item) => item.trim()).filter(Boolean) : [];
  }

  private coordinates(req: Request) {
    const latitude = Number(req.query.lat);
    const longitude = Number(req.query.lon);
    return Number.isFinite(latitude) && Number.isFinite(longitude)
      ? { latitude, longitude }
      : undefined;
  }

  /** Complete, database-backed payload for the farmer Mandi screen. */
  public getMandiOverview = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!this.mandiPublicService) {
        ApiResponse.ok(res, null, "Mandi overview service unavailable");
        return;
      }
      const data = await this.mandiPublicService.getOverview(
        req.params.id as string,
        this.commaSeparated(req.query.productIds),
        req.query.primaryProductId ? String(req.query.primaryProductId) : undefined,
        this.coordinates(req),
      );
      ApiResponse.ok(res, data, "Mandi overview fetched");
    } catch (e: any) {
      const err = ErrorResponsePresenter.from(e, 400);
      res.status(err.statusCode).json(err.body);
    }
  };

  /** Active mandis ordered by real geographic distance from the farmer. */
  public getNearbyMandis = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!this.mandiPublicService) {
        ApiResponse.ok(res, [], "Mandi nearby service unavailable");
        return;
      }
      const coordinates = this.coordinates(req);
      if (!coordinates) {
        ApiResponse.badRequest(res, "lat and lon are required");
        return;
      }
      const data = await this.mandiPublicService.getNearbyMandis(
        coordinates,
        Number(req.query.radiusKm || 50),
        Number(req.query.limit || 10),
      );
      ApiResponse.ok(res, data, "Nearby mandis fetched");
    } catch (e: any) {
      const err = ErrorResponsePresenter.from(e, 400);
      res.status(err.statusCode).json(err.body);
    }
  };

  /** Database-backed crop detail (history, grades, buyers and insight). */
  public getProductDetail = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!this.mandiPublicService) {
        ApiResponse.ok(res, null, "Mandi detail service unavailable");
        return;
      }
      const data = await this.mandiPublicService.getProductDetail(
        req.params.id as string,
        req.params.productId as string,
        this.coordinates(req),
      );
      ApiResponse.ok(res, data, "Mandi product detail fetched");
    } catch (e: any) {
      const err = ErrorResponsePresenter.from(e, 400);
      res.status(err.statusCode).json(err.body);
    }
  };

  /** Compare the same crop using official prices from selected mandis. */
  public compareProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!this.mandiPublicService) {
        ApiResponse.ok(res, [], "Mandi comparison service unavailable");
        return;
      }
      const productId = req.query.productId ? String(req.query.productId) : "";
      if (!productId) {
        ApiResponse.badRequest(res, "productId is required");
        return;
      }
      const data = await this.mandiPublicService.compareProduct(
        productId,
        this.commaSeparated(req.query.mandiIds),
        this.coordinates(req),
      );
      ApiResponse.ok(res, data, "Mandi comparison fetched");
    } catch (e: any) {
      const err = ErrorResponsePresenter.from(e, 400);
      res.status(err.statusCode).json(err.body);
    }
  };

  /** Public list of crops currently enabled for a mandi. */
  public getMandiCrops = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!this.mandiProductService) {
        ApiResponse.ok(res, [], "No product service");
        return;
      }
      const products = await this.mandiProductService.getEnabledCrops(req.params.id as string, req.lang);
      ApiResponse.ok(res, products, "Enabled mandi products fetched");
    } catch (e: any) {
      const err = ErrorResponsePresenter.from(e, 400);
      res.status(err.statusCode).json(err.body);
    }
  };

  public getMandiDetails = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const mandi = await this.mandiService.getMandiDetails(id as string, req.lang);
      if (!mandi) {
        ApiResponse.notFound(res, "Mandi not found");
        return;
      }
      ApiResponse.ok(res, mandi, "Mandi details fetched successfully");
    } catch (e: any) {
      const err = ErrorResponsePresenter.from(e, 400);
      res.status(err.statusCode).json(err.body);
    }
  };

  public getMandis = async (req: Request, res: Response): Promise<void> => {
    try {
      const mandis = await this.mandiService.getAllMandis(req.lang);
      ApiResponse.ok(res, mandis, "Mandis fetched successfully");
    } catch (e: any) {
      const err = ErrorResponsePresenter.from(e, 400);
      res.status(err.statusCode).json(err.body);
    }
  };

  /**
   * Public market rates endpoint.
   * GET /mandi/:id/market-rates?cropCodes=wheat,soybean
   * Returns the official prices for the given mandi, filtered to the user's crops.
   */
  public getMarketRates = async (req: Request, res: Response): Promise<void> => {
    try {
      const mandiId = req.params.id as string;
      const cropCodesRaw = req.query.cropCodes as string | undefined;
      const cropCodes = cropCodesRaw ? cropCodesRaw.split(",").map(c => c.trim().toLowerCase()) : null;
      const cropIdsRaw = req.query.cropIds as string | undefined;
      const cropIds = cropIdsRaw ? cropIdsRaw.split(",").map(id => id.trim()).filter(Boolean) : null;

      if (!this.mandiPriceService) {
        ApiResponse.ok(res, [], "No price service");
        return;
      }

      // Validate UUID
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(mandiId)) {
        // Return empty array for non-UUID mock IDs to prevent DB crash
        ApiResponse.ok(res, [], "Invalid mandi ID format");
        return;
      }

      const [allPrices, mandis] = await Promise.all([
        this.mandiPriceService.getOfficialPrices(mandiId),
        this.mandiService.getAllMandis(req.lang),
      ]);
      const mandiName = mandis.find((mandi: any) => mandi.id === mandiId)?.name || "Mandi";

      // Filter to only the requested crops (by cropCode/cropName match)
      const filtered = allPrices.filter((p: any) => {
        const matchesCode = !cropCodes ||
          cropCodes.includes((p.cropCode || "").toLowerCase()) ||
          cropCodes.includes((p.cropName || "").toLowerCase());
        const matchesId = !cropIds || cropIds.includes(String(p.cropId));
        return matchesCode && matchesId;
      });

      // Shape the response for the mobile app
      const shaped = filtered.map((p: any) => {
        const cropSlug = (p.cropName || p.cropCode || p.cropId || "crop")
          .toString()
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");

        return {
        id: `${mandiId}:${p.cropId}`,
        mandiId,
        mandiName,
        cropId: cropSlug,
        productId: p.cropId,
        cropCode: p.cropCode,
        cropName: p.cropName,
        price: parseFloat(p.priceModal) || 0,
        priceMin: parseFloat(p.priceMin) || null,
        priceMax: parseFloat(p.priceMax) || null,
        previousPrice: p.previousPrice,
        previousPriceDate: p.previousPriceDate,
        changePercent: p.changePercent == null ? null : Number(p.changePercent),
        changeAmt: p.changeAmt == null ? null : Number(p.changeAmt),
        priceDate: p.priceDate,
        arrivalQuantity: p.arrivalQuantity == null ? null : Number(p.arrivalQuantity),
        arrivalUnit: p.arrivalUnit || null,
        source: p.source,
        grade: p.grade,
        unit: p.unit,
        sparklineData: p.sparklineData || [],
      };
      });

      ApiResponse.ok(res, shaped, "Market rates fetched");
    } catch (e: any) {
      const err = ErrorResponsePresenter.from(e, 400);
      res.status(err.statusCode).json(err.body);
    }
  };
}
