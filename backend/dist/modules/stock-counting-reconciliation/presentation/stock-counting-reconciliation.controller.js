import { RequestContext } from "../../../shared/context/request-context";
import { ApiResponse } from "../../../shared/http/api-response";
import { StockCountingReconciliationValidator } from "./stock-counting-reconciliation.validator";
export class StockCountingReconciliationController {
    createSessionUseCase;
    startSessionUseCase;
    recordCountUseCase;
    completeSessionUseCase;
    approveSessionUseCase;
    listSessionsUseCase;
    listDiscrepanciesUseCase;
    getReconciliationUseCase;
    finalizeReconciliationUseCase;
    autoMatchUseCase;
    proposeAdjustmentsUseCase;
    createStockTakePlanUseCase;
    updateStockTakePlanUseCase;
    getStockTakePlanUseCase;
    listStockTakePlansUseCase;
    scheduleStockTakePlanUseCase;
    startStockTakePlanUseCase;
    pauseStockTakePlanUseCase;
    resumeStockTakePlanUseCase;
    completeStockTakePlanUseCase;
    cancelStockTakePlanUseCase;
    lockInventoryUseCase;
    unlockInventoryUseCase;
    getInventoryLockStatusUseCase;
    getStockTakeDashboardUseCase;
    getCoverageSummaryUseCase;
    submitForApprovalUseCase;
    approvePlanUseCase;
    rejectPlanUseCase;
    exportStockTakePlansUseCase;
    extendDeadlineUseCase;
    reassignTeamUseCase;
    getPlanProgressUseCase;
    getPlanVariancesUseCase;
    getTeamPerformanceUseCase;
    getActivityLogUseCase;
    exportCountSheetsUseCase;
    printCountSheetsUseCase;
    downloadVarianceReportUseCase;
    constructor(createSessionUseCase, startSessionUseCase, recordCountUseCase, completeSessionUseCase, approveSessionUseCase, listSessionsUseCase, listDiscrepanciesUseCase, getReconciliationUseCase, finalizeReconciliationUseCase, autoMatchUseCase, proposeAdjustmentsUseCase, 
    // Stock Take use cases
    createStockTakePlanUseCase, updateStockTakePlanUseCase, getStockTakePlanUseCase, listStockTakePlansUseCase, scheduleStockTakePlanUseCase, startStockTakePlanUseCase, pauseStockTakePlanUseCase, resumeStockTakePlanUseCase, completeStockTakePlanUseCase, cancelStockTakePlanUseCase, lockInventoryUseCase, unlockInventoryUseCase, getInventoryLockStatusUseCase, getStockTakeDashboardUseCase, getCoverageSummaryUseCase, submitForApprovalUseCase, approvePlanUseCase, rejectPlanUseCase, exportStockTakePlansUseCase, extendDeadlineUseCase, reassignTeamUseCase, getPlanProgressUseCase, getPlanVariancesUseCase, getTeamPerformanceUseCase, getActivityLogUseCase, exportCountSheetsUseCase, printCountSheetsUseCase, downloadVarianceReportUseCase) {
        this.createSessionUseCase = createSessionUseCase;
        this.startSessionUseCase = startSessionUseCase;
        this.recordCountUseCase = recordCountUseCase;
        this.completeSessionUseCase = completeSessionUseCase;
        this.approveSessionUseCase = approveSessionUseCase;
        this.listSessionsUseCase = listSessionsUseCase;
        this.listDiscrepanciesUseCase = listDiscrepanciesUseCase;
        this.getReconciliationUseCase = getReconciliationUseCase;
        this.finalizeReconciliationUseCase = finalizeReconciliationUseCase;
        this.autoMatchUseCase = autoMatchUseCase;
        this.proposeAdjustmentsUseCase = proposeAdjustmentsUseCase;
        this.createStockTakePlanUseCase = createStockTakePlanUseCase;
        this.updateStockTakePlanUseCase = updateStockTakePlanUseCase;
        this.getStockTakePlanUseCase = getStockTakePlanUseCase;
        this.listStockTakePlansUseCase = listStockTakePlansUseCase;
        this.scheduleStockTakePlanUseCase = scheduleStockTakePlanUseCase;
        this.startStockTakePlanUseCase = startStockTakePlanUseCase;
        this.pauseStockTakePlanUseCase = pauseStockTakePlanUseCase;
        this.resumeStockTakePlanUseCase = resumeStockTakePlanUseCase;
        this.completeStockTakePlanUseCase = completeStockTakePlanUseCase;
        this.cancelStockTakePlanUseCase = cancelStockTakePlanUseCase;
        this.lockInventoryUseCase = lockInventoryUseCase;
        this.unlockInventoryUseCase = unlockInventoryUseCase;
        this.getInventoryLockStatusUseCase = getInventoryLockStatusUseCase;
        this.getStockTakeDashboardUseCase = getStockTakeDashboardUseCase;
        this.getCoverageSummaryUseCase = getCoverageSummaryUseCase;
        this.submitForApprovalUseCase = submitForApprovalUseCase;
        this.approvePlanUseCase = approvePlanUseCase;
        this.rejectPlanUseCase = rejectPlanUseCase;
        this.exportStockTakePlansUseCase = exportStockTakePlansUseCase;
        this.extendDeadlineUseCase = extendDeadlineUseCase;
        this.reassignTeamUseCase = reassignTeamUseCase;
        this.getPlanProgressUseCase = getPlanProgressUseCase;
        this.getPlanVariancesUseCase = getPlanVariancesUseCase;
        this.getTeamPerformanceUseCase = getTeamPerformanceUseCase;
        this.getActivityLogUseCase = getActivityLogUseCase;
        this.exportCountSheetsUseCase = exportCountSheetsUseCase;
        this.printCountSheetsUseCase = printCountSheetsUseCase;
        this.downloadVarianceReportUseCase = downloadVarianceReportUseCase;
    }
    // ─── Legacy session handlers ──────────────────────────────────────────────────
    createSession = async (request, response) => {
        const dto = StockCountingReconciliationValidator.createSession.parse(request.body);
        ApiResponse.created(response, await this.createSessionUseCase.execute({
            ...dto,
            companyId: RequestContext.companyId(request),
            createdBy: RequestContext.userId(request),
        }), "Count session created");
    };
    startSession = this.sessionCommand("start");
    completeSession = this.sessionCommand("complete");
    approveSession = this.sessionCommand("approve");
    recordCount = async (request, response) => {
        const dto = StockCountingReconciliationValidator.recordCount.parse(request.body);
        ApiResponse.created(response, await this.recordCountUseCase.execute({
            ...dto,
            companyId: RequestContext.companyId(request),
            sessionId: String(request.params.sessionId),
            countedBy: RequestContext.userId(request),
        }), "Count recorded");
    };
    listSessions = async (request, response) => {
        const query = StockCountingReconciliationValidator.listSessions.parse(request.query);
        ApiResponse.ok(response, await this.listSessionsUseCase.execute({ ...query, companyId: RequestContext.companyId(request) }), "Count sessions loaded");
    };
    listDiscrepancies = async (request, response) => {
        const query = StockCountingReconciliationValidator.listDiscrepancies.parse(request.query);
        ApiResponse.ok(response, await this.listDiscrepanciesUseCase.execute({ ...query, companyId: RequestContext.companyId(request) }), "Discrepancies loaded");
    };
    getReconciliation = async (request, response) => {
        const companyId = RequestContext.companyId(request);
        const sessionId = String(request.params.sessionId);
        const result = await this.getReconciliationUseCase.execute(companyId, sessionId);
        if (!result) {
            ApiResponse.notFound(response, "Count session not found");
            return;
        }
        ApiResponse.ok(response, result, "Reconciliation details loaded");
    };
    autoMatch = async (request, response) => {
        const companyId = RequestContext.companyId(request);
        const sessionId = String(request.params.sessionId);
        ApiResponse.ok(response, await this.autoMatchUseCase.execute(companyId, sessionId), "Zero-variance lines matched");
    };
    proposeAdjustments = async (request, response) => {
        const companyId = RequestContext.companyId(request);
        const sessionId = String(request.params.sessionId);
        const actorId = RequestContext.userId(request);
        ApiResponse.ok(response, await this.proposeAdjustmentsUseCase.execute(companyId, sessionId, actorId), "Adjustments proposed");
    };
    finalizeReconciliation = async (request, response) => {
        const companyId = RequestContext.companyId(request);
        const sessionId = String(request.params.sessionId);
        const actorId = RequestContext.userId(request);
        ApiResponse.ok(response, await this.finalizeReconciliationUseCase.execute(companyId, sessionId, actorId), "Reconciliation finalized");
    };
    sessionCommand(type) {
        return async (request, response) => {
            const input = {
                companyId: RequestContext.companyId(request),
                actorId: RequestContext.userId(request),
                sessionId: String(request.params.sessionId),
            };
            const useCase = type === "start" ? this.startSessionUseCase
                : type === "complete" ? this.completeSessionUseCase
                    : this.approveSessionUseCase;
            ApiResponse.ok(response, await useCase.execute(input), `Count session ${type}ed`);
        };
    }
    // ─── Stock Take Plan handlers ─────────────────────────────────────────────────
    getStockTakeDashboard = async (request, response) => {
        const companyId = RequestContext.companyId(request);
        const warehouseId = String(request.query.warehouseId);
        if (!warehouseId || warehouseId === "undefined") {
            ApiResponse.badRequest(response, "warehouseId query parameter is required");
            return;
        }
        ApiResponse.ok(response, await this.getStockTakeDashboardUseCase.execute(warehouseId, companyId), "Stock take dashboard loaded");
    };
    listStockTakePlans = async (request, response) => {
        const query = StockCountingReconciliationValidator.listStockTakePlans.parse(request.query);
        ApiResponse.ok(response, await this.listStockTakePlansUseCase.execute({
            ...query,
            companyId: RequestContext.companyId(request),
        }), "Stock take plans loaded");
    };
    createStockTakePlan = async (request, response) => {
        const dto = StockCountingReconciliationValidator.createStockTakePlan.parse(request.body);
        const result = await this.createStockTakePlanUseCase.execute({
            ...dto,
            companyId: RequestContext.companyId(request),
            createdBy: RequestContext.userId(request),
        });
        ApiResponse.created(response, result, "Stock take plan created");
    };
    getStockTakePlan = async (request, response) => {
        const companyId = RequestContext.companyId(request);
        const planId = String(request.params.planId);
        const result = await this.getStockTakePlanUseCase.execute(planId, companyId);
        if (!result) {
            ApiResponse.notFound(response, "Stock take plan not found");
            return;
        }
        ApiResponse.ok(response, result, "Stock take plan loaded");
    };
    updateStockTakePlan = async (request, response) => {
        const dto = StockCountingReconciliationValidator.updateStockTakePlan.parse(request.body);
        const result = await this.updateStockTakePlanUseCase.execute(String(request.params.planId), RequestContext.companyId(request), dto, RequestContext.userId(request));
        ApiResponse.ok(response, result, "Stock take plan updated");
    };
    scheduleStockTakePlan = async (request, response) => {
        const result = await this.scheduleStockTakePlanUseCase.execute(String(request.params.planId), RequestContext.companyId(request), RequestContext.userId(request));
        ApiResponse.ok(response, result, "Stock take plan scheduled");
    };
    startStockTakePlan = async (request, response) => {
        const result = await this.startStockTakePlanUseCase.execute(String(request.params.planId), RequestContext.companyId(request), RequestContext.userId(request));
        ApiResponse.ok(response, result, "Stock take count started");
    };
    pauseStockTakePlan = async (request, response) => {
        const result = await this.pauseStockTakePlanUseCase.execute(String(request.params.planId), RequestContext.companyId(request), RequestContext.userId(request));
        ApiResponse.ok(response, result, "Stock take count paused");
    };
    resumeStockTakePlan = async (request, response) => {
        const result = await this.resumeStockTakePlanUseCase.execute(String(request.params.planId), RequestContext.companyId(request), RequestContext.userId(request));
        ApiResponse.ok(response, result, "Stock take count resumed");
    };
    completeStockTakePlan = async (request, response) => {
        const result = await this.completeStockTakePlanUseCase.execute(String(request.params.planId), RequestContext.companyId(request), RequestContext.userId(request));
        ApiResponse.ok(response, result, "Stock take count completed");
    };
    cancelStockTakePlan = async (request, response) => {
        const dto = StockCountingReconciliationValidator.cancelPlan.parse(request.body);
        const result = await this.cancelStockTakePlanUseCase.execute(String(request.params.planId), RequestContext.companyId(request), RequestContext.userId(request), dto.reason);
        ApiResponse.ok(response, result, "Stock take plan cancelled");
    };
    getInventoryLockStatus = async (request, response) => {
        const companyId = RequestContext.companyId(request);
        const warehouseId = String(request.query.warehouseId);
        if (!warehouseId || warehouseId === "undefined") {
            ApiResponse.badRequest(response, "warehouseId query parameter is required");
            return;
        }
        const lock = await this.getInventoryLockStatusUseCase.execute(warehouseId, companyId);
        ApiResponse.ok(response, { lock, isLocked: lock !== null }, "Inventory lock status loaded");
    };
    lockInventory = async (request, response) => {
        const dto = StockCountingReconciliationValidator.lockInventory.parse(request.body);
        const result = await this.lockInventoryUseCase.execute({
            ...dto,
            companyId: RequestContext.companyId(request),
            lockedBy: RequestContext.userId(request),
        });
        ApiResponse.created(response, result, "Inventory locked");
    };
    unlockInventory = async (request, response) => {
        const dto = StockCountingReconciliationValidator.unlockInventory.parse(request.body);
        const companyId = RequestContext.companyId(request);
        const actorId = RequestContext.userId(request);
        const warehouseId = String(request.query.warehouseId);
        if (!warehouseId || warehouseId === "undefined") {
            ApiResponse.badRequest(response, "warehouseId query parameter is required");
            return;
        }
        const result = await this.unlockInventoryUseCase.execute(warehouseId, companyId, dto.planId, actorId, dto.reason);
        ApiResponse.ok(response, result, "Inventory unlocked");
    };
    getCoverageSummary = async (request, response) => {
        const companyId = RequestContext.companyId(request);
        const planId = String(request.params.planId);
        const result = await this.getCoverageSummaryUseCase.execute(planId, companyId);
        ApiResponse.ok(response, result, "Coverage summary loaded");
    };
    submitForApproval = async (request, response) => {
        const result = await this.submitForApprovalUseCase.execute(String(request.params.planId), RequestContext.companyId(request), RequestContext.userId(request));
        ApiResponse.ok(response, result, "Plan submitted for approval");
    };
    approvePlan = async (request, response) => {
        const dto = StockCountingReconciliationValidator.approveRejectPlan.parse(request.body);
        const result = await this.approvePlanUseCase.execute(String(request.params.planId), RequestContext.companyId(request), RequestContext.userId(request), dto.notes);
        ApiResponse.ok(response, result, "Plan approved");
    };
    rejectPlan = async (request, response) => {
        const dto = StockCountingReconciliationValidator.approveRejectPlan.parse(request.body);
        const result = await this.rejectPlanUseCase.execute(String(request.params.planId), RequestContext.companyId(request), RequestContext.userId(request), dto.notes);
        ApiResponse.ok(response, result, "Plan rejected");
    };
    exportStockTakePlans = async (request, response) => {
        const query = StockCountingReconciliationValidator.listStockTakePlans.parse(request.query);
        const data = await this.exportStockTakePlansUseCase.execute({
            ...query,
            companyId: RequestContext.companyId(request),
        });
        ApiResponse.ok(response, { records: data, total: data.length }, "Stock take plans exported");
    };
    extendDeadline = async (request, response) => {
        const dto = StockCountingReconciliationValidator.extendDeadline.parse(request.body);
        const result = await this.extendDeadlineUseCase.execute(String(request.params.planId), RequestContext.companyId(request), dto, RequestContext.userId(request));
        ApiResponse.ok(response, result, "Stock take deadline extended");
    };
    reassignTeam = async (request, response) => {
        const dto = StockCountingReconciliationValidator.reassignTeam.parse(request.body);
        const result = await this.reassignTeamUseCase.execute(String(request.params.planId), RequestContext.companyId(request), dto, RequestContext.userId(request));
        ApiResponse.ok(response, result, "Stock take team reassigned");
    };
    getPlanProgress = async (request, response) => {
        const planId = String(request.params.planId);
        const companyId = RequestContext.companyId(request);
        const result = await this.getPlanProgressUseCase.execute(planId, companyId);
        ApiResponse.ok(response, result, "Plan progress loaded");
    };
    getPlanVariances = async (request, response) => {
        const planId = String(request.params.planId);
        const companyId = RequestContext.companyId(request);
        const result = await this.getPlanVariancesUseCase.execute(planId, companyId);
        ApiResponse.ok(response, result, "Plan variances loaded");
    };
    getTeamPerformance = async (request, response) => {
        const planId = String(request.params.planId);
        const companyId = RequestContext.companyId(request);
        const result = await this.getTeamPerformanceUseCase.execute(planId, companyId);
        ApiResponse.ok(response, result, "Team performance loaded");
    };
    getActivityLog = async (request, response) => {
        const planId = String(request.params.planId);
        const companyId = RequestContext.companyId(request);
        const result = await this.getActivityLogUseCase.execute(planId, companyId);
        ApiResponse.ok(response, result, "Activity log loaded");
    };
    exportCountSheets = async (request, response) => {
        const planId = String(request.params.planId);
        const companyId = RequestContext.companyId(request);
        const result = await this.exportCountSheetsUseCase.execute(planId, companyId);
        ApiResponse.ok(response, result, "Count sheets exported");
    };
    printCountSheets = async (request, response) => {
        const planId = String(request.params.planId);
        const companyId = RequestContext.companyId(request);
        const result = await this.printCountSheetsUseCase.execute(planId, companyId);
        ApiResponse.ok(response, result, "Count sheets printed");
    };
    downloadVarianceReport = async (request, response) => {
        const planId = String(request.params.planId);
        const companyId = RequestContext.companyId(request);
        const result = await this.downloadVarianceReportUseCase.execute(planId, companyId);
        ApiResponse.ok(response, result, "Variance report downloaded");
    };
    calculateCoverage = async (request, response) => {
        const companyId = RequestContext.companyId(request);
        const dto = StockCountingReconciliationValidator.calculateCoverage.parse(request.body);
        const { PostgresStockCountingRepository } = await import("../infrastructure/postgres-stock-counting.repository");
        const repo = new PostgresStockCountingRepository();
        const result = await repo.calculateCoverageSummary(dto.selectedZoneIds, dto.warehouseId, companyId, dto.includeZeroStock, dto.includeInactiveItems);
        ApiResponse.ok(response, result, "Coverage calculated");
    };
}
