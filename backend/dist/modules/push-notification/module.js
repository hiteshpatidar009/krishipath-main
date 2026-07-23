import { PushNotificationContractAdapter, } from "./contracts";
import { PushController } from "./controllers/push.controller";
import { PushRoutes } from "./routes/push.routes";
import { PushService } from "./services/push.service";
export class PushNotificationModule {
    pushService = new PushService();
    pushController = new PushController(this.pushService);
    pushRoutes = new PushRoutes(this.pushController);
    pushContract = new PushNotificationContractAdapter(this.pushService);
    getRouter() {
        return this.pushRoutes.getRouter();
    }
    getService() {
        return this.pushService;
    }
    getContract() {
        return this.pushContract;
    }
}
