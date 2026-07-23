import { Router } from "express";
import { EmailModule } from "../email/module";
import { PushNotificationModule } from "../push-notification/module";
import { SmsModule } from "../sms/module";
import { NotificationContract, NotificationContractAdapter } from "./contracts";
import { NotificationController } from "./controllers/notification.controller";
import { NotificationRepository } from "./repositories/notification.repository";
import { NotificationRoutes } from "./routes/notification.routes";
import { NotificationDispatchService } from "./services/notification-dispatch.service";
import { NotificationService } from "./services/notification.service";

export class NotificationModule {
  private readonly emailModule = new EmailModule();
  private readonly smsModule = new SmsModule();
  private readonly pushNotificationModule = new PushNotificationModule();
  private readonly notificationRepository = new NotificationRepository();
  private readonly notificationDispatchService = new NotificationDispatchService(
    this.emailModule.getService(),
    this.smsModule.getService(),
    this.pushNotificationModule.getService(),
  );
  private readonly notificationService = new NotificationService(
    this.notificationRepository,
    this.notificationDispatchService,
  );
  private readonly notificationController = new NotificationController(this.notificationService);
  private readonly notificationRoutes = new NotificationRoutes(this.notificationController);
  private readonly notificationContract = new NotificationContractAdapter(
    this.notificationService,
  );

  public getRouter(): Router {
    return this.notificationRoutes.getRouter();
  }

  public getService(): NotificationService {
    return this.notificationService;
  }

  public getContract(): NotificationContract {
    return this.notificationContract;
  }
}
