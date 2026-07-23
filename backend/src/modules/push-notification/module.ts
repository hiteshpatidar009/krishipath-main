import { Router } from "express";
import {
  PushNotificationContract,
  PushNotificationContractAdapter,
} from "./contracts";
import { PushController } from "./controllers/push.controller";
import { PushRoutes } from "./routes/push.routes";
import { PushService } from "./services/push.service";

export class PushNotificationModule {
  private readonly pushService = new PushService();
  private readonly pushController = new PushController(this.pushService);
  private readonly pushRoutes = new PushRoutes(this.pushController);
  private readonly pushContract = new PushNotificationContractAdapter(
    this.pushService,
  );

  public getRouter(): Router {
    return this.pushRoutes.getRouter();
  }

  public getService(): PushService {
    return this.pushService;
  }

  public getContract(): PushNotificationContract {
    return this.pushContract;
  }
}
