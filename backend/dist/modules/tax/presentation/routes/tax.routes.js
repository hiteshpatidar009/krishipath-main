import { Router } from "express";
import { PermGuard, IdempotencyMiddleware, SchemaValidationMiddleware, SharedAuthMiddleware, CompanyGuard } from "../../../../shared/security";
import { TaxPermission } from "../../constants/tax.constants";
import { TaxAntiTamperMiddleware } from "../middlewares";
import { assignTaxProfileSchema, calculateTaxSchema, createTaxRuleSchema, listTaxRulesSchema, taxIdParamSchema, updateTaxRuleSchema, validateTaxProfileSchema, } from "../validators/tax.validator";
export class TaxRoutes {
    controller;
    router = Router();
    constructor(controller) {
        this.controller = controller;
        this.register();
    }
    getRouter() {
        return this.router;
    }
    register() {
        this.router.use(SharedAuthMiddleware.use, CompanyGuard.requireCompany);
        this.router.post("/rules", PermGuard.require(TaxPermission.RuleCreate), TaxAntiTamperMiddleware.use, IdempotencyMiddleware.requireForMutations(), SchemaValidationMiddleware.validate(createTaxRuleSchema), this.controller.createRule);
        this.router.get("/rules", PermGuard.require(TaxPermission.RuleRead), SchemaValidationMiddleware.validate(listTaxRulesSchema, "query"), this.controller.listRules);
        this.router.patch("/rules/:id", PermGuard.require(TaxPermission.RuleUpdate), IdempotencyMiddleware.requireForMutations(), SchemaValidationMiddleware.validate(taxIdParamSchema, "params"), SchemaValidationMiddleware.validate(updateTaxRuleSchema), this.controller.updateRule);
        this.router.post("/rules/:id/deactivate", PermGuard.require(TaxPermission.RuleDeactivate), IdempotencyMiddleware.requireForMutations(), SchemaValidationMiddleware.validate(taxIdParamSchema, "params"), this.controller.deactivateRule);
        this.router.post("/calculate", PermGuard.require(TaxPermission.Calculate), TaxAntiTamperMiddleware.use, SchemaValidationMiddleware.validate(calculateTaxSchema), this.controller.calculate);
        this.router.post("/estimate", PermGuard.require(TaxPermission.Calculate), SchemaValidationMiddleware.validate(calculateTaxSchema), this.controller.estimate);
        this.router.post("/profiles/assign", PermGuard.require(TaxPermission.ProfileUpdate), IdempotencyMiddleware.requireForMutations(), SchemaValidationMiddleware.validate(assignTaxProfileSchema), this.controller.assignProfile);
        this.router.post("/profiles/validate", PermGuard.require(TaxPermission.ProfileRead), SchemaValidationMiddleware.validate(validateTaxProfileSchema), this.controller.validateProfile);
        this.router.get("/calculations/:id/breakdown", PermGuard.require(TaxPermission.SnapshotRead), SchemaValidationMiddleware.validate(taxIdParamSchema, "params"), this.controller.getBreakdown);
    }
}
