import { AssignTaxProfileUseCase, CalculateTaxUseCase, CreateTaxRuleUseCase, DeactivateTaxRuleUseCase, EstimateTaxUseCase, GetTaxBreakdownUseCase, UpdateTaxRuleUseCase, ValidateTaxProfileUseCase, } from "./application";
import { TaxEngineContractAdapter } from "./contracts";
import { TaxEventPublisher } from "./events";
import { TaxRepository } from "./infrastructure/repositories";
import { TaxController, TaxRoutes } from "./presentation";
export class TaxModule {
    repository = new TaxRepository();
    events = new TaxEventPublisher();
    calculateTaxUseCase = new CalculateTaxUseCase(this.repository, this.events);
    estimateTaxUseCase = new EstimateTaxUseCase(this.calculateTaxUseCase);
    controller = new TaxController(this.repository, new CreateTaxRuleUseCase(this.repository, this.events), new UpdateTaxRuleUseCase(this.repository, this.events), new DeactivateTaxRuleUseCase(this.repository, this.events), this.calculateTaxUseCase, this.estimateTaxUseCase, new ValidateTaxProfileUseCase(this.repository), new AssignTaxProfileUseCase(this.repository, this.events), new GetTaxBreakdownUseCase(this.repository));
    routes = new TaxRoutes(this.controller);
    contract = new TaxEngineContractAdapter(this.calculateTaxUseCase, this.estimateTaxUseCase);
    getRouter() {
        return this.routes.getRouter();
    }
    getContract() {
        return this.contract;
    }
}
