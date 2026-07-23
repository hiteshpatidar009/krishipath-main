import { ApproveCountSessionUseCase, CompleteCountSessionUseCase, CreateCountSessionUseCase, ListCountSessionsUseCase, ListDiscrepanciesUseCase, RecordStockCountUseCase, StartCountSessionUseCase, GetCountReconciliationUseCase, FinalizeReconciliationUseCase, AutoMatchZeroVarianceUseCase, ProposeAdjustmentsUseCase, 
// Stock Take use cases
CreateStockTakePlanUseCase, UpdateStockTakePlanUseCase, GetStockTakePlanUseCase, ListStockTakePlansUseCase, ScheduleStockTakePlanUseCase, StartStockTakePlanUseCase, PauseStockTakePlanUseCase, ResumeStockTakePlanUseCase, CompleteStockTakePlanUseCase, CancelStockTakePlanUseCase, LockInventoryUseCase, UnlockInventoryUseCase, GetInventoryLockStatusUseCase, GetStockTakeDashboardUseCase, GetCoverageSummaryUseCase, SubmitForApprovalUseCase, ApprovePlanUseCase, RejectPlanUseCase, ExportStockTakePlansUseCase, ExtendDeadlineUseCase, ReassignTeamUseCase, GetPlanProgressUseCase, GetPlanVariancesUseCase, GetTeamPerformanceUseCase, GetActivityLogUseCase, ExportCountSheetsUseCase, PrintCountSheetsUseCase, DownloadVarianceReportUseCase, } from "./application";
import { StockCountingContractAdapter } from "./contracts";
import { PostgresStockCountingRepository } from "./infrastructure/postgres-stock-counting.repository";
import { StockCountingReconciliationController } from "./presentation/stock-counting-reconciliation.controller";
import { StockCountingReconciliationRoutes } from "./presentation/stock-counting-reconciliation.routes";
export class StockCountingReconciliationModule {
    repository = new PostgresStockCountingRepository();
    createSessionUseCase = new CreateCountSessionUseCase(this.repository);
    recordCountUseCase = new RecordStockCountUseCase(this.repository);
    controller = new StockCountingReconciliationController(
    // Legacy session use cases
    this.createSessionUseCase, new StartCountSessionUseCase(this.repository), this.recordCountUseCase, new CompleteCountSessionUseCase(this.repository), new ApproveCountSessionUseCase(this.repository), new ListCountSessionsUseCase(this.repository), new ListDiscrepanciesUseCase(this.repository), new GetCountReconciliationUseCase(this.repository), new FinalizeReconciliationUseCase(this.repository), new AutoMatchZeroVarianceUseCase(this.repository), new ProposeAdjustmentsUseCase(this.repository), 
    // Stock Take use cases
    new CreateStockTakePlanUseCase(this.repository), new UpdateStockTakePlanUseCase(this.repository), new GetStockTakePlanUseCase(this.repository), new ListStockTakePlansUseCase(this.repository), new ScheduleStockTakePlanUseCase(this.repository), new StartStockTakePlanUseCase(this.repository), new PauseStockTakePlanUseCase(this.repository), new ResumeStockTakePlanUseCase(this.repository), new CompleteStockTakePlanUseCase(this.repository), new CancelStockTakePlanUseCase(this.repository), new LockInventoryUseCase(this.repository), new UnlockInventoryUseCase(this.repository), new GetInventoryLockStatusUseCase(this.repository), new GetStockTakeDashboardUseCase(this.repository), new GetCoverageSummaryUseCase(this.repository), new SubmitForApprovalUseCase(this.repository), new ApprovePlanUseCase(this.repository), new RejectPlanUseCase(this.repository), new ExportStockTakePlansUseCase(this.repository), new ExtendDeadlineUseCase(this.repository), new ReassignTeamUseCase(this.repository), new GetPlanProgressUseCase(this.repository), new GetPlanVariancesUseCase(this.repository), new GetTeamPerformanceUseCase(this.repository), new GetActivityLogUseCase(this.repository), new ExportCountSheetsUseCase(this.repository), new PrintCountSheetsUseCase(this.repository), new DownloadVarianceReportUseCase(this.repository));
    routes = new StockCountingReconciliationRoutes(this.controller);
    contract = new StockCountingContractAdapter(this.createSessionUseCase, this.recordCountUseCase);
    getRouter() {
        return this.routes.getRouter();
    }
    getContract() {
        return this.contract;
    }
}
