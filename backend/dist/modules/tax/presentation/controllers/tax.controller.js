import { AppError } from "../../../../shared/errors/app.error";
import { ApiErrorHandler } from "../../../../shared/http/api-error";
import { ApiResponse } from "../../../../shared/http/api-response";
export class TaxController {
    repository;
    createTaxRuleUseCase;
    updateTaxRuleUseCase;
    deactivateTaxRuleUseCase;
    calculateTaxUseCase;
    estimateTaxUseCase;
    validateTaxProfileUseCase;
    assignTaxProfileUseCase;
    getTaxBreakdownUseCase;
    constructor(repository, createTaxRuleUseCase, updateTaxRuleUseCase, deactivateTaxRuleUseCase, calculateTaxUseCase, estimateTaxUseCase, validateTaxProfileUseCase, assignTaxProfileUseCase, getTaxBreakdownUseCase) {
        this.repository = repository;
        this.createTaxRuleUseCase = createTaxRuleUseCase;
        this.updateTaxRuleUseCase = updateTaxRuleUseCase;
        this.deactivateTaxRuleUseCase = deactivateTaxRuleUseCase;
        this.calculateTaxUseCase = calculateTaxUseCase;
        this.estimateTaxUseCase = estimateTaxUseCase;
        this.validateTaxProfileUseCase = validateTaxProfileUseCase;
        this.assignTaxProfileUseCase = assignTaxProfileUseCase;
        this.getTaxBreakdownUseCase = getTaxBreakdownUseCase;
    }
    createRule = async (request, response, next) => {
        try {
            ApiResponse.created(response, await this.createTaxRuleUseCase.execute(request.body, this.context(request)), "Tax rule created");
        }
        catch (error) {
            await ApiErrorHandler.handle(error, response, next, "tax");
        }
    };
    listRules = async (request, response, next) => {
        try {
            ApiResponse.ok(response, await this.repository.listRules(this.companyId(request), request.query), "Tax rules loaded");
        }
        catch (error) {
            await ApiErrorHandler.handle(error, response, next, "tax");
        }
    };
    updateRule = async (request, response, next) => {
        try {
            ApiResponse.ok(response, await this.updateTaxRuleUseCase.execute(String(request.params.id), request.body, this.context(request)), "Tax rule updated");
        }
        catch (error) {
            await ApiErrorHandler.handle(error, response, next, "tax");
        }
    };
    deactivateRule = async (request, response, next) => {
        try {
            ApiResponse.ok(response, await this.deactivateTaxRuleUseCase.execute(String(request.params.id), this.context(request)), "Tax rule deactivated");
        }
        catch (error) {
            await ApiErrorHandler.handle(error, response, next, "tax");
        }
    };
    calculate = async (request, response, next) => {
        try {
            ApiResponse.created(response, await this.calculateTaxUseCase.execute(request.body, this.context(request)), "Tax calculated");
        }
        catch (error) {
            await ApiErrorHandler.handle(error, response, next, "tax");
        }
    };
    estimate = async (request, response, next) => {
        try {
            ApiResponse.ok(response, await this.estimateTaxUseCase.execute(request.body, this.context(request)), "Tax estimated");
        }
        catch (error) {
            await ApiErrorHandler.handle(error, response, next, "tax");
        }
    };
    assignProfile = async (request, response, next) => {
        try {
            ApiResponse.ok(response, await this.assignTaxProfileUseCase.execute(request.body, this.context(request)), "Tax profile assigned");
        }
        catch (error) {
            await ApiErrorHandler.handle(error, response, next, "tax");
        }
    };
    validateProfile = async (request, response, next) => {
        try {
            ApiResponse.ok(response, await this.validateTaxProfileUseCase.execute(request.body.ownerType, request.body.ownerId, this.context(request)), "Tax profile validated");
        }
        catch (error) {
            await ApiErrorHandler.handle(error, response, next, "tax");
        }
    };
    getBreakdown = async (request, response, next) => {
        try {
            ApiResponse.ok(response, await this.getTaxBreakdownUseCase.execute(String(request.params.id), this.context(request)), "Tax breakdown loaded");
        }
        catch (error) {
            await ApiErrorHandler.handle(error, response, next, "tax");
        }
    };
    context(request) {
        return {
            companyId: this.companyId(request),
            organizationId: typeof request.body?.organizationId === "string" ? request.body.organizationId : undefined,
            userId: request.securityContext?.userId ?? null,
            requestId: request.requestId,
            correlationId: request.headers["x-correlation-id"]?.toString(),
            ipAddress: request.ip,
            userAgent: request.headers["user-agent"]?.toString(),
        };
    }
    companyId(request) {
        const companyId = request.securityContext?.companyId;
        if (!companyId) {
            throw new AppError("Company context required", 400, "COMPANY_CONTEXT_REQUIRED");
        }
        return companyId;
    }
}
