import { SubscriptionService } from "./application/subscription.service";
import { SubscriptionRepository } from "./infrastructure/subscription.repository";
import { SubscriptionController } from "./presentation/subscription.controller";
import { SubscriptionRoutes } from "./presentation/subscription.routes";
export class SubscriptionModule {
    repo = new SubscriptionRepository();
    service = new SubscriptionService(this.repo);
    controller = new SubscriptionController(this.service);
    routes = new SubscriptionRoutes(this.controller);
    getRouter() {
        return this.routes.getRouter();
    }
}
