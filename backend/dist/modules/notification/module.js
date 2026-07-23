import { EmailModule } from "../email/module";
import { PushNotificationModule } from "../push-notification/module";
import { SmsModule } from "../sms/module";
import { NotificationContractAdapter } from "./contracts";
import { NotificationController } from "./controllers/notification.controller";
import { NotificationRepository } from "./repositories/notification.repository";
import { NotificationRoutes } from "./routes/notification.routes";
import { NotificationDispatchService } from "./services/notification-dispatch.service";
import { NotificationService } from "./services/notification.service";
export class NotificationModule {
    emailModule = new EmailModule();
    smsModule = new SmsModule();
    pushNotificationModule = new PushNotificationModule();
    notificationRepository = new NotificationRepository();
    notificationDispatchService = new NotificationDispatchService(this.emailModule.getService(), this.smsModule.getService(), this.pushNotificationModule.getService());
    notificationService = new NotificationService(this.notificationRepository, this.notificationDispatchService);
    notificationController = new NotificationController(this.notificationService);
    notificationRoutes = new NotificationRoutes(this.notificationController);
    notificationContract = new NotificationContractAdapter(this.notificationService);
    getRouter() {
        return this.notificationRoutes.getRouter();
    }
    getService() {
        return this.notificationService;
    }
    getContract() {
        return this.notificationContract;
    }
}
