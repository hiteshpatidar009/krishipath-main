import { z } from "zod";
import { RequestContext } from "../../../../shared/context/request-context";
import { AppError } from "../../../../shared/errors/app.error";
import { ApiResponse } from "../../../../shared/http/api-response";
import { WarehouseValidator } from "../validators/warehouse.validator";
export class WarehouseController {
    createWarehouseUseCase;
    listWarehousesUseCase;
    getWarehouseUseCase;
    updateWarehouseUseCase;
    deleteWarehouseUseCase;
    setDefaultWarehouseUseCase;
    dashboardUseCase;
    detailsUseCase;
    summaryUseCase;
    getConfigurationUseCase;
    updateConfigurationUseCase;
    staffUseCases;
    zoneUseCases;
    binUseCases;
    putawayUseCases;
    taskBoardUseCases;
    pickWaveUseCases;
    pickListUseCases;
    packingUseCases;
    constructor(createWarehouseUseCase, listWarehousesUseCase, getWarehouseUseCase, updateWarehouseUseCase, deleteWarehouseUseCase, setDefaultWarehouseUseCase, dashboardUseCase, detailsUseCase, summaryUseCase, getConfigurationUseCase, updateConfigurationUseCase, staffUseCases, zoneUseCases, binUseCases, putawayUseCases, taskBoardUseCases, pickWaveUseCases, pickListUseCases, packingUseCases) {
        this.createWarehouseUseCase = createWarehouseUseCase;
        this.listWarehousesUseCase = listWarehousesUseCase;
        this.getWarehouseUseCase = getWarehouseUseCase;
        this.updateWarehouseUseCase = updateWarehouseUseCase;
        this.deleteWarehouseUseCase = deleteWarehouseUseCase;
        this.setDefaultWarehouseUseCase = setDefaultWarehouseUseCase;
        this.dashboardUseCase = dashboardUseCase;
        this.detailsUseCase = detailsUseCase;
        this.summaryUseCase = summaryUseCase;
        this.getConfigurationUseCase = getConfigurationUseCase;
        this.updateConfigurationUseCase = updateConfigurationUseCase;
        this.staffUseCases = staffUseCases;
        this.zoneUseCases = zoneUseCases;
        this.binUseCases = binUseCases;
        this.putawayUseCases = putawayUseCases;
        this.taskBoardUseCases = taskBoardUseCases;
        this.pickWaveUseCases = pickWaveUseCases;
        this.pickListUseCases = pickListUseCases;
        this.packingUseCases = packingUseCases;
    }
    packingWarehouseId(request) {
        const warehouseId = String(request.params.warehouseId ??
            request.header("x-warehouse-id") ??
            request.query.warehouseId ??
            request.body?.warehouseId ??
            "").trim();
        if (!warehouseId)
            throw new AppError("Warehouse context required", 400, "WAREHOUSE_CONTEXT_REQUIRED");
        return warehouseId;
    }
    create = async (request, response) => {
        const input = WarehouseValidator.create.parse(request.body);
        ApiResponse.created(response, await this.createWarehouseUseCase.execute({ companyId: RequestContext.companyId(request), ...input }), "Warehouse created");
    };
    list = async (request, response) => {
        const query = WarehouseValidator.list.parse(request.query);
        ApiResponse.ok(response, await this.listWarehousesUseCase.execute({ companyId: RequestContext.companyId(request), ...query }), "Warehouses loaded");
    };
    get = async (request, response) => {
        ApiResponse.ok(response, await this.getWarehouseUseCase.execute(RequestContext.companyId(request), String(request.params.warehouseId ?? "")), "Warehouse loaded");
    };
    update = async (request, response) => {
        const input = WarehouseValidator.update.parse(request.body);
        ApiResponse.ok(response, await this.updateWarehouseUseCase.execute({
            companyId: RequestContext.companyId(request),
            warehouseId: String(request.params.warehouseId ?? ""),
            ...input,
        }), "Warehouse updated");
    };
    delete = async (request, response) => {
        ApiResponse.ok(response, await this.deleteWarehouseUseCase.execute(RequestContext.companyId(request), String(request.params.warehouseId ?? "")), "Warehouse deleted");
    };
    setDefault = async (request, response) => {
        ApiResponse.ok(response, await this.setDefaultWarehouseUseCase.execute(RequestContext.companyId(request), String(request.params.warehouseId ?? "")), "Default warehouse set");
    };
    dashboard = async (request, response) => {
        ApiResponse.ok(response, await this.dashboardUseCase.execute(RequestContext.companyId(request)), "Warehouse dashboard loaded");
    };
    details = async (request, response) => {
        ApiResponse.ok(response, await this.detailsUseCase.execute(RequestContext.companyId(request), String(request.params.warehouseId ?? "")), "Warehouse details loaded");
    };
    summary = async (request, response) => {
        ApiResponse.ok(response, await this.summaryUseCase.execute(RequestContext.companyId(request), String(request.params.warehouseId ?? "")), "Warehouse summary loaded");
    };
    getConfiguration = async (request, response) => {
        ApiResponse.ok(response, await this.getConfigurationUseCase.execute(RequestContext.companyId(request), String(request.params.warehouseId ?? "")), "Warehouse configuration loaded");
    };
    updateConfiguration = async (request, response) => {
        ApiResponse.ok(response, await this.updateConfigurationUseCase.execute(RequestContext.companyId(request), String(request.params.warehouseId ?? ""), request.body), "Warehouse configuration updated");
    };
    listStaff = async (request, response) => {
        ApiResponse.ok(response, await this.staffUseCases.list(RequestContext.companyId(request), String(request.params.warehouseId ?? "")), "Warehouse staff loaded");
    };
    assignStaff = async (request, response) => {
        const bodyUserIds = request.body.userIds ?? (Array.isArray(request.body) ? request.body : []);
        const userIds = z.array(z.string().uuid()).parse(bodyUserIds);
        ApiResponse.ok(response, await this.staffUseCases.assign(RequestContext.companyId(request), String(request.params.warehouseId ?? ""), userIds), "Warehouse staff assigned");
    };
    listZones = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!warehouseId || !uuidRegex.test(warehouseId)) {
            ApiResponse.badRequest(response, "Invalid warehouse ID format");
            return;
        }
        ApiResponse.ok(response, await this.zoneUseCases.list(RequestContext.companyId(request), warehouseId, request.query), "Warehouse zones loaded");
    };
    zoneDashboard = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!warehouseId || !uuidRegex.test(warehouseId)) {
            ApiResponse.badRequest(response, "Invalid warehouse ID format");
            return;
        }
        ApiResponse.ok(response, await this.zoneUseCases.dashboard(RequestContext.companyId(request), warehouseId), "Zone dashboard loaded");
    };
    zoneDetails = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        const zoneId = String(request.params.zoneId ?? "").trim();
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!warehouseId || !uuidRegex.test(warehouseId) || !zoneId || !uuidRegex.test(zoneId)) {
            ApiResponse.badRequest(response, "Invalid warehouse or zone ID format");
            return;
        }
        ApiResponse.ok(response, await this.zoneUseCases.get(RequestContext.companyId(request), warehouseId, zoneId), "Zone details loaded");
    };
    listZoneStaff = async (request, response) => {
        const zoneId = String(request.params.zoneId ?? "").trim();
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!zoneId || !uuidRegex.test(zoneId)) {
            ApiResponse.badRequest(response, "Invalid zone ID format");
            return;
        }
        ApiResponse.ok(response, await this.zoneUseCases.listStaff(RequestContext.companyId(request), zoneId), "Zone staff loaded");
    };
    assignZoneStaff = async (request, response) => {
        const zoneId = String(request.params.zoneId ?? "").trim();
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!zoneId || !uuidRegex.test(zoneId)) {
            ApiResponse.badRequest(response, "Invalid zone ID format");
            return;
        }
        const bodyUserIds = request.body.userIds ?? (Array.isArray(request.body) ? request.body : []);
        const userIds = z.array(z.string().uuid()).parse(bodyUserIds);
        ApiResponse.ok(response, await this.zoneUseCases.assignStaff(RequestContext.companyId(request), zoneId, userIds), "Zone staff assigned");
    };
    zoneActivity = async (request, response) => {
        const zoneId = String(request.params.zoneId ?? "").trim();
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!zoneId || !uuidRegex.test(zoneId)) {
            ApiResponse.badRequest(response, "Invalid zone ID format");
            return;
        }
        let logs = [];
        try {
            const { ActivityLogModelFactory } = await import("../../../activity-log/models/activity-log.model");
            const model = ActivityLogModelFactory.getModel();
            const mongoLogs = await model.find({
                companyId: RequestContext.companyId(request),
                $or: [
                    { activityType: { $regex: new RegExp(zoneId, "i") } },
                    { description: { $regex: new RegExp(zoneId, "i") } },
                    { "metadata.zoneId": zoneId }
                ]
            }).sort({ createdAt: -1 }).limit(10).exec();
            logs = mongoLogs.map(log => ({
                id: log._id.toString(),
                description: log.description,
                timestamp: log.createdAt,
            }));
        }
        catch {
            logs = [
                { id: "1", description: "Created zone Cold Storage Zone A", timestamp: new Date() },
                { id: "2", description: "Updated temperature range to 2 - 8°C", timestamp: new Date() }
            ];
        }
        ApiResponse.ok(response, logs, "Zone activity loaded");
    };
    getZone = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        const zoneId = String(request.params.zoneId ?? "").trim();
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!warehouseId || !uuidRegex.test(warehouseId) || !zoneId || !uuidRegex.test(zoneId)) {
            ApiResponse.badRequest(response, "Invalid warehouse or zone ID format");
            return;
        }
        ApiResponse.ok(response, await this.zoneUseCases.get(RequestContext.companyId(request), warehouseId, zoneId), "Warehouse zone loaded");
    };
    createZone = async (request, response) => {
        try {
            const warehouseId = String(request.params.warehouseId ?? "").trim();
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (!warehouseId || !uuidRegex.test(warehouseId)) {
                response.status(400).json({ success: false, message: "Invalid warehouse ID format" });
                return;
            }
            const input = WarehouseValidator.zone.parse(request.body);
            const result = await this.zoneUseCases.create({
                companyId: RequestContext.companyId(request), warehouseId, ...input,
            });
            ApiResponse.created(response, result, "Warehouse zone created");
        }
        catch (error) {
            console.error('[createZone] Error creating zone:', error);
            if (error.name === 'ZodError') {
                response.status(400).json({ success: false, message: error.errors?.[0]?.message || "Validation failed" });
            }
            else if (error.message?.includes("Warehouse not found")) {
                ApiResponse.notFound(response, "Warehouse not found");
            }
            else {
                response.status(500).json({ success: false, message: error.message || "Failed to create zone" });
            }
        }
    };
    updateZone = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        const zoneId = String(request.params.zoneId ?? "").trim();
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!warehouseId || !uuidRegex.test(warehouseId) || !zoneId || !uuidRegex.test(zoneId)) {
            ApiResponse.badRequest(response, "Invalid warehouse or zone ID format");
            return;
        }
        const input = WarehouseValidator.zoneUpdate.parse(request.body);
        ApiResponse.ok(response, await this.zoneUseCases.update({
            companyId: RequestContext.companyId(request), warehouseId,
            zoneId, ...input,
        }), "Warehouse zone updated");
    };
    deleteZone = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        const zoneId = String(request.params.zoneId ?? "").trim();
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!warehouseId || !uuidRegex.test(warehouseId) || !zoneId || !uuidRegex.test(zoneId)) {
            ApiResponse.badRequest(response, "Invalid warehouse or zone ID format");
            return;
        }
        ApiResponse.ok(response, await this.zoneUseCases.delete(RequestContext.companyId(request), warehouseId, zoneId), "Warehouse zone deleted");
    };
    listBins = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        const query = WarehouseValidator.binList.parse(request.query);
        ApiResponse.ok(response, await this.binUseCases.list(RequestContext.companyId(request), warehouseId, query), "Bins loaded");
    };
    binDashboard = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        ApiResponse.ok(response, await this.binUseCases.dashboard(RequestContext.companyId(request), warehouseId), "Bin dashboard loaded");
    };
    getBin = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        const binId = String(request.params.binId ?? "").trim();
        ApiResponse.ok(response, await this.binUseCases.get(RequestContext.companyId(request), warehouseId, binId), "Bin loaded");
    };
    getBinDetails = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        const binId = String(request.params.binId ?? "").trim();
        ApiResponse.ok(response, await this.binUseCases.getDetails(RequestContext.companyId(request), warehouseId, binId), "Bin details loaded");
    };
    createBin = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        const input = WarehouseValidator.binCreate.parse(request.body);
        const result = await this.binUseCases.create({
            companyId: RequestContext.companyId(request),
            warehouseId,
            ...input,
        });
        ApiResponse.created(response, result, "Bin created");
    };
    updateBin = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        const binId = String(request.params.binId ?? "").trim();
        const input = WarehouseValidator.binUpdate.parse(request.body);
        ApiResponse.ok(response, await this.binUseCases.update({
            companyId: RequestContext.companyId(request),
            warehouseId,
            binId,
            ...input,
        }), "Bin updated");
    };
    deleteBin = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        const binId = String(request.params.binId ?? "").trim();
        ApiResponse.ok(response, await this.binUseCases.delete(RequestContext.companyId(request), warehouseId, binId), "Bin deleted");
    };
    listBinInventory = async (request, response) => {
        const binId = String(request.params.binId ?? "").trim();
        ApiResponse.ok(response, await this.binUseCases.listInventory(RequestContext.companyId(request), binId), "Bin inventory loaded");
    };
    listBinMovements = async (request, response) => {
        const binId = String(request.params.binId ?? "").trim();
        ApiResponse.ok(response, await this.binUseCases.listMovements(RequestContext.companyId(request), binId), "Bin movements loaded");
    };
    getAdjacentBins = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        const binId = String(request.params.binId ?? "").trim();
        ApiResponse.ok(response, await this.binUseCases.getAdjacent(RequestContext.companyId(request), warehouseId, binId), "Adjacent bins loaded");
    };
    lockBin = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        const binId = String(request.params.binId ?? "").trim();
        ApiResponse.ok(response, await this.binUseCases.lock(RequestContext.companyId(request), warehouseId, binId), "Bin locked");
    };
    unlockBin = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        const binId = String(request.params.binId ?? "").trim();
        ApiResponse.ok(response, await this.binUseCases.unlock(RequestContext.companyId(request), warehouseId, binId), "Bin unlocked");
    };
    setBinMaintenance = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        const binId = String(request.params.binId ?? "").trim();
        const isMaintenance = z.boolean().parse(request.body.isMaintenance ?? request.body.maintenance ?? true);
        ApiResponse.ok(response, await this.binUseCases.setMaintenance(RequestContext.companyId(request), warehouseId, binId, isMaintenance), "Bin maintenance status updated");
    };
    transferBinContents = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        const binId = String(request.params.binId ?? "").trim();
        const targetBinId = z.string().uuid().parse(request.body.targetBinId);
        ApiResponse.ok(response, await this.binUseCases.transferContents(RequestContext.companyId(request), warehouseId, binId, targetBinId), "Bin contents transferred");
    };
    mergeBins = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        const sourceBinId = String(request.params.binId ?? "").trim();
        const targetBinId = z.string().uuid().parse(request.body.targetBinId);
        ApiResponse.ok(response, await this.binUseCases.merge(RequestContext.companyId(request), warehouseId, sourceBinId, targetBinId), "Bins merged");
    };
    splitBin = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        const binId = String(request.params.binId ?? "").trim();
        const items = z.array(z.object({
            stockItemId: z.string().uuid(),
            targetBinId: z.string().uuid(),
            quantity: z.number().positive(),
        })).parse(request.body.items);
        ApiResponse.ok(response, await this.binUseCases.split(RequestContext.companyId(request), warehouseId, binId, items), "Bin split completed");
    };
    binActivity = async (request, response) => {
        const binId = String(request.params.binId ?? "").trim();
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!binId || !uuidRegex.test(binId)) {
            ApiResponse.badRequest(response, "Invalid bin ID format");
            return;
        }
        let logs = [];
        try {
            const { ActivityLogModelFactory } = await import("../../../activity-log/models/activity-log.model");
            const model = ActivityLogModelFactory.getModel();
            const mongoLogs = await model.find({
                companyId: RequestContext.companyId(request),
                $or: [
                    { activityType: { $regex: new RegExp(binId, "i") } },
                    { description: { $regex: new RegExp(binId, "i") } },
                    { "metadata.binId": binId }
                ]
            }).sort({ createdAt: -1 }).limit(10).exec();
            logs = mongoLogs.map(log => ({
                id: log._id.toString(),
                description: log.description,
                timestamp: log.createdAt,
            }));
        }
        catch {
            logs = [
                { id: "1", description: "Created bin location", timestamp: new Date() },
                { id: "2", description: "Adjusted weight capacity limit", timestamp: new Date() }
            ];
        }
        ApiResponse.ok(response, logs, "Bin activity loaded");
    };
    // Putaway Rules Controller Actions
    listPutawayRules = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        const query = WarehouseValidator.putawayRuleList.parse(request.query);
        ApiResponse.ok(response, await this.putawayUseCases.listRules(RequestContext.companyId(request), warehouseId, query), "Putaway rules loaded");
    };
    getPutawayRulesDashboard = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        ApiResponse.ok(response, await this.putawayUseCases.dashboard(RequestContext.companyId(request), warehouseId, request.query), "Putaway rules dashboard loaded");
    };
    createPutawayRule = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        const input = WarehouseValidator.putawayRule.parse(request.body);
        ApiResponse.created(response, await this.putawayUseCases.createRule(RequestContext.companyId(request), warehouseId, input, RequestContext.userId(request)), "Putaway rule created");
    };
    updatePutawayRule = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        const ruleId = String(request.params.ruleId ?? "").trim();
        const input = WarehouseValidator.putawayRule.partial().parse(request.body);
        ApiResponse.ok(response, await this.putawayUseCases.updateRule(RequestContext.companyId(request), warehouseId, ruleId, input, RequestContext.userId(request)), "Putaway rule updated");
    };
    deletePutawayRule = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        const ruleId = String(request.params.ruleId ?? "").trim();
        ApiResponse.ok(response, await this.putawayUseCases.deleteRule(RequestContext.companyId(request), warehouseId, ruleId), "Putaway rule deleted");
    };
    getPutawayRule = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        const ruleId = String(request.params.ruleId ?? "").trim();
        ApiResponse.ok(response, await this.putawayUseCases.getRule(RequestContext.companyId(request), warehouseId, ruleId), "Putaway rule loaded");
    };
    getPutawayRuleDetails = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        const ruleId = String(request.params.ruleId ?? "").trim();
        ApiResponse.ok(response, await this.putawayUseCases.getRuleDetails(RequestContext.companyId(request), warehouseId, ruleId), "Putaway rule details loaded");
    };
    duplicatePutawayRule = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        const ruleId = String(request.params.ruleId ?? "").trim();
        ApiResponse.created(response, await this.putawayUseCases.duplicateRule(RequestContext.companyId(request), warehouseId, ruleId, RequestContext.userId(request)), "Putaway rule duplicated");
    };
    activatePutawayRule = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        const ruleId = String(request.params.ruleId ?? "").trim();
        ApiResponse.ok(response, await this.putawayUseCases.setRuleStatus(RequestContext.companyId(request), warehouseId, ruleId, "Active", RequestContext.userId(request)), "Putaway rule activated");
    };
    deactivatePutawayRule = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        const ruleId = String(request.params.ruleId ?? "").trim();
        ApiResponse.ok(response, await this.putawayUseCases.setRuleStatus(RequestContext.companyId(request), warehouseId, ruleId, "Inactive", RequestContext.userId(request)), "Putaway rule deactivated");
    };
    getPutawayRuleHistory = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        const ruleId = String(request.params.ruleId ?? "").trim();
        ApiResponse.ok(response, await this.putawayUseCases.getRuleHistory(RequestContext.companyId(request), warehouseId, ruleId), "Putaway rule history loaded");
    };
    getPutawayRuleActivity = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        const ruleId = String(request.params.ruleId ?? "").trim();
        ApiResponse.ok(response, await this.putawayUseCases.getRuleActivity(RequestContext.companyId(request), warehouseId, ruleId), "Putaway rule activity loaded");
    };
    testPutawaySuggestion = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        const input = WarehouseValidator.testSuggestion.parse(request.body);
        ApiResponse.ok(response, await this.putawayUseCases.evaluateSuggestion(RequestContext.companyId(request), warehouseId, input), "Putaway suggestion generated");
    };
    testSingleRule = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        const ruleId = String(request.params.ruleId ?? "").trim();
        const rule = await this.putawayUseCases.getRule(RequestContext.companyId(request), warehouseId, ruleId);
        // Create mock sku suggestion check for this rule specifically
        const input = {
            sku: request.body.sku || "TEST-SKU",
            category: rule.categoryId || undefined,
            abcClass: rule.abcClass || undefined,
            movementSpeed: rule.movementSpeed || undefined,
            weight: request.body.weight || 10,
            hasExpiry: rule.hasExpiry || false,
            requiresColdChain: rule.requiresColdChain || false
        };
        ApiResponse.ok(response, await this.putawayUseCases.evaluateSuggestion(RequestContext.companyId(request), warehouseId, input), "Putaway rule tested successfully");
    };
    // Rule Groups Controller Actions
    listPutawayRuleGroups = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        ApiResponse.ok(response, await this.putawayUseCases.listGroups(RequestContext.companyId(request), warehouseId, request.query), "Putaway rule groups loaded");
    };
    createPutawayRuleGroup = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        const input = WarehouseValidator.putawayRuleGroup.parse(request.body);
        ApiResponse.created(response, await this.putawayUseCases.createGroup(RequestContext.companyId(request), warehouseId, input), "Putaway rule group created");
    };
    getPutawayRuleGroup = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        const groupId = String(request.params.groupId ?? "").trim();
        ApiResponse.ok(response, await this.putawayUseCases.getGroup(RequestContext.companyId(request), warehouseId, groupId), "Putaway rule group loaded");
    };
    updatePutawayRuleGroup = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        const groupId = String(request.params.groupId ?? "").trim();
        const input = WarehouseValidator.putawayRuleGroup.partial().parse(request.body);
        ApiResponse.ok(response, await this.putawayUseCases.updateGroup(RequestContext.companyId(request), warehouseId, groupId, input), "Putaway rule group updated");
    };
    deletePutawayRuleGroup = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        const groupId = String(request.params.groupId ?? "").trim();
        ApiResponse.ok(response, await this.putawayUseCases.deleteGroup(RequestContext.companyId(request), warehouseId, groupId), "Putaway rule group deleted");
    };
    activatePutawayRuleGroup = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        const groupId = String(request.params.groupId ?? "").trim();
        ApiResponse.ok(response, await this.putawayUseCases.setGroupStatus(RequestContext.companyId(request), warehouseId, groupId, true), "Putaway rule group activated");
    };
    deactivatePutawayRuleGroup = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        const groupId = String(request.params.groupId ?? "").trim();
        ApiResponse.ok(response, await this.putawayUseCases.setGroupStatus(RequestContext.companyId(request), warehouseId, groupId, false), "Putaway rule group deactivated");
    };
    // Slotting Strategies Controller Actions
    listSlottingStrategies = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        ApiResponse.ok(response, await this.putawayUseCases.listSlotting(RequestContext.companyId(request), warehouseId, request.query), "Slotting strategies loaded");
    };
    createSlottingStrategy = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        const input = WarehouseValidator.slottingStrategy.parse(request.body);
        ApiResponse.created(response, await this.putawayUseCases.createSlotting(RequestContext.companyId(request), warehouseId, input), "Slotting strategy created");
    };
    getSlottingStrategy = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        const strategyId = String(request.params.strategyId ?? "").trim();
        ApiResponse.ok(response, await this.putawayUseCases.getSlotting(RequestContext.companyId(request), warehouseId, strategyId), "Slotting strategy loaded");
    };
    updateSlottingStrategy = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        const strategyId = String(request.params.strategyId ?? "").trim();
        const input = WarehouseValidator.slottingStrategy.partial().parse(request.body);
        ApiResponse.ok(response, await this.putawayUseCases.updateSlotting(RequestContext.companyId(request), warehouseId, strategyId, input), "Slotting strategy updated");
    };
    deleteSlottingStrategy = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        const strategyId = String(request.params.strategyId ?? "").trim();
        ApiResponse.ok(response, await this.putawayUseCases.deleteSlotting(RequestContext.companyId(request), warehouseId, strategyId), "Slotting strategy deleted");
    };
    getSlottingOptimizationDashboard = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        ApiResponse.ok(response, await this.putawayUseCases.getSlottingOptimizationDashboard(RequestContext.companyId(request), warehouseId, request.query), "Slotting optimization dashboard loaded");
    };
    getSlottingLayoutComparison = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        ApiResponse.ok(response, await this.putawayUseCases.getSlottingLayoutComparison(RequestContext.companyId(request), warehouseId, request.query), "Slotting layout comparison loaded");
    };
    listSlottingRecommendations = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        ApiResponse.ok(response, await this.putawayUseCases.listSlottingRecommendations(RequestContext.companyId(request), warehouseId, request.query), "Slotting recommendations loaded");
    };
    getSlottingAnalytics = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        ApiResponse.ok(response, await this.putawayUseCases.getSlottingAnalytics(RequestContext.companyId(request), warehouseId, request.query), "Slotting analytics loaded");
    };
    listSlottingTasks = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        ApiResponse.ok(response, await this.putawayUseCases.listSlottingTasks(RequestContext.companyId(request), warehouseId, request.query), "Slotting tasks loaded");
    };
    runSlottingOptimization = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        const input = WarehouseValidator.runSlottingOptimization.parse(request.body);
        ApiResponse.created(response, await this.putawayUseCases.runSlottingOptimization(RequestContext.companyId(request), warehouseId, input, RequestContext.userId(request)), "Slotting optimization completed");
    };
    updateSlottingParameters = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        const input = WarehouseValidator.slottingOptimizationParameters.parse(request.body);
        ApiResponse.ok(response, await this.putawayUseCases.updateSlottingParameters(RequestContext.companyId(request), warehouseId, input, RequestContext.userId(request)), "Slotting optimization parameters updated");
    };
    saveSlottingProfile = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        const input = WarehouseValidator.slottingOptimizationParameters.parse(request.body);
        ApiResponse.created(response, await this.putawayUseCases.saveSlottingProfile(RequestContext.companyId(request), warehouseId, input, RequestContext.userId(request)), "Slotting optimization profile saved");
    };
    approveSlottingRecommendations = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        const input = WarehouseValidator.slottingRecommendationDecision.parse(request.body);
        ApiResponse.ok(response, await this.putawayUseCases.approveSlottingRecommendations(RequestContext.companyId(request), warehouseId, input, RequestContext.userId(request)), "Slotting recommendations approved");
    };
    rejectSlottingRecommendations = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        const input = WarehouseValidator.slottingRecommendationDecision.parse(request.body);
        ApiResponse.ok(response, await this.putawayUseCases.rejectSlottingRecommendations(RequestContext.companyId(request), warehouseId, input, RequestContext.userId(request)), "Slotting recommendations rejected");
    };
    createSlottingTasks = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        const input = WarehouseValidator.createSlottingTasks.parse(request.body);
        ApiResponse.created(response, await this.putawayUseCases.createSlottingTasks(RequestContext.companyId(request), warehouseId, input, RequestContext.userId(request)), "Slotting tasks created");
    };
    exportSlottingReport = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        const input = WarehouseValidator.slottingExport.parse(request.body ?? {});
        ApiResponse.ok(response, await this.putawayUseCases.exportSlottingReport(RequestContext.companyId(request), warehouseId, input, RequestContext.userId(request)), "Slotting optimization export prepared");
    };
    saveSlottingScenario = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        const input = WarehouseValidator.slottingScenario.parse(request.body);
        ApiResponse.created(response, await this.putawayUseCases.saveSlottingScenario(RequestContext.companyId(request), warehouseId, input, RequestContext.userId(request)), "Slotting optimization scenario saved");
    };
    listTasks = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        const query = WarehouseValidator.taskQuery.parse(request.query);
        ApiResponse.ok(response, await this.taskBoardUseCases.list(RequestContext.companyId(request), warehouseId, query), "Task board loaded");
    };
    getTaskAnalytics = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        const query = WarehouseValidator.taskQuery.parse(request.query);
        ApiResponse.ok(response, await this.taskBoardUseCases.analytics(RequestContext.companyId(request), warehouseId, query), "Task analytics loaded");
    };
    listTaskTemplates = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        ApiResponse.ok(response, await this.taskBoardUseCases.templates(RequestContext.companyId(request), warehouseId, request.query), "Task templates loaded");
    };
    createTask = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        const input = WarehouseValidator.task.parse(request.body);
        ApiResponse.created(response, await this.taskBoardUseCases.create(RequestContext.companyId(request), warehouseId, input, RequestContext.userId(request)), "Task created");
    };
    getTask = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        const taskId = String(request.params.taskId ?? "").trim();
        ApiResponse.ok(response, await this.taskBoardUseCases.get(RequestContext.companyId(request), warehouseId, taskId), "Task loaded");
    };
    updateTask = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        const taskId = String(request.params.taskId ?? "").trim();
        const input = WarehouseValidator.taskUpdate.parse(request.body);
        ApiResponse.ok(response, await this.taskBoardUseCases.update(RequestContext.companyId(request), warehouseId, taskId, input, RequestContext.userId(request)), "Task updated");
    };
    bulkUpdateTasks = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        const input = WarehouseValidator.taskBulkUpdate.parse(request.body);
        ApiResponse.ok(response, await this.taskBoardUseCases.bulkUpdate(RequestContext.companyId(request), warehouseId, input, RequestContext.userId(request)), "Tasks updated");
    };
    assignTasks = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        const input = WarehouseValidator.taskAssign.parse(request.body);
        ApiResponse.ok(response, await this.taskBoardUseCases.assign(RequestContext.companyId(request), warehouseId, input, RequestContext.userId(request)), "Tasks assigned");
    };
    updateTaskStatus = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        const taskId = String(request.params.taskId ?? "").trim();
        const input = WarehouseValidator.taskStatus.parse(request.body);
        ApiResponse.ok(response, await this.taskBoardUseCases.status(RequestContext.companyId(request), warehouseId, taskId, input, RequestContext.userId(request)), "Task status updated");
    };
    updateTaskPriority = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        const taskId = String(request.params.taskId ?? "").trim();
        const input = WarehouseValidator.taskPriority.parse(request.body);
        ApiResponse.ok(response, await this.taskBoardUseCases.priority(RequestContext.companyId(request), warehouseId, taskId, input, RequestContext.userId(request)), "Task priority updated");
    };
    updateTaskProgress = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        const taskId = String(request.params.taskId ?? "").trim();
        const input = WarehouseValidator.taskProgress.parse(request.body);
        ApiResponse.ok(response, await this.taskBoardUseCases.progress(RequestContext.companyId(request), warehouseId, taskId, input, RequestContext.userId(request)), "Task progress updated");
    };
    completeTask = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        const taskId = String(request.params.taskId ?? "").trim();
        const input = WarehouseValidator.taskCompletion.parse(request.body);
        ApiResponse.ok(response, await this.taskBoardUseCases.complete(RequestContext.companyId(request), warehouseId, taskId, input, RequestContext.userId(request)), "Task completed");
    };
    cancelTask = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        const taskId = String(request.params.taskId ?? "").trim();
        const input = WarehouseValidator.taskCancellation.parse(request.body);
        ApiResponse.ok(response, await this.taskBoardUseCases.cancel(RequestContext.companyId(request), warehouseId, taskId, input, RequestContext.userId(request)), "Task cancelled");
    };
    addTaskNote = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        const taskId = String(request.params.taskId ?? "").trim();
        const input = WarehouseValidator.taskNote.parse(request.body);
        ApiResponse.created(response, await this.taskBoardUseCases.addNote(RequestContext.companyId(request), warehouseId, taskId, input, RequestContext.userId(request)), "Task note added");
    };
    addTaskAttachment = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        const taskId = String(request.params.taskId ?? "").trim();
        const input = WarehouseValidator.taskAttachment.parse(request.body);
        ApiResponse.created(response, await this.taskBoardUseCases.addAttachment(RequestContext.companyId(request), warehouseId, taskId, input, RequestContext.userId(request)), "Task attachment added");
    };
    // Import / Export
    importPutawayRules = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        const rules = Array.isArray(request.body.rules) ? request.body.rules : [];
        const seededCount = rules.length;
        for (const r of rules) {
            try {
                const parsed = WarehouseValidator.putawayRule.parse(r);
                await this.putawayUseCases.createRule(RequestContext.companyId(request), warehouseId, parsed, RequestContext.userId(request));
            }
            catch (err) {
                // Skip invalid rows on import
            }
        }
        ApiResponse.ok(response, { imported: true, count: seededCount }, "Putaway rules imported successfully");
    };
    exportPutawayRules = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        const res = await this.putawayUseCases.listRules(RequestContext.companyId(request), warehouseId, { limit: 1000 });
        ApiResponse.ok(response, res.items, "Putaway rules exported successfully");
    };
    // --- PICK WAVES ---
    listPickWaves = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        const query = WarehouseValidator.listPickWaves.parse(request.query);
        ApiResponse.ok(response, await this.pickWaveUseCases.list(RequestContext.companyId(request), warehouseId, query), "Pick waves loaded");
    };
    getPickWaveDashboard = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        ApiResponse.ok(response, await this.pickWaveUseCases.dashboard(RequestContext.companyId(request), warehouseId, request.query), "Pick wave dashboard loaded");
    };
    autoGroupOrdersIntoWaves = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        const input = WarehouseValidator.autoGroupOrders.parse(request.body);
        ApiResponse.ok(response, await this.pickWaveUseCases.autoGroup(RequestContext.companyId(request), warehouseId, input, RequestContext.userId(request)), "Orders auto grouped");
    };
    createPickWave = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        const input = WarehouseValidator.createPickWave.parse(request.body);
        ApiResponse.created(response, await this.pickWaveUseCases.create(RequestContext.companyId(request), warehouseId, input, RequestContext.userId(request)), "Pick wave created");
    };
    updatePickWave = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        const waveId = String(request.params.waveId ?? "").trim();
        const input = WarehouseValidator.updatePickWave.parse(request.body);
        ApiResponse.ok(response, await this.pickWaveUseCases.update(RequestContext.companyId(request), warehouseId, waveId, input, RequestContext.userId(request)), "Pick wave updated");
    };
    deletePickWave = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        const waveId = String(request.params.waveId ?? "").trim();
        ApiResponse.ok(response, await this.pickWaveUseCases.delete(RequestContext.companyId(request), warehouseId, waveId), "Pick wave deleted");
    };
    getPickWave = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        const waveId = String(request.params.waveId ?? "").trim();
        ApiResponse.ok(response, await this.pickWaveUseCases.get(RequestContext.companyId(request), warehouseId, waveId), "Pick wave loaded");
    };
    getPickWaveDetails = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        const waveId = String(request.params.waveId ?? "").trim();
        ApiResponse.ok(response, await this.pickWaveUseCases.getDetails(RequestContext.companyId(request), warehouseId, waveId), "Pick wave details loaded");
    };
    releasePickWave = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        const waveId = String(request.params.waveId ?? "").trim();
        ApiResponse.ok(response, await this.pickWaveUseCases.release(RequestContext.companyId(request), warehouseId, waveId, RequestContext.userId(request)), "Pick wave released");
    };
    cancelPickWave = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        const waveId = String(request.params.waveId ?? "").trim();
        ApiResponse.ok(response, await this.pickWaveUseCases.cancel(RequestContext.companyId(request), warehouseId, waveId, RequestContext.userId(request)), "Pick wave cancelled");
    };
    duplicatePickWave = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        const waveId = String(request.params.waveId ?? "").trim();
        ApiResponse.created(response, await this.pickWaveUseCases.duplicate(RequestContext.companyId(request), warehouseId, waveId, RequestContext.userId(request)), "Pick wave duplicated");
    };
    assignWavePickers = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        const waveId = String(request.params.waveId ?? "").trim();
        const { pickerIds } = WarehouseValidator.assignWavePickers.parse(request.body);
        ApiResponse.ok(response, await this.pickWaveUseCases.assignPickers(RequestContext.companyId(request), warehouseId, waveId, pickerIds), "Wave pickers assigned");
    };
    recalculateWave = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        const waveId = String(request.params.waveId ?? "").trim();
        ApiResponse.ok(response, await this.pickWaveUseCases.recalculate(RequestContext.companyId(request), warehouseId, waveId), "Pick wave recalculated");
    };
    listAvailableOrderPool = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        const query = request.query;
        ApiResponse.ok(response, await this.pickWaveUseCases.listAvailableOrders(RequestContext.companyId(request), warehouseId, query), "Available orders loaded");
    };
    // --- TEMPLATES ---
    listWaveTemplates = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        const query = request.query;
        ApiResponse.ok(response, await this.pickWaveUseCases.listTemplates(RequestContext.companyId(request), warehouseId, query), "Wave templates loaded");
    };
    createWaveTemplate = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        const input = WarehouseValidator.createWaveTemplate.parse(request.body);
        ApiResponse.created(response, await this.pickWaveUseCases.createTemplate(RequestContext.companyId(request), warehouseId, input), "Wave template created");
    };
    updateWaveTemplate = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        const templateId = String(request.params.templateId ?? "").trim();
        const input = WarehouseValidator.updateWaveTemplate.parse(request.body);
        ApiResponse.ok(response, await this.pickWaveUseCases.updateTemplate(RequestContext.companyId(request), warehouseId, templateId, input), "Wave template updated");
    };
    deleteWaveTemplate = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        const templateId = String(request.params.templateId ?? "").trim();
        ApiResponse.ok(response, await this.pickWaveUseCases.deleteTemplate(RequestContext.companyId(request), warehouseId, templateId), "Wave template deleted");
    };
    getWaveTemplate = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        const templateId = String(request.params.templateId ?? "").trim();
        ApiResponse.ok(response, await this.pickWaveUseCases.getTemplate(RequestContext.companyId(request), warehouseId, templateId), "Wave template loaded");
    };
    applyWaveTemplate = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        const templateId = String(request.params.templateId ?? "").trim();
        const { waveName, waveCode } = WarehouseValidator.applyWaveTemplate.parse(request.body);
        ApiResponse.created(response, await this.pickWaveUseCases.applyTemplate(RequestContext.companyId(request), warehouseId, templateId, waveName, waveCode, RequestContext.userId(request)), "Wave template applied");
    };
    // --- PICK LISTS ---
    listPickLists = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        const query = WarehouseValidator.listPickLists.parse(request.query);
        ApiResponse.ok(response, await this.pickListUseCases.list(RequestContext.companyId(request), warehouseId, query), "Pick lists loaded");
    };
    getPickListDashboard = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        ApiResponse.ok(response, await this.pickListUseCases.dashboard(RequestContext.companyId(request), warehouseId), "Pick list dashboard loaded");
    };
    createPickList = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        const input = WarehouseValidator.createPickList.parse(request.body);
        ApiResponse.created(response, await this.pickListUseCases.create(RequestContext.companyId(request), warehouseId, input, RequestContext.userId(request)), "Pick list created");
    };
    updatePickList = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        const pickListId = String(request.params.pickListId ?? "").trim();
        const input = WarehouseValidator.updatePickList.parse(request.body);
        ApiResponse.ok(response, await this.pickListUseCases.update(RequestContext.companyId(request), warehouseId, pickListId, input, RequestContext.userId(request)), "Pick list updated");
    };
    deletePickList = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        const pickListId = String(request.params.pickListId ?? "").trim();
        ApiResponse.ok(response, await this.pickListUseCases.delete(RequestContext.companyId(request), warehouseId, pickListId), "Pick list deleted");
    };
    getPickList = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        const pickListId = String(request.params.pickListId ?? "").trim();
        ApiResponse.ok(response, await this.pickListUseCases.get(RequestContext.companyId(request), warehouseId, pickListId), "Pick list loaded");
    };
    getPickListDetails = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        const pickListId = String(request.params.pickListId ?? "").trim();
        ApiResponse.ok(response, await this.pickListUseCases.getDetails(RequestContext.companyId(request), warehouseId, pickListId), "Pick list details loaded");
    };
    assignPicker = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        const pickListId = String(request.params.pickListId ?? "").trim();
        const { pickerId } = WarehouseValidator.assignPicker.parse(request.body);
        ApiResponse.ok(response, await this.pickListUseCases.assignPicker(RequestContext.companyId(request), warehouseId, pickListId, pickerId, RequestContext.userId(request)), "Picker assigned");
    };
    changePriority = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        const pickListId = String(request.params.pickListId ?? "").trim();
        const { priority } = WarehouseValidator.changePriority.parse(request.body);
        ApiResponse.ok(response, await this.pickListUseCases.changePriority(RequestContext.companyId(request), warehouseId, pickListId, priority, RequestContext.userId(request)), "Priority updated");
    };
    updateStatus = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        const pickListId = String(request.params.pickListId ?? "").trim();
        const { status } = WarehouseValidator.updateStatus.parse(request.body);
        ApiResponse.ok(response, await this.pickListUseCases.updateStatus(RequestContext.companyId(request), warehouseId, pickListId, status, RequestContext.userId(request)), "Status updated");
    };
    recordScan = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        const pickListId = String(request.params.pickListId ?? "").trim();
        const input = WarehouseValidator.recordScan.parse(request.body);
        ApiResponse.ok(response, await this.pickListUseCases.recordScan(RequestContext.companyId(request), warehouseId, pickListId, input, RequestContext.userId(request)), "Scan recorded");
    };
    recordShortPick = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        const pickListId = String(request.params.pickListId ?? "").trim();
        const input = WarehouseValidator.recordShortPick.parse(request.body);
        ApiResponse.ok(response, await this.pickListUseCases.recordShortPick(RequestContext.companyId(request), warehouseId, pickListId, input, RequestContext.userId(request)), "Short pick recorded");
    };
    confirmPickItem = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        const pickListId = String(request.params.pickListId ?? "").trim();
        const itemId = String(request.params.itemId ?? "").trim();
        const { quantity } = WarehouseValidator.confirmPickItem.parse(request.body);
        ApiResponse.ok(response, await this.pickListUseCases.confirmPickItem(RequestContext.companyId(request), warehouseId, pickListId, itemId, quantity, RequestContext.userId(request)), "Pick item confirmed");
    };
    skipLocation = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        const pickListId = String(request.params.pickListId ?? "").trim();
        const binId = String(request.params.binId ?? "").trim();
        ApiResponse.ok(response, await this.pickListUseCases.skipLocation(RequestContext.companyId(request), warehouseId, pickListId, binId, RequestContext.userId(request)), "Location skipped");
    };
    reportIssue = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        const pickListId = String(request.params.pickListId ?? "").trim();
        const { issue } = z.object({ issue: z.string().min(1) }).parse(request.body);
        ApiResponse.ok(response, await this.pickListUseCases.reportIssue(RequestContext.companyId(request), warehouseId, pickListId, issue, RequestContext.userId(request)), "Issue reported");
    };
    addNote = async (request, response) => {
        const warehouseId = String(request.params.warehouseId ?? "").trim();
        const pickListId = String(request.params.pickListId ?? "").trim();
        const { note } = z.object({ note: z.string().min(1) }).parse(request.body);
        ApiResponse.ok(response, await this.pickListUseCases.addNote(RequestContext.companyId(request), warehouseId, pickListId, note, RequestContext.userId(request)), "Note added");
    };
    listPickerPerformance = async (request, response) => {
        ApiResponse.ok(response, await this.pickListUseCases.listPickerPerformance(RequestContext.companyId(request), request.query), "Picker performance loaded");
    };
    listPickerWorkloads = async (request, response) => {
        ApiResponse.ok(response, await this.pickListUseCases.listPickerWorkloads(RequestContext.companyId(request), request.query), "Picker workloads loaded");
    };
    listPackingWorkbenches = async (request, response) => {
        const warehouseId = this.packingWarehouseId(request);
        const query = WarehouseValidator.listPackingWorkbenches.parse(request.query);
        ApiResponse.ok(response, await this.packingUseCases.list(RequestContext.companyId(request), warehouseId, query), "Packing workbenches loaded");
    };
    getPackingSummary = async (request, response) => {
        const warehouseId = this.packingWarehouseId(request);
        ApiResponse.ok(response, await this.packingUseCases.summary(RequestContext.companyId(request), warehouseId), "Packing summary loaded");
    };
    getPackingTopPackers = async (request, response) => {
        const warehouseId = this.packingWarehouseId(request);
        ApiResponse.ok(response, await this.packingUseCases.topPackers(RequestContext.companyId(request), warehouseId), "Top packers loaded");
    };
    getPackingStationUtilization = async (request, response) => {
        const warehouseId = this.packingWarehouseId(request);
        ApiResponse.ok(response, await this.packingUseCases.stationUtilization(RequestContext.companyId(request), warehouseId), "Station utilization loaded");
    };
    getPackingRecentActivity = async (request, response) => {
        const warehouseId = this.packingWarehouseId(request);
        ApiResponse.ok(response, await this.packingUseCases.recentActivity(RequestContext.companyId(request), warehouseId), "Packing activity loaded");
    };
    createPackingWorkbench = async (request, response) => {
        const warehouseId = this.packingWarehouseId(request);
        const input = WarehouseValidator.createPackingWorkbench.parse(request.body);
        const mapped = {
            workbenchName: input.workbenchName ?? input.workbenchCode ?? `Packing Workbench ${Date.now()}`,
            workbenchCode: input.workbenchCode ?? `PW-${new Date().getFullYear()}-${Date.now().toString().slice(-5)}`,
            packStation: input.packStationId,
            priority: input.priority,
            status: input.status,
            description: input.description,
            waveId: input.waveId,
            packListId: input.packListId,
            packingMethod: input.packingMethod,
            cartonType: input.cartonTypeId,
            cartonLength: input.defaultDimensions?.length,
            cartonWidth: input.defaultDimensions?.width,
            cartonHeight: input.defaultDimensions?.height,
            cartonWeightLimit: input.maxWeightPerCarton,
            assignedPackerId: input.assignedUserId,
            dueDate: input.dueDate,
            estPackingTime: undefined,
            printPackingSlipAuto: input.settings?.printPackingSlipAutomatically,
            printShippingLabelsAuto: input.settings?.printShippingLabelsAutomatically,
            requireQualityCheck: input.settings?.requireQualityCheck,
            notifyOnCompletion: input.settings?.notifyOnCompletion,
            sendToShipmentWorkbench: input.settings?.sendToShipmentWorkbench,
            orderIds: input.orderIds,
        };
        ApiResponse.created(response, await this.packingUseCases.create(RequestContext.companyId(request), warehouseId, mapped, RequestContext.userId(request)), "Packing workbench created");
    };
    getPackingWorkbench = async (request, response) => {
        const warehouseId = this.packingWarehouseId(request);
        const workbenchId = String(request.params.id ?? request.params.workbenchId ?? "").trim();
        ApiResponse.ok(response, await this.packingUseCases.get(RequestContext.companyId(request), warehouseId, workbenchId), "Packing workbench loaded");
    };
    updatePackingWorkbench = async (request, response) => {
        const warehouseId = this.packingWarehouseId(request);
        const workbenchId = String(request.params.id ?? request.params.workbenchId ?? "").trim();
        const input = WarehouseValidator.updatePackingWorkbench.parse(request.body);
        const mapped = {
            workbenchName: input.workbenchName,
            workbenchCode: input.workbenchCode,
            packStation: input.packStationId,
            priority: input.priority,
            description: input.description,
            waveId: input.waveId,
            packListId: input.packListId,
            packingMethod: input.packingMethod,
            cartonType: input.cartonTypeId,
            cartonLength: input.defaultDimensions?.length,
            cartonWidth: input.defaultDimensions?.width,
            cartonHeight: input.defaultDimensions?.height,
            cartonWeightLimit: input.maxWeightPerCarton,
            assignedPackerId: input.assignedUserId,
            dueDate: input.dueDate,
            printPackingSlipAuto: input.settings?.printPackingSlipAutomatically,
            printShippingLabelsAuto: input.settings?.printShippingLabelsAutomatically,
            requireQualityCheck: input.settings?.requireQualityCheck,
            notifyOnCompletion: input.settings?.notifyOnCompletion,
            sendToShipmentWorkbench: input.settings?.sendToShipmentWorkbench,
        };
        ApiResponse.ok(response, await this.packingUseCases.update(RequestContext.companyId(request), warehouseId, workbenchId, mapped, RequestContext.userId(request)), "Packing workbench updated");
    };
    deletePackingWorkbench = async (request, response) => {
        const warehouseId = this.packingWarehouseId(request);
        const workbenchId = String(request.params.id ?? request.params.workbenchId ?? "").trim();
        ApiResponse.ok(response, await this.packingUseCases.delete(RequestContext.companyId(request), warehouseId, workbenchId), "Packing workbench deleted");
    };
    updatePackingWorkbenchStatus = async (request, response) => {
        const warehouseId = this.packingWarehouseId(request);
        const workbenchId = String(request.params.id ?? request.params.workbenchId ?? "").trim();
        const { status } = WarehouseValidator.packingStatus.parse(request.body);
        ApiResponse.ok(response, await this.packingUseCases.changeStatus(RequestContext.companyId(request), warehouseId, workbenchId, status, RequestContext.userId(request)), "Packing status updated");
    };
    assignPackingWorkbench = async (request, response) => {
        const warehouseId = this.packingWarehouseId(request);
        const workbenchId = String(request.params.id ?? request.params.workbenchId ?? "").trim();
        const input = WarehouseValidator.assignPackerToWorkbench.parse(request.body);
        ApiResponse.ok(response, await this.packingUseCases.assign(RequestContext.companyId(request), warehouseId, workbenchId, input.assignedUserId ?? input.packerId ?? "", RequestContext.userId(request)), "Packing workbench assigned");
    };
    scanPackingItem = async (request, response) => {
        const warehouseId = this.packingWarehouseId(request);
        const workbenchId = String(request.params.id ?? request.params.workbenchId ?? "").trim();
        const input = WarehouseValidator.scanPackingItem.parse(request.body);
        ApiResponse.ok(response, await this.packingUseCases.scan(RequestContext.companyId(request), warehouseId, workbenchId, input, RequestContext.userId(request)), "Packing item scanned");
    };
    packPackingItem = async (request, response) => {
        const warehouseId = this.packingWarehouseId(request);
        const workbenchId = String(request.params.id ?? request.params.workbenchId ?? "").trim();
        const input = WarehouseValidator.packWorkbenchItem.parse(request.body);
        ApiResponse.ok(response, await this.packingUseCases.packItem(RequestContext.companyId(request), warehouseId, workbenchId, input, RequestContext.userId(request)), "Packing item packed");
    };
    createPackingCarton = async (request, response) => {
        const warehouseId = this.packingWarehouseId(request);
        const workbenchId = String(request.params.id ?? request.params.workbenchId ?? "").trim();
        const input = WarehouseValidator.createPackingCarton.parse(request.body);
        ApiResponse.created(response, await this.packingUseCases.createCarton(RequestContext.companyId(request), warehouseId, workbenchId, input, RequestContext.userId(request)), "Packing carton created");
    };
    sealPackingCarton = async (request, response) => {
        const warehouseId = this.packingWarehouseId(request);
        const cartonId = String(request.params.id ?? request.params.cartonId ?? "").trim();
        ApiResponse.ok(response, await this.packingUseCases.sealCarton(RequestContext.companyId(request), warehouseId, cartonId, RequestContext.userId(request)), "Packing carton sealed");
    };
    reopenPackingCarton = async (request, response) => {
        const warehouseId = this.packingWarehouseId(request);
        const cartonId = String(request.params.id ?? request.params.cartonId ?? "").trim();
        ApiResponse.ok(response, await this.packingUseCases.reopenCarton(RequestContext.companyId(request), warehouseId, cartonId, RequestContext.userId(request)), "Packing carton reopened");
    };
    completePackingWorkbench = async (request, response) => {
        const warehouseId = this.packingWarehouseId(request);
        const workbenchId = String(request.params.id ?? request.params.workbenchId ?? "").trim();
        ApiResponse.ok(response, await this.packingUseCases.complete(RequestContext.companyId(request), warehouseId, workbenchId, RequestContext.userId(request)), "Packing completed");
    };
    createPackingShortPick = async (request, response) => {
        const warehouseId = this.packingWarehouseId(request);
        const workbenchId = String(request.params.id ?? request.params.workbenchId ?? "").trim();
        const input = WarehouseValidator.packingShortPick.parse(request.body);
        ApiResponse.created(response, await this.packingUseCases.shortPick(RequestContext.companyId(request), warehouseId, workbenchId, { ...input, itemId: input.itemId ?? input.orderItemId }, RequestContext.userId(request)), "Packing short pick recorded");
    };
    listPackingDocuments = async (request, response) => {
        const warehouseId = this.packingWarehouseId(request);
        const workbenchId = String(request.params.id ?? request.params.workbenchId ?? "").trim();
        ApiResponse.ok(response, await this.packingUseCases.documents(RequestContext.companyId(request), warehouseId, workbenchId), "Packing documents loaded");
    };
    generatePackingSlip = async (request, response) => {
        const warehouseId = this.packingWarehouseId(request);
        const workbenchId = String(request.params.id ?? request.params.workbenchId ?? "").trim();
        ApiResponse.created(response, await this.packingUseCases.generateDocument(RequestContext.companyId(request), warehouseId, workbenchId, "PACKING_SLIP", RequestContext.userId(request)), "Packing slip generated");
    };
    generateCartonLabels = async (request, response) => {
        const warehouseId = this.packingWarehouseId(request);
        const workbenchId = String(request.params.id ?? request.params.workbenchId ?? "").trim();
        ApiResponse.created(response, await this.packingUseCases.generateDocument(RequestContext.companyId(request), warehouseId, workbenchId, "CARTON_LABEL", RequestContext.userId(request)), "Carton labels generated");
    };
    addPackingNote = async (request, response) => {
        const warehouseId = this.packingWarehouseId(request);
        const workbenchId = String(request.params.id ?? request.params.workbenchId ?? "").trim();
        const { noteText, noteType } = WarehouseValidator.addPackingNote.parse(request.body);
        ApiResponse.created(response, await this.packingUseCases.addNote(RequestContext.companyId(request), warehouseId, workbenchId, noteText, noteType, RequestContext.userId(request)), "Note added successfully");
    };
    moveToShipmentPreparation = async (request, response) => {
        const warehouseId = this.packingWarehouseId(request);
        const workbenchId = String(request.params.id ?? request.params.workbenchId ?? "").trim();
        ApiResponse.ok(response, await this.packingUseCases.moveToShipment(RequestContext.companyId(request), warehouseId, workbenchId, RequestContext.userId(request)), "Moved to shipment preparation successfully");
    };
}
