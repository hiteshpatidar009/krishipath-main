import { Router } from "express";
import { MarketSourceController } from "./market-source.controller";
import { SharedAuthMiddleware } from "../../shared/security/middlewares/auth.middleware";

export class MarketSourceRoutes {
  private readonly router: Router;

  constructor(private readonly controller: MarketSourceController) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // We can add RequirePermissionMiddleware here as well if needed
    // e.g., RequirePermissionMiddleware.use("market-source:view")
    this.router.get(
      "/",
      SharedAuthMiddleware.use,
      this.controller.getMarketSources
    );

    this.router.post(
      "/",
      SharedAuthMiddleware.use,
      this.controller.createMarketSource
    );

    this.router.get(
      "/:id",
      SharedAuthMiddleware.use,
      this.controller.getMarketSourceById
    );

    this.router.patch(
      "/:id",
      SharedAuthMiddleware.use,
      this.controller.updateMarketSource
    );

    this.router.get(
      "/:id/messages",
      SharedAuthMiddleware.use,
      this.controller.getMarketSourceMessages
    );

    this.router.post(
      "/:id/prices",
      SharedAuthMiddleware.use,
      this.controller.submitMarketSourcePrices
    );

    this.router.get(
      "/:id/price-history",
      SharedAuthMiddleware.use,
      this.controller.getMarketSourcePriceHistory
    );

    this.router.post(
      "/:id/messages/:msgId/parse",
      SharedAuthMiddleware.use,
      this.controller.parseMessage
    );

    this.router.post(
      "/webhook",
      this.controller.handleIncomingWebhook
    );

    this.router.patch(
      "/:id/parser-profile",
      SharedAuthMiddleware.use,
      this.controller.updateParserProfile
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
