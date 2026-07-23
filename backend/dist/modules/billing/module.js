import { BillingController } from "./controllers/billing.controller";
import { BillingRepository } from "./repositories/billing.repository";
import { BillingRoutes } from "./routes/billing.routes";
import { BillingIntegrationService } from "./services/billing-integration.service";
import { BillingRetrySchedulerService } from "./services/retry-scheduler.service";
import { BillingService } from "./services/billing.service";
import { DunningService } from "./services/dunning.service";
import { StripePaymentGatewayService } from "./services/stripe-payment-gateway.service";
import { TaxModule } from "../tax/module";
export class BillingModule {
    repository = new BillingRepository();
    integrations = new BillingIntegrationService();
    paymentGateway = new StripePaymentGatewayService();
    taxModule = new TaxModule();
    dunningService = new DunningService(this.repository, this.integrations);
    retryScheduler = new BillingRetrySchedulerService(this.repository, this.paymentGateway, this.dunningService);
    service = new BillingService(this.repository, this.integrations, this.paymentGateway, this.dunningService, this.taxModule.getContract());
    controller = new BillingController(this.service);
    routes = new BillingRoutes(this.controller);
    getRouter() {
        return this.routes.getRouter();
    }
    getRetryScheduler() {
        return this.retryScheduler;
    }
}
