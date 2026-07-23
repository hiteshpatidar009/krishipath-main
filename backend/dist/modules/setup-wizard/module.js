import { SetupWizardService } from "./application/setup-wizard.service";
import { SetupWizardRepository } from "./infrastructure/setup-wizard.repository";
import { SetupWizardController } from "./presentation/setup-wizard.controller";
import { SetupWizardRoutes } from "./presentation/setup-wizard.routes";
export class SetupWizardModule {
    routes = new SetupWizardRoutes(new SetupWizardController(new SetupWizardService(new SetupWizardRepository())));
    getRouter() {
        return this.routes.getRouter();
    }
}
