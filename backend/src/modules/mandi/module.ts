import { Router } from "express";

// Repositories
import { MandiRepository } from "./repositories/mandi.repository";
import { PriceRepository } from "./repositories/price.repository";
import { MandiAdminRepository } from "./repositories/mandi-admin.repository";
import { MandiProductRepository } from "./repositories/mandi-product.repository";
import { MandiTraderRepository } from "./repositories/mandi-trader.repository";
import { MandiPriceRepository } from "./repositories/mandi-price.repository";
import { ProductRepository } from "./repositories/product.repository";
import { ProductExtrasRepository } from "./repositories/product-extras.repository";
import { LocationRepository } from "./repositories/location.repository";
import { TraderPriceRepository } from "./repositories/trader-price.repository";

// Services
import { MandiService } from "./services/mandi.service";
import { MandiAdminService } from "./services/mandi-admin.service";
import { MandiProductService } from "./services/mandi-product.service";
import { MandiTraderService } from "./services/mandi-trader.service";
import { MandiPriceService } from "./services/mandi-price.service";
import { MandiPublicService } from "./services/mandi-public.service";
import { ProductAdminService } from "./services/product-admin.service";
import { LocationService } from "./services/location.service";

// Controllers
import { MandiController } from "./controllers/mandi.controller";
import { MandiAdminController } from "./controllers/mandi-admin.controller";
import {
  MandiCropController,
  MandiTraderController,
  MandiPriceController,
} from "./controllers/mandi-ops.controller";
import { ProductAdminController } from "./controllers/product-admin.controller";
import { LocationController } from "./controllers/location.controller";

// Routes
import { MandiRoutes } from "./routes/mandi.routes";
import { MandiAdminRoutes } from "./routes/mandi-admin.routes";

// Events
import { MandiPriceUpdatedHandler } from "./events/mandi-price-updated.handler";

// Infrastructure
import { RedisService } from "../../infrastructure/database/redis/redis.service";
import { TranslationService } from "../localization/services/translation.service";
import { LocalizedResponseBuilder } from "../../shared/localization/localized-response.builder";
import { MarketInsightRepository } from "../market-insight/repositories/market-insight.repository";

export class MandiModule {
  // Repositories
  private readonly mandiRepository: MandiRepository;
  private readonly priceRepository: PriceRepository;
  private readonly mandiAdminRepository: MandiAdminRepository;
  private readonly mandiCropRepository: MandiProductRepository;
  private readonly mandiTraderRepository: MandiTraderRepository;
  private readonly mandiPriceRepository: MandiPriceRepository;
  private readonly cropRepository: ProductRepository;
  private readonly cropExtrasRepository: ProductExtrasRepository;
  private readonly locationRepository: LocationRepository;
  private readonly traderPriceRepository: TraderPriceRepository;
  private readonly marketInsightRepository: MarketInsightRepository;

  // Services
  private readonly redisService: RedisService;
  private readonly localizedBuilder: LocalizedResponseBuilder;
  private readonly mandiService: MandiService;
  private readonly mandiAdminService: MandiAdminService;
  private readonly mandiProductService: MandiProductService;
  private readonly mandiTraderService: MandiTraderService;
  private readonly mandiPriceService: MandiPriceService;
  private readonly productAdminService: ProductAdminService;
  private readonly locationService: LocationService;
  private readonly mandiPublicService: MandiPublicService;

  // Controllers
  private readonly mandiController: MandiController;
  private readonly mandiAdminController: MandiAdminController;
  private readonly mandiCropController: MandiCropController;
  private readonly mandiTraderController: MandiTraderController;
  private readonly mandiPriceController: MandiPriceController;
  private readonly productAdminController: ProductAdminController;
  private readonly locationController: LocationController;

  // Routes
  private readonly mandiRoutes: MandiRoutes;
  private readonly mandiAdminRoutes: MandiAdminRoutes;

  // Events
  public readonly mandiPriceUpdatedHandler: MandiPriceUpdatedHandler;

  constructor(translationService: TranslationService) {
    // Infrastructure
    this.redisService = new RedisService();
    this.localizedBuilder = new LocalizedResponseBuilder(translationService);

    // Repositories
    this.mandiRepository = new MandiRepository();
    this.priceRepository = new PriceRepository();
    this.mandiAdminRepository = new MandiAdminRepository();
    this.mandiCropRepository = new MandiProductRepository();
    this.mandiTraderRepository = new MandiTraderRepository();
    this.mandiPriceRepository = new MandiPriceRepository();
    this.cropRepository = new ProductRepository();
    this.cropExtrasRepository = new ProductExtrasRepository();
    this.locationRepository = new LocationRepository();
    this.traderPriceRepository = new TraderPriceRepository();
    this.marketInsightRepository = new MarketInsightRepository();

    // Services
    this.mandiService = new MandiService(
      this.mandiRepository,
      this.priceRepository,
      this.redisService,
      this.localizedBuilder,
    );
    this.mandiAdminService = new MandiAdminService(
      this.mandiAdminRepository,
      this.mandiCropRepository,
      this.mandiPriceRepository,
      this.redisService,
      this.localizedBuilder,
      translationService,
    );
    this.mandiProductService = new MandiProductService(
      this.mandiCropRepository,
      this.mandiAdminRepository,
      this.localizedBuilder,
    );
    this.mandiTraderService = new MandiTraderService(
      this.mandiTraderRepository,
      this.mandiAdminRepository,
    );
    this.mandiPriceService = new MandiPriceService(
      this.mandiPriceRepository,
      this.mandiAdminRepository,
      this.mandiTraderRepository,
      this.traderPriceRepository,
      this.priceRepository,
    );
    this.productAdminService = new ProductAdminService(
      this.cropRepository,
      this.cropExtrasRepository,
      this.localizedBuilder,
      translationService,
    );
    this.locationService = new LocationService(this.locationRepository);
    this.mandiPublicService = new MandiPublicService(
      this.mandiRepository,
      this.mandiCropRepository,
      this.mandiPriceRepository,
      this.cropExtrasRepository,
      this.traderPriceRepository,
      this.marketInsightRepository,
    );

    // Controllers
    this.mandiController = new MandiController(
      this.mandiService,
      this.mandiPriceService,
      this.mandiProductService,
      this.mandiPublicService,
    );
    this.mandiAdminController = new MandiAdminController(this.mandiAdminService);
    this.mandiCropController = new MandiCropController(this.mandiProductService);
    this.mandiTraderController = new MandiTraderController(this.mandiTraderService);
    this.mandiPriceController = new MandiPriceController(this.mandiPriceService);
    this.productAdminController = new ProductAdminController(this.productAdminService);
    this.locationController = new LocationController(this.locationService);

    // Routes
    this.mandiRoutes = new MandiRoutes(this.mandiController);
    this.mandiAdminRoutes = new MandiAdminRoutes(
      this.mandiAdminController,
      this.mandiCropController,
      this.mandiTraderController,
      this.mandiPriceController,
      this.productAdminController,
      this.locationController,
      translationService,
    );

    // Events
    this.mandiPriceUpdatedHandler = new MandiPriceUpdatedHandler(this.mandiService);
  }

  /** Public-facing mandi routes (farmer app) */
  public getRouter(): Router {
    return this.mandiRoutes.getRouter();
  }

  /** Admin mandi routes */
  public getAdminRouter(): Router {
    return this.mandiAdminRoutes.getRouter();
  }
}
