import { SmsContractAdapter } from "./contracts";
import { SmsController } from "./controllers/sms.controller";
import { SmsRoutes } from "./routes/sms.routes";
import { SmsService } from "./services/sms.service";
export class SmsModule {
    smsService = new SmsService();
    smsController = new SmsController(this.smsService);
    smsRoutes = new SmsRoutes(this.smsController);
    smsContract = new SmsContractAdapter(this.smsService);
    getRouter() {
        return this.smsRoutes.getRouter();
    }
    getService() {
        return this.smsService;
    }
    getContract() {
        return this.smsContract;
    }
}
