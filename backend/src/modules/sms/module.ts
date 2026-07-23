import { Router } from "express";
import { SmsContract, SmsContractAdapter } from "./contracts";
import { SmsController } from "./controllers/sms.controller";
import { SmsRoutes } from "./routes/sms.routes";
import { SmsService } from "./services/sms.service";

export class SmsModule {
  private readonly smsService = new SmsService();
  private readonly smsController = new SmsController(this.smsService);
  private readonly smsRoutes = new SmsRoutes(this.smsController);
  private readonly smsContract = new SmsContractAdapter(this.smsService);

  public getRouter(): Router {
    return this.smsRoutes.getRouter();
  }

  public getService(): SmsService {
    return this.smsService;
  }

  public getContract(): SmsContract {
    return this.smsContract;
  }
}
