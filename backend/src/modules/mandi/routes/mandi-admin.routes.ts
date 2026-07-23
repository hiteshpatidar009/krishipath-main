import { NextFunction, Request, Response, Router } from "express";
import { MandiAdminController } from "../controllers/mandi-admin.controller";
import { ProductAdminController } from "../controllers/product-admin.controller";
import { LocationController } from "../controllers/location.controller";
import { MasterDataController } from "../controllers/master-data.controller";
import { TranslationService } from "../../localization/services/translation.service";
import { AuthMiddleware } from "../../auth/middlewares/auth.middleware";
import {
  MandiCropController,
  MandiTraderController,
  MandiPriceController,
} from "../controllers/mandi-ops.controller";

export class MandiAdminRoutes {
  private readonly router = Router();
  private readonly masterDataController: MasterDataController;

  constructor(
    private readonly adminController: MandiAdminController,
    private readonly cropController: MandiCropController,
    private readonly traderController: MandiTraderController,
    private readonly priceController: MandiPriceController,
    private readonly productAdminController?: ProductAdminController,
    private readonly locationController?: LocationController,
    private readonly translationService?: TranslationService,
  ) {
    this.masterDataController = new MasterDataController(this.translationService);
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // Price updates are audited through req.auth.userId and must never be
    // exposed as anonymous writes.
    this.router.use(AuthMiddleware.ensureAuthenticated);
    this.router.use((req: Request, res: Response, next: NextFunction) => {
      const auth = (req as any).auth;
      if (!auth?.isRoot && auth?.userType !== "admin") {
        res.status(403).json({ success: false, message: "Admin access is required" });
        return;
      }
      next();
    });

    // Platform reference data. These routes must precede /:id.
    this.router.get("/master-data/:type", this.masterDataController.list);
    this.router.post("/master-data/:type", this.masterDataController.create);
    this.router.patch("/master-data/:type/:id", this.masterDataController.update);
    this.router.delete("/master-data/:type/:id", this.masterDataController.remove);
    // ---- Mandi CRUD ----
    this.router.get("/", this.adminController.listMandis);
    this.router.post("/", this.adminController.createMandi);

    // ---- Global Product management ----
    if (this.productAdminController) {
      const p = this.productAdminController;

      // Core product CRUD
      this.router.get("/products/global",              p.getCrops);
      this.router.post("/products/global",             p.createCrop);
      this.router.get("/products/global/:id",          p.getCrop);
      this.router.patch("/products/global/:id",        p.updateCrop);

      // Classifications
      this.router.get("/products/global/:id/classifications",              p.getClassifications);
      this.router.post("/products/global/:id/classifications",             p.addClassification);
      this.router.patch("/products/global/:id/classifications/:cId",      p.updateClassification);
      this.router.delete("/products/global/:id/classifications/:cId",     p.deleteClassification);

      // Variants
      this.router.post("/products/global/:id/classifications/:cId/variants",          p.addVariant);
      this.router.patch("/products/global/:id/classifications/:cId/variants/:vId",    p.updateVariant);
      this.router.delete("/products/global/:id/classifications/:cId/variants/:vId",   p.deleteVariant);

      // Aliases
      this.router.put("/products/global/:id/aliases",      p.setAliases);

      // Mandi assignments
      this.router.get("/products/global/:id/mandis",       p.getMandis);
      this.router.put("/products/global/:id/mandis",       p.setMandis);

      // Translations
      this.router.put("/products/global/:id/translations", p.setTranslations);
    }


    // ---- Locations management ----
    if (this.locationController) {
      this.router.get("/locations/states", this.locationController.getStates);
      this.router.post("/locations/states", this.locationController.createState);
      this.router.patch("/locations/states/:id", this.locationController.updateState);
      this.router.delete("/locations/states/:id", this.locationController.deleteState);
      
      this.router.get("/locations/districts", this.locationController.getDistricts);
      this.router.post("/locations/districts", this.locationController.createDistrict);
      this.router.patch("/locations/districts/:id", this.locationController.updateDistrict);
      this.router.delete("/locations/districts/:id", this.locationController.deleteDistrict);
    }

    // ---- Verified trader registry ----
    this.router.get("/traders", this.traderController.listAllTraders);
    this.router.post("/traders", this.traderController.createTrader);
    this.router.patch("/traders/:traderId", this.traderController.updateTrader);

    // ---- Mandi Dynamic Routes ----
    this.router.get("/:id", this.adminController.getMandi);
    this.router.patch("/:id", this.adminController.updateMandi);
    this.router.patch("/:id/status", this.adminController.setStatus);
    this.router.post("/:id/duplicate", this.adminController.duplicateMandi);


    // ---- Mandi Product management ----
    this.router.get("/:id/products", this.cropController.getCrops);
    this.router.put("/:id/products", this.cropController.toggleCrop);
    this.router.put("/:id/products/bulk", this.cropController.bulkToggleCrops);
    this.router.post("/products/bulk-assign", this.cropController.bulkAssignCrops);

    // ---- Trader management ----
    this.router.get("/:id/traders", this.traderController.getTraders);
    this.router.post("/:id/traders", this.traderController.assignTrader);
    this.router.delete("/:id/traders/:traderId", this.traderController.removeTrader);
    this.router.post("/traders/:traderId/transfer", this.traderController.transferTrader);

    // ---- Official prices ----
    this.router.get("/:id/official-prices", this.priceController.getOfficialPrices);
    this.router.put("/:id/official-prices", this.priceController.upsertOfficialPrice);
    this.router.post("/:id/official-prices/import", this.priceController.upsertOfficialPrices);
    this.router.post("/prices/copy", this.priceController.copyPrices);

    // ---- Trader Prices ----
    this.router.get("/:id/products/:productId/prices", this.priceController.getPricesForCrop);
    this.router.put("/:id/products/:productId/prices", this.priceController.updatePricesForCrop);
  }

  public getRouter(): Router {
    return this.router;
  }
}
