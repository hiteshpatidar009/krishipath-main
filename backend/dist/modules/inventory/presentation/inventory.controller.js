import { RequestContext } from "../../../shared/context/request-context";
import { ApiResponse } from "../../../shared/http/api-response";
import { AuditLoggingService } from "../../../shared/audit/audit-logging.service";
import { InventoryValidator } from "./inventory.validator";
export class InventoryController {
    receiveUseCase;
    listBalancesUseCase;
    getBalanceUseCase;
    availabilityUseCase;
    movementsUseCase;
    overviewUseCase;
    byLocationUseCase;
    locationKpisUseCase;
    agingReportUseCase;
    agingDetailsUseCase;
    exportBalancesUseCase;
    exportByLocationUseCase;
    stockAlertsUseCase;
    constructor(receiveUseCase, listBalancesUseCase, getBalanceUseCase, availabilityUseCase, movementsUseCase, overviewUseCase, byLocationUseCase, locationKpisUseCase, agingReportUseCase, agingDetailsUseCase, exportBalancesUseCase, exportByLocationUseCase, stockAlertsUseCase) {
        this.receiveUseCase = receiveUseCase;
        this.listBalancesUseCase = listBalancesUseCase;
        this.getBalanceUseCase = getBalanceUseCase;
        this.availabilityUseCase = availabilityUseCase;
        this.movementsUseCase = movementsUseCase;
        this.overviewUseCase = overviewUseCase;
        this.byLocationUseCase = byLocationUseCase;
        this.locationKpisUseCase = locationKpisUseCase;
        this.agingReportUseCase = agingReportUseCase;
        this.agingDetailsUseCase = agingDetailsUseCase;
        this.exportBalancesUseCase = exportBalancesUseCase;
        this.exportByLocationUseCase = exportByLocationUseCase;
        this.stockAlertsUseCase = stockAlertsUseCase;
    }
    agingReport = async (request, response) => {
        const query = InventoryValidator.agingReport.parse(request.query);
        const companyId = RequestContext.companyId(request);
        ApiResponse.ok(response, await this.agingReportUseCase.execute(companyId, query), "Aging report loaded");
    };
    agingDetails = async (request, response) => {
        const query = InventoryValidator.agingDetails.parse(request.query);
        const companyId = RequestContext.companyId(request);
        ApiResponse.ok(response, await this.agingDetailsUseCase.execute(companyId, query), "Aging details loaded");
    };
    receive = async (request, response) => {
        const input = InventoryValidator.receive.parse(request.body);
        ApiResponse.created(response, await this.receiveUseCase.execute({
            ...input,
            companyId: RequestContext.companyId(request),
            performedBy: RequestContext.userId(request),
            idempotencyKey: String(request.header("idempotency-key")),
        }), "Inventory received");
    };
    listBalances = async (request, response) => {
        const query = InventoryValidator.balances.parse(request.query);
        ApiResponse.ok(response, await this.listBalancesUseCase.execute({
            ...query,
            companyId: RequestContext.companyId(request),
        }), "Inventory balances loaded");
    };
    getBalance = async (request, response) => {
        ApiResponse.ok(response, await this.getBalanceUseCase.execute(RequestContext.companyId(request), String(request.params.stockItemId)), "Inventory balance loaded");
    };
    availability = async (request, response) => {
        const warehouseId = typeof request.query.warehouseId === "string" ? request.query.warehouseId : undefined;
        ApiResponse.ok(response, await this.availabilityUseCase.execute(RequestContext.companyId(request), String(request.params.skuId), warehouseId), "Inventory availability loaded");
    };
    movements = async (request, response) => {
        const query = InventoryValidator.movements.parse(request.query);
        ApiResponse.ok(response, await this.movementsUseCase.execute({
            ...query,
            companyId: RequestContext.companyId(request),
        }), "Inventory movements loaded");
    };
    overview = async (request, response) => {
        const query = InventoryValidator.overview.parse(request.query);
        ApiResponse.ok(response, await this.overviewUseCase.execute(RequestContext.companyId(request), query), "Inventory overview loaded");
    };
    byLocation = async (request, response) => {
        const query = InventoryValidator.byLocation.parse(request.query);
        ApiResponse.ok(response, await this.byLocationUseCase.execute(RequestContext.companyId(request), query), "Inventory by location loaded");
    };
    locationKpis = async (request, response) => {
        const query = InventoryValidator.locationKpis.parse(request.query);
        ApiResponse.ok(response, await this.locationKpisUseCase.execute(RequestContext.companyId(request), query), "Location KPIs loaded");
    };
    exportBalances = async (request, response) => {
        const query = InventoryValidator.balances.parse(request.query);
        const companyId = RequestContext.companyId(request);
        const csvContent = await this.exportBalancesUseCase.execute(companyId, query);
        // Audit Logging
        void AuditLoggingService.record({
            companyId,
            userId: RequestContext.userId(request),
            action: "inventory.export",
            module: "inventory",
            entityType: "inventory_balance",
            status: "success",
            requestId: request.requestId,
            ipAddress: request.ip,
            userAgent: request.get("user-agent"),
            metadata: { query },
        });
        response.setHeader("Content-Type", "text/csv");
        response.setHeader("Content-Disposition", 'attachment; filename="inventory_export.csv"');
        response.status(200).send(csvContent);
    };
    exportByLocation = async (request, response) => {
        const query = InventoryValidator.byLocation.parse(request.query);
        const companyId = RequestContext.companyId(request);
        const csvContent = await this.exportByLocationUseCase.execute(companyId, query);
        // Audit Logging
        void AuditLoggingService.record({
            companyId,
            userId: RequestContext.userId(request),
            action: "inventory.by_location.export",
            module: "inventory",
            entityType: "inventory_balance",
            status: "success",
            requestId: request.requestId,
            ipAddress: request.ip,
            userAgent: request.get("user-agent"),
            metadata: { query },
        });
        response.setHeader("Content-Type", "text/csv");
        response.setHeader("Content-Disposition", 'attachment; filename="inventory_by_location_export.csv"');
        response.status(200).send(csvContent);
    };
    getAlerts = async (request, response) => {
        const query = InventoryValidator.alerts.parse(request.query);
        const companyId = RequestContext.companyId(request);
        ApiResponse.ok(response, await this.stockAlertsUseCase.execute(companyId, query), "Inventory alerts loaded");
    };
}
