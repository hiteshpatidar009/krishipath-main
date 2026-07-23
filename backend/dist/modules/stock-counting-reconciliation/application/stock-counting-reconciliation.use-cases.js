import { CoreEventBus, EventEnvelopeFactory } from "../../../core";
import { logger } from "../../../infrastructure/logger";
import { StockCountingReconciliationEvents } from "../events/stock-counting-reconciliation.events";
// ─── Legacy session use cases ────────────────────────────────────────────────
export class CreateCountSessionUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(input) {
        const session = await this.repository.createSession(input);
        await this.publish(StockCountingReconciliationEvents.countCreated, session.id, input.companyId, input.createdBy, { ...session });
        return session;
    }
    async publish(name, id, companyId, userId, payload) {
        await CoreEventBus.publish(EventEnvelopeFactory.create({ id, name, source: "stock-counting-reconciliation", payload, metadata: { companyId, userId } }));
        await logger.info(name, { category: "audit", module: "stock-counting-reconciliation", action: name, companyId, userId, actorId: userId, payload });
    }
}
export class StartCountSessionUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    execute(input) {
        return this.repository.startSession(input);
    }
}
export class RecordStockCountUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(input) {
        const result = await this.repository.recordCount(input);
        if (result.discrepancy) {
            await CoreEventBus.publish(EventEnvelopeFactory.create({
                id: result.discrepancy.id,
                name: StockCountingReconciliationEvents.discrepancyDetected,
                source: "stock-counting-reconciliation",
                payload: result.discrepancy,
                metadata: { companyId: input.companyId, userId: input.countedBy },
            }));
        }
        return result;
    }
}
export class CompleteCountSessionUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    execute(input) {
        return this.repository.completeSession(input);
    }
}
export class ApproveCountSessionUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    execute(input) {
        return this.repository.approveSession(input);
    }
}
export class ListCountSessionsUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    execute(input) {
        return this.repository.listSessions(input);
    }
}
export class ListDiscrepanciesUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    execute(input) {
        return this.repository.listDiscrepancies(input);
    }
}
export class GetCountReconciliationUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    execute(companyId, sessionId) {
        return this.repository.getReconciliation(companyId, sessionId);
    }
}
export class FinalizeReconciliationUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    execute(companyId, sessionId, actorId) {
        return this.repository.finalizeReconciliation(companyId, sessionId, actorId);
    }
}
export class AutoMatchZeroVarianceUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    execute(companyId, sessionId) {
        return this.repository.autoMatch(companyId, sessionId);
    }
}
export class ProposeAdjustmentsUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    execute(companyId, sessionId, actorId) {
        return this.repository.proposeAdjustments(companyId, sessionId, actorId);
    }
}
// ─── Stock Take Plan use cases ───────────────────────────────────────────────
export class CreateStockTakePlanUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    execute(input) {
        return this.repository.createStockTakePlan(input);
    }
}
export class UpdateStockTakePlanUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    execute(planId, companyId, input, actorId) {
        return this.repository.updateStockTakePlan(planId, companyId, input, actorId);
    }
}
export class GetStockTakePlanUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    execute(planId, companyId) {
        return this.repository.getStockTakePlan(planId, companyId);
    }
}
export class ListStockTakePlansUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    execute(input) {
        return this.repository.listStockTakePlans(input);
    }
}
export class ScheduleStockTakePlanUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    execute(planId, companyId, actorId) {
        return this.repository.schedulePlan(planId, companyId, actorId);
    }
}
export class StartStockTakePlanUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    execute(planId, companyId, actorId) {
        return this.repository.startPlan(planId, companyId, actorId);
    }
}
export class PauseStockTakePlanUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    execute(planId, companyId, actorId) {
        return this.repository.pausePlan(planId, companyId, actorId);
    }
}
export class ResumeStockTakePlanUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    execute(planId, companyId, actorId) {
        return this.repository.resumePlan(planId, companyId, actorId);
    }
}
export class CompleteStockTakePlanUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    execute(planId, companyId, actorId) {
        return this.repository.completePlan(planId, companyId, actorId);
    }
}
export class CancelStockTakePlanUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    execute(planId, companyId, actorId, reason) {
        return this.repository.cancelPlan(planId, companyId, actorId, reason);
    }
}
export class LockInventoryUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    execute(input) {
        return this.repository.lockInventory(input);
    }
}
export class UnlockInventoryUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    execute(warehouseId, companyId, planId, actorId, reason) {
        return this.repository.unlockInventory(warehouseId, companyId, planId, actorId, reason);
    }
}
export class GetInventoryLockStatusUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    execute(warehouseId, companyId) {
        return this.repository.getInventoryLockStatus(warehouseId, companyId);
    }
}
export class GetStockTakeDashboardUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    execute(warehouseId, companyId) {
        return this.repository.getStockTakeDashboard(warehouseId, companyId);
    }
}
export class GetCoverageSummaryUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    execute(planId, companyId) {
        return this.repository.getCoverageSummary(planId, companyId);
    }
}
export class SubmitForApprovalUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    execute(planId, companyId, actorId) {
        return this.repository.submitForApproval(planId, companyId, actorId);
    }
}
export class ApprovePlanUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    execute(planId, companyId, actorId, notes) {
        return this.repository.approvePlan(planId, companyId, actorId, notes);
    }
}
export class RejectPlanUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    execute(planId, companyId, actorId, notes) {
        return this.repository.rejectPlan(planId, companyId, actorId, notes);
    }
}
export class ExportStockTakePlansUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    execute(input) {
        return this.repository.exportStockTakePlans(input);
    }
}
export class ExtendDeadlineUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    execute(planId, companyId, input, actorId) {
        return this.repository.extendDeadline(planId, companyId, input, actorId);
    }
}
export class ReassignTeamUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    execute(planId, companyId, input, actorId) {
        return this.repository.reassignTeam(planId, companyId, input, actorId);
    }
}
export class GetPlanProgressUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    execute(planId, companyId) {
        return this.repository.getPlanProgress(planId, companyId);
    }
}
export class GetPlanVariancesUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    execute(planId, companyId) {
        return this.repository.getPlanVariances(planId, companyId);
    }
}
export class GetTeamPerformanceUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    execute(planId, companyId) {
        return this.repository.getTeamPerformance(planId, companyId);
    }
}
export class GetActivityLogUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    execute(planId, companyId) {
        return this.repository.getActivityLog(planId, companyId);
    }
}
export class ExportCountSheetsUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    execute(planId, companyId) {
        return this.repository.exportCountSheets(planId, companyId);
    }
}
export class PrintCountSheetsUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    execute(planId, companyId) {
        return this.repository.printCountSheets(planId, companyId);
    }
}
export class DownloadVarianceReportUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    execute(planId, companyId) {
        return this.repository.downloadVarianceReport(planId, companyId);
    }
}
