import { EmailContractAdapter } from "./contracts";
import { EmailController } from "./controllers/email.controller";
import { EmailRoutes } from "./routes/email.routes";
import { EmailService } from "./services/email.service";
export class EmailModule {
    emailService = new EmailService();
    emailController = new EmailController(this.emailService);
    emailRoutes = new EmailRoutes(this.emailController);
    emailContract = new EmailContractAdapter(this.emailService);
    getRouter() {
        return this.emailRoutes.getRouter();
    }
    getService() {
        return this.emailService;
    }
    getContract() {
        return this.emailContract;
    }
}
