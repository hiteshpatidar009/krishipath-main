import { Router } from "express";
import { EmailContract, EmailContractAdapter } from "./contracts";
import { EmailController } from "./controllers/email.controller";
import { EmailRoutes } from "./routes/email.routes";
import { EmailService } from "./services/email.service";

export class EmailModule {
  private readonly emailService = new EmailService();
  private readonly emailController = new EmailController(this.emailService);
  private readonly emailRoutes = new EmailRoutes(this.emailController);
  private readonly emailContract = new EmailContractAdapter(this.emailService);

  public getRouter(): Router {
    return this.emailRoutes.getRouter();
  }

  public getService(): EmailService {
    return this.emailService;
  }

  public getContract(): EmailContract {
    return this.emailContract;
  }
}
