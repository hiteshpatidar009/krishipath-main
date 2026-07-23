import { CoreEventBus, EventEnvelopeFactory } from "../../../../core";
import { AppError } from "../../../../shared/errors/app.error";
import { WarehouseEvents } from "../../events/warehouse.events";
import { SubscriptionLimitService } from "../../../subscription";
import { AuditLoggingService } from "../../../../shared/audit/audit-logging.service";
export class CreateWarehouseUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(input) {
        await SubscriptionLimitService.assertCanCreateWarehouse(input.companyId);
        const result = await this.repository.create(input);
        await this.publish(WarehouseEvents.created, result.warehouseId, input.companyId, { ...input });
        await SubscriptionLimitService.checkWarehouseLimit(input.companyId, undefined);
        return result;
    }
    async publish(name, id, companyId, payload) {
        await CoreEventBus.publish(EventEnvelopeFactory.create({
            id,
            name,
            source: "warehouse",
            payload,
            metadata: { companyId },
        }));
    }
}
export class ListWarehousesUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(query) {
        const result = await this.repository.list(query);
        return { ...result, page: query.page, limit: query.limit };
    }
}
export class GetWarehouseUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(companyId, warehouseId) {
        const warehouse = await this.repository.findById(companyId, warehouseId);
        if (!warehouse) {
            throw new AppError("Warehouse not found", 404, "WAREHOUSE_NOT_FOUND");
        }
        return warehouse;
    }
}
export class UpdateWarehouseUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(input) {
        await SubscriptionLimitService.assertCanUpdate(input.companyId);
        await this.requireWarehouse(input.companyId, input.warehouseId);
        await this.repository.update(input);
        await this.publish(WarehouseEvents.updated, input.warehouseId, input.companyId, { ...input });
        return { updated: true };
    }
    async requireWarehouse(companyId, warehouseId) {
        const warehouse = await this.repository.findById(companyId, warehouseId);
        if (!warehouse) {
            throw new AppError("Warehouse not found", 404, "WAREHOUSE_NOT_FOUND");
        }
    }
    async publish(name, id, companyId, payload) {
        await CoreEventBus.publish(EventEnvelopeFactory.create({
            id,
            name,
            source: "warehouse",
            payload,
            metadata: { companyId },
        }));
    }
}
export class DeleteWarehouseUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(companyId, warehouseId) {
        await SubscriptionLimitService.assertCanUpdate(companyId);
        const warehouse = await this.repository.findById(companyId, warehouseId);
        if (!warehouse) {
            throw new AppError("Warehouse not found", 404, "WAREHOUSE_NOT_FOUND");
        }
        await this.repository.delete(companyId, warehouseId);
        await CoreEventBus.publish(EventEnvelopeFactory.create({
            id: warehouseId,
            name: WarehouseEvents.deleted,
            source: "warehouse",
            payload: { warehouseId },
            metadata: { companyId },
        }));
        return { deleted: true };
    }
}
export class SetDefaultWarehouseUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(companyId, warehouseId) {
        await SubscriptionLimitService.assertCanUpdate(companyId);
        const warehouse = await this.repository.findById(companyId, warehouseId);
        if (!warehouse) {
            throw new AppError("Warehouse not found", 404, "WAREHOUSE_NOT_FOUND");
        }
        await this.repository.setDefault(companyId, warehouseId);
        await CoreEventBus.publish(EventEnvelopeFactory.create({
            id: warehouseId,
            name: WarehouseEvents.defaultChanged,
            source: "warehouse",
            payload: { warehouseId },
            metadata: { companyId },
        }));
        return { defaultSet: true };
    }
}
export class GetWarehouseDashboardUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    execute(companyId) {
        return this.repository.getDashboard(companyId);
    }
}
export class GetWarehouseDetailsUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(companyId, warehouseId) {
        const result = await this.repository.getDetails(companyId, warehouseId);
        if (!result)
            throw new AppError("Warehouse not found", 404, "WAREHOUSE_NOT_FOUND");
        return result;
    }
}
export class GetWarehouseSummaryUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(companyId, warehouseId) {
        const details = await this.repository.getDetails(companyId, warehouseId);
        if (!details)
            throw new AppError("Warehouse not found", 404, "WAREHOUSE_NOT_FOUND");
        return {
            totalSKUs: details.totalSKUs,
            totalUnits: details.totalUnits,
            lowStockItems: details.lowStockItems,
            outOfStockItems: details.outOfStockItems,
            lastStockCount: details.lastStockCount,
            lastStockMovement: details.lastStockMovement,
        };
    }
}
export class GetWarehouseConfigurationUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(companyId, warehouseId) {
        const warehouse = await this.repository.findById(companyId, warehouseId);
        if (!warehouse)
            throw new AppError("Warehouse not found", 404, "WAREHOUSE_NOT_FOUND");
        return {
            allowCrossDocking: warehouse.allowCrossDocking,
            allowBulkStorage: warehouse.allowBulkStorage,
            allowHazardousStorage: warehouse.allowHazardousStorage,
            requiresAdvanceNotice: warehouse.requiresAdvanceNotice,
            advanceNoticeHours: warehouse.advanceNoticeHours,
            defaultReceivingZoneId: warehouse.defaultReceivingZoneId,
            defaultShippingZoneId: warehouse.defaultShippingZoneId,
            integrationType: warehouse.integrationType,
        };
    }
}
export class UpdateWarehouseConfigurationUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(companyId, warehouseId, input) {
        const warehouse = await this.repository.findById(companyId, warehouseId);
        if (!warehouse)
            throw new AppError("Warehouse not found", 404, "WAREHOUSE_NOT_FOUND");
        await this.repository.update({
            companyId,
            warehouseId,
            ...input,
        });
        return { updated: true };
    }
}
export class WarehouseStaffUseCases {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async list(companyId, warehouseId) {
        return this.repository.listStaff(companyId, warehouseId);
    }
    async assign(companyId, warehouseId, userIds) {
        await this.repository.assignStaff(companyId, warehouseId, userIds);
        return { assigned: true };
    }
}
export class WarehouseZoneUseCases {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    list(companyId, warehouseId, query) {
        return this.repository.listZones(companyId, warehouseId, query);
    }
    async get(companyId, warehouseId, zoneId) {
        const result = await this.repository.findZone(companyId, warehouseId, zoneId);
        if (!result)
            throw new AppError("Warehouse zone not found", 404, "WAREHOUSE_ZONE_NOT_FOUND");
        return result;
    }
    async create(input) {
        await SubscriptionLimitService.assertCanUpdate(input.companyId);
        return this.repository.createZone(input);
    }
    async update(input) {
        await SubscriptionLimitService.assertCanUpdate(input.companyId);
        await this.repository.updateZone(input);
        return { updated: true };
    }
    async delete(companyId, warehouseId, zoneId) {
        await SubscriptionLimitService.assertCanUpdate(companyId);
        await this.get(companyId, warehouseId, zoneId);
        await this.repository.deleteZone(companyId, warehouseId, zoneId);
        return { deleted: true };
    }
    async dashboard(companyId, warehouseId) {
        return this.repository.getZoneDashboard(companyId, warehouseId);
    }
    async listStaff(companyId, zoneId) {
        return this.repository.listZoneStaff(companyId, zoneId);
    }
    async assignStaff(companyId, zoneId, userIds) {
        await SubscriptionLimitService.assertCanUpdate(companyId);
        await this.repository.assignZoneStaff(companyId, zoneId, userIds);
        return { assigned: true };
    }
}
export class WarehouseBinUseCases {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async list(companyId, warehouseId, query) {
        return this.repository.listBins(companyId, warehouseId, query);
    }
    async dashboard(companyId, warehouseId) {
        return this.repository.getBinDashboard(companyId, warehouseId);
    }
    async create(input) {
        await SubscriptionLimitService.assertCanUpdate(input.companyId);
        return this.repository.createBin(input);
    }
    async update(input) {
        await SubscriptionLimitService.assertCanUpdate(input.companyId);
        await this.repository.updateBin(input);
        return { updated: true };
    }
    async delete(companyId, warehouseId, binId) {
        await SubscriptionLimitService.assertCanUpdate(companyId);
        await this.repository.deleteBin(companyId, warehouseId, binId);
        return { deleted: true };
    }
    async get(companyId, warehouseId, binId) {
        const bin = await this.repository.findBin(companyId, warehouseId, binId);
        if (!bin)
            throw new AppError("Bin not found", 404, "BIN_NOT_FOUND");
        return bin;
    }
    async getDetails(companyId, warehouseId, binId) {
        const details = await this.repository.findBinDetails(companyId, warehouseId, binId);
        if (!details)
            throw new AppError("Bin details not found", 404, "BIN_NOT_FOUND");
        return details;
    }
    async listInventory(companyId, binId) {
        return this.repository.listBinInventory(companyId, binId);
    }
    async listMovements(companyId, binId) {
        return this.repository.listBinMovements(companyId, binId);
    }
    async getAdjacent(companyId, warehouseId, binId) {
        return this.repository.getAdjacentBins(companyId, warehouseId, binId);
    }
    async lock(companyId, warehouseId, binId) {
        await SubscriptionLimitService.assertCanUpdate(companyId);
        await this.repository.lockBin(companyId, warehouseId, binId);
        return { locked: true };
    }
    async unlock(companyId, warehouseId, binId) {
        await SubscriptionLimitService.assertCanUpdate(companyId);
        await this.repository.unlockBin(companyId, warehouseId, binId);
        return { unlocked: true };
    }
    async setMaintenance(companyId, warehouseId, binId, isMaintenance) {
        await SubscriptionLimitService.assertCanUpdate(companyId);
        await this.repository.setBinMaintenance(companyId, warehouseId, binId, isMaintenance);
        return { updated: true };
    }
    async transferContents(companyId, warehouseId, binId, targetBinId) {
        await SubscriptionLimitService.assertCanUpdate(companyId);
        await this.repository.transferBinContents(companyId, warehouseId, binId, targetBinId);
        return { transferred: true };
    }
    async merge(companyId, warehouseId, sourceBinId, targetBinId) {
        await SubscriptionLimitService.assertCanUpdate(companyId);
        await this.repository.mergeBins(companyId, warehouseId, sourceBinId, targetBinId);
        return { merged: true };
    }
    async split(companyId, warehouseId, binId, items) {
        await SubscriptionLimitService.assertCanUpdate(companyId);
        await this.repository.splitBin(companyId, warehouseId, binId, items);
        return { split: true };
    }
}
export class WarehousePutawayUseCases {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async listRules(companyId, warehouseId, query) {
        return this.repository.listPutawayRules(companyId, warehouseId, query);
    }
    async dashboard(companyId, warehouseId, query) {
        return this.repository.getPutawayRulesDashboard(companyId, warehouseId, query);
    }
    async createRule(companyId, warehouseId, input, userId) {
        await SubscriptionLimitService.assertCanUpdate(companyId);
        const result = await this.repository.createPutawayRule(companyId, warehouseId, input, userId);
        await AuditLoggingService.record({
            companyId,
            warehouseId,
            userId,
            action: "putaway_rule.create",
            module: "warehouse",
            entityType: "putaway_rule",
            entityId: result.ruleId,
            status: "success",
            afterState: input
        });
        return result;
    }
    async updateRule(companyId, warehouseId, ruleId, input, userId) {
        await SubscriptionLimitService.assertCanUpdate(companyId);
        const beforeState = await this.repository.getPutawayRule(companyId, warehouseId, ruleId);
        await this.repository.updatePutawayRule(companyId, warehouseId, ruleId, input, userId);
        const afterState = await this.repository.getPutawayRule(companyId, warehouseId, ruleId);
        await AuditLoggingService.record({
            companyId,
            warehouseId,
            userId,
            action: "putaway_rule.update",
            module: "warehouse",
            entityType: "putaway_rule",
            entityId: ruleId,
            status: "success",
            beforeState,
            afterState
        });
        return { updated: true };
    }
    async deleteRule(companyId, warehouseId, ruleId) {
        await SubscriptionLimitService.assertCanUpdate(companyId);
        const beforeState = await this.repository.getPutawayRule(companyId, warehouseId, ruleId);
        await this.repository.deletePutawayRule(companyId, warehouseId, ruleId);
        await AuditLoggingService.record({
            companyId,
            warehouseId,
            action: "putaway_rule.delete",
            module: "warehouse",
            entityType: "putaway_rule",
            entityId: ruleId,
            status: "success",
            beforeState
        });
        return { deleted: true };
    }
    async getRule(companyId, warehouseId, ruleId) {
        const rule = await this.repository.getPutawayRule(companyId, warehouseId, ruleId);
        if (!rule)
            throw new AppError("Putaway rule not found", 404, "PUTAWAY_RULE_NOT_FOUND");
        return rule;
    }
    async getRuleDetails(companyId, warehouseId, ruleId) {
        const details = await this.repository.getPutawayRuleDetails(companyId, warehouseId, ruleId);
        if (!details)
            throw new AppError("Putaway rule not found", 404, "PUTAWAY_RULE_NOT_FOUND");
        return details;
    }
    async duplicateRule(companyId, warehouseId, ruleId, userId) {
        await SubscriptionLimitService.assertCanUpdate(companyId);
        const result = await this.repository.duplicatePutawayRule(companyId, warehouseId, ruleId, userId);
        await AuditLoggingService.record({
            companyId,
            warehouseId,
            userId,
            action: "putaway_rule.duplicate",
            module: "warehouse",
            entityType: "putaway_rule",
            entityId: result.ruleId,
            status: "success",
            metadata: { originalRuleId: ruleId }
        });
        return result;
    }
    async setRuleStatus(companyId, warehouseId, ruleId, status, userId) {
        await SubscriptionLimitService.assertCanUpdate(companyId);
        const beforeState = await this.repository.getPutawayRule(companyId, warehouseId, ruleId);
        await this.repository.setPutawayRuleStatus(companyId, warehouseId, ruleId, status, userId);
        const afterState = await this.repository.getPutawayRule(companyId, warehouseId, ruleId);
        await AuditLoggingService.record({
            companyId,
            warehouseId,
            userId,
            action: "putaway_rule.status_change",
            module: "warehouse",
            entityType: "putaway_rule",
            entityId: ruleId,
            status: "success",
            beforeState,
            afterState,
            metadata: { status }
        });
        return { updated: true };
    }
    async getRuleHistory(companyId, warehouseId, ruleId) {
        return this.repository.getPutawayRuleHistory(companyId, warehouseId, ruleId);
    }
    async getRuleActivity(companyId, warehouseId, ruleId) {
        return this.repository.getPutawayRuleActivity(companyId, warehouseId, ruleId);
    }
    async evaluateSuggestion(companyId, warehouseId, input) {
        return this.repository.evaluatePutawaySuggestion(companyId, warehouseId, input);
    }
    // Groups
    async listGroups(companyId, warehouseId, query) {
        return this.repository.listPutawayRuleGroups(companyId, warehouseId, query);
    }
    async createGroup(companyId, warehouseId, input) {
        await SubscriptionLimitService.assertCanUpdate(companyId);
        const result = await this.repository.createPutawayRuleGroup(companyId, warehouseId, input);
        await AuditLoggingService.record({
            companyId,
            warehouseId,
            action: "putaway_group.create",
            module: "warehouse",
            entityType: "putaway_group",
            entityId: result.groupId,
            status: "success",
            afterState: input
        });
        return result;
    }
    async getGroup(companyId, warehouseId, groupId) {
        const group = await this.repository.getPutawayRuleGroup(companyId, warehouseId, groupId);
        if (!group)
            throw new AppError("Putaway rule group not found", 404, "PUTAWAY_RULE_GROUP_NOT_FOUND");
        return group;
    }
    async updateGroup(companyId, warehouseId, groupId, input) {
        await SubscriptionLimitService.assertCanUpdate(companyId);
        const beforeState = await this.repository.getPutawayRuleGroup(companyId, warehouseId, groupId);
        await this.repository.updatePutawayRuleGroup(companyId, warehouseId, groupId, input);
        const afterState = await this.repository.getPutawayRuleGroup(companyId, warehouseId, groupId);
        await AuditLoggingService.record({
            companyId,
            warehouseId,
            action: "putaway_group.update",
            module: "warehouse",
            entityType: "putaway_group",
            entityId: groupId,
            status: "success",
            beforeState,
            afterState
        });
        return { updated: true };
    }
    async deleteGroup(companyId, warehouseId, groupId) {
        await SubscriptionLimitService.assertCanUpdate(companyId);
        const beforeState = await this.repository.getPutawayRuleGroup(companyId, warehouseId, groupId);
        await this.repository.deletePutawayRuleGroup(companyId, warehouseId, groupId);
        await AuditLoggingService.record({
            companyId,
            warehouseId,
            action: "putaway_group.delete",
            module: "warehouse",
            entityType: "putaway_group",
            entityId: groupId,
            status: "success",
            beforeState
        });
        return { deleted: true };
    }
    async setGroupStatus(companyId, warehouseId, groupId, isActive) {
        await SubscriptionLimitService.assertCanUpdate(companyId);
        const beforeState = await this.repository.getPutawayRuleGroup(companyId, warehouseId, groupId);
        await this.repository.setPutawayRuleGroupStatus(companyId, warehouseId, groupId, isActive);
        const afterState = await this.repository.getPutawayRuleGroup(companyId, warehouseId, groupId);
        await AuditLoggingService.record({
            companyId,
            warehouseId,
            action: "putaway_group.status_change",
            module: "warehouse",
            entityType: "putaway_group",
            entityId: groupId,
            status: "success",
            beforeState,
            afterState,
            metadata: { isActive }
        });
        return { updated: true };
    }
    // Slotting
    async listSlotting(companyId, warehouseId, query) {
        return this.repository.listSlottingStrategies(companyId, warehouseId, query);
    }
    async createSlotting(companyId, warehouseId, input) {
        await SubscriptionLimitService.assertCanUpdate(companyId);
        const result = await this.repository.createSlottingStrategy(companyId, warehouseId, input);
        await AuditLoggingService.record({
            companyId,
            warehouseId,
            action: "slotting_strategy.create",
            module: "warehouse",
            entityType: "slotting_strategy",
            entityId: result.strategyId,
            status: "success",
            afterState: input
        });
        return result;
    }
    async getSlotting(companyId, warehouseId, strategyId) {
        const strategy = await this.repository.getSlottingStrategy(companyId, warehouseId, strategyId);
        if (!strategy)
            throw new AppError("Slotting strategy not found", 404, "SLOTTING_STRATEGY_NOT_FOUND");
        return strategy;
    }
    async updateSlotting(companyId, warehouseId, strategyId, input) {
        await SubscriptionLimitService.assertCanUpdate(companyId);
        const beforeState = await this.repository.getSlottingStrategy(companyId, warehouseId, strategyId);
        await this.repository.updateSlottingStrategy(companyId, warehouseId, strategyId, input);
        const afterState = await this.repository.getSlottingStrategy(companyId, warehouseId, strategyId);
        await AuditLoggingService.record({
            companyId,
            warehouseId,
            action: "slotting_strategy.update",
            module: "warehouse",
            entityType: "slotting_strategy",
            entityId: strategyId,
            status: "success",
            beforeState,
            afterState
        });
        return { updated: true };
    }
    async deleteSlotting(companyId, warehouseId, strategyId) {
        await SubscriptionLimitService.assertCanUpdate(companyId);
        const beforeState = await this.repository.getSlottingStrategy(companyId, warehouseId, strategyId);
        await this.repository.deleteSlottingStrategy(companyId, warehouseId, strategyId);
        await AuditLoggingService.record({
            companyId,
            warehouseId,
            action: "slotting_strategy.delete",
            module: "warehouse",
            entityType: "slotting_strategy",
            entityId: strategyId,
            status: "success",
            beforeState
        });
        return { deleted: true };
    }
    async getSlottingOptimizationDashboard(companyId, warehouseId, query) {
        return this.repository.getSlottingOptimizationDashboard(companyId, warehouseId, query);
    }
    async getSlottingLayoutComparison(companyId, warehouseId, query) {
        return this.repository.getSlottingLayoutComparison(companyId, warehouseId, query);
    }
    async listSlottingRecommendations(companyId, warehouseId, query) {
        return this.repository.listSlottingRecommendations(companyId, warehouseId, query);
    }
    async getSlottingAnalytics(companyId, warehouseId, query) {
        return this.repository.getSlottingAnalytics(companyId, warehouseId, query);
    }
    async listSlottingTasks(companyId, warehouseId, query) {
        return this.repository.listSlottingTasks(companyId, warehouseId, query);
    }
    async runSlottingOptimization(companyId, warehouseId, input, userId) {
        await SubscriptionLimitService.assertCanUpdate(companyId);
        const result = await this.repository.runSlottingOptimization(companyId, warehouseId, input, userId);
        await AuditLoggingService.record({
            companyId,
            warehouseId,
            userId,
            action: "slotting_optimization.run",
            module: "warehouse",
            entityType: "slotting_optimization",
            entityId: result.runId,
            status: "success",
            afterState: result,
            metadata: { parameters: input },
        });
        return result;
    }
    async updateSlottingParameters(companyId, warehouseId, input, userId) {
        await SubscriptionLimitService.assertCanUpdate(companyId);
        const result = await this.repository.updateSlottingParameters(companyId, warehouseId, input, userId);
        await AuditLoggingService.record({
            companyId,
            warehouseId,
            userId,
            action: "slotting_optimization.parameters_changed",
            module: "warehouse",
            entityType: "slotting_parameters",
            entityId: result.parameterId,
            status: "success",
            afterState: input,
        });
        return result;
    }
    async saveSlottingProfile(companyId, warehouseId, input, userId) {
        await SubscriptionLimitService.assertCanUpdate(companyId);
        const result = await this.repository.saveSlottingProfile(companyId, warehouseId, input, userId);
        await AuditLoggingService.record({
            companyId,
            warehouseId,
            userId,
            action: "slotting_optimization.profile_changed",
            module: "warehouse",
            entityType: "slotting_profile",
            entityId: result.profileId,
            status: "success",
            afterState: input,
        });
        return result;
    }
    async approveSlottingRecommendations(companyId, warehouseId, input, userId) {
        await SubscriptionLimitService.assertCanUpdate(companyId);
        const result = await this.repository.approveSlottingRecommendations(companyId, warehouseId, input, userId);
        await AuditLoggingService.record({
            companyId,
            warehouseId,
            userId,
            action: "slotting_optimization.recommendation_approved",
            module: "warehouse",
            entityType: "slotting_recommendation",
            status: "success",
            afterState: result,
            metadata: input,
        });
        return result;
    }
    async rejectSlottingRecommendations(companyId, warehouseId, input, userId) {
        await SubscriptionLimitService.assertCanUpdate(companyId);
        const result = await this.repository.rejectSlottingRecommendations(companyId, warehouseId, input, userId);
        await AuditLoggingService.record({
            companyId,
            warehouseId,
            userId,
            action: "slotting_optimization.recommendation_rejected",
            module: "warehouse",
            entityType: "slotting_recommendation",
            status: "success",
            afterState: result,
            metadata: input,
        });
        return result;
    }
    async createSlottingTasks(companyId, warehouseId, input, userId) {
        await SubscriptionLimitService.assertCanUpdate(companyId);
        const result = await this.repository.createSlottingTasks(companyId, warehouseId, input, userId);
        await AuditLoggingService.record({
            companyId,
            warehouseId,
            userId,
            action: "slotting_optimization.task_created",
            module: "warehouse",
            entityType: "slotting_task",
            status: "success",
            afterState: result,
            metadata: input,
        });
        return result;
    }
    async exportSlottingReport(companyId, warehouseId, input, userId) {
        const result = await this.repository.exportSlottingReport(companyId, warehouseId, input, userId);
        await AuditLoggingService.record({
            companyId,
            warehouseId,
            userId,
            action: "slotting_optimization.export",
            module: "warehouse",
            entityType: "slotting_export",
            status: "success",
            afterState: result,
            metadata: input,
        });
        return result;
    }
    async saveSlottingScenario(companyId, warehouseId, input, userId) {
        await SubscriptionLimitService.assertCanUpdate(companyId);
        const result = await this.repository.saveSlottingScenario(companyId, warehouseId, input, userId);
        await AuditLoggingService.record({
            companyId,
            warehouseId,
            userId,
            action: "slotting_optimization.scenario_save",
            module: "warehouse",
            entityType: "slotting_scenario",
            entityId: result.scenarioId,
            status: "success",
            afterState: input,
        });
        return result;
    }
}
export class WarehouseTaskBoardUseCases {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    list(companyId, warehouseId, query) {
        return this.repository.listWarehouseTasks(companyId, warehouseId, query);
    }
    get(companyId, warehouseId, taskId) {
        return this.repository.getWarehouseTask(companyId, warehouseId, taskId);
    }
    analytics(companyId, warehouseId, query) {
        return this.repository.getWarehouseTaskAnalytics(companyId, warehouseId, query);
    }
    templates(companyId, warehouseId, query) {
        return this.repository.listWarehouseTaskTemplates(companyId, warehouseId, query);
    }
    async create(companyId, warehouseId, input, userId) {
        await SubscriptionLimitService.assertCanUpdate(companyId);
        const result = await this.repository.createWarehouseTask(companyId, warehouseId, input, userId);
        await this.audit(companyId, warehouseId, userId, "task.created", result.taskId, undefined, input);
        return result;
    }
    async update(companyId, warehouseId, taskId, input, userId) {
        await SubscriptionLimitService.assertCanUpdate(companyId);
        const beforeState = await this.repository.getWarehouseTask(companyId, warehouseId, taskId);
        const result = await this.repository.updateWarehouseTask(companyId, warehouseId, taskId, input, userId);
        const afterState = await this.repository.getWarehouseTask(companyId, warehouseId, taskId);
        await this.audit(companyId, warehouseId, userId, "task.updated", taskId, beforeState, afterState);
        return result;
    }
    async bulkUpdate(companyId, warehouseId, input, userId) {
        await SubscriptionLimitService.assertCanUpdate(companyId);
        const result = await this.repository.bulkUpdateWarehouseTasks(companyId, warehouseId, input, userId);
        await this.audit(companyId, warehouseId, userId, "task.bulk_updated", undefined, undefined, result);
        return result;
    }
    async assign(companyId, warehouseId, input, userId) {
        await SubscriptionLimitService.assertCanUpdate(companyId);
        const result = await this.repository.assignWarehouseTasks(companyId, warehouseId, input, userId);
        await this.audit(companyId, warehouseId, userId, "task.assigned", undefined, undefined, input);
        return result;
    }
    async status(companyId, warehouseId, taskId, input, userId) {
        await SubscriptionLimitService.assertCanUpdate(companyId);
        const beforeState = await this.repository.getWarehouseTask(companyId, warehouseId, taskId);
        const result = await this.repository.updateWarehouseTaskStatus(companyId, warehouseId, taskId, input, userId);
        await this.audit(companyId, warehouseId, userId, "task.status_changed", taskId, beforeState, input);
        return result;
    }
    async priority(companyId, warehouseId, taskId, input, userId) {
        await SubscriptionLimitService.assertCanUpdate(companyId);
        const result = await this.repository.updateWarehouseTaskPriority(companyId, warehouseId, taskId, input, userId);
        await this.audit(companyId, warehouseId, userId, "task.priority_changed", taskId, undefined, input);
        return result;
    }
    async progress(companyId, warehouseId, taskId, input, userId) {
        await SubscriptionLimitService.assertCanUpdate(companyId);
        const result = await this.repository.updateWarehouseTaskProgress(companyId, warehouseId, taskId, input, userId);
        await this.audit(companyId, warehouseId, userId, "task.progress_updated", taskId, undefined, input);
        return result;
    }
    async complete(companyId, warehouseId, taskId, input, userId) {
        await SubscriptionLimitService.assertCanUpdate(companyId);
        const result = await this.repository.completeWarehouseTask(companyId, warehouseId, taskId, input, userId);
        await this.audit(companyId, warehouseId, userId, "task.completed", taskId, undefined, result);
        return result;
    }
    async cancel(companyId, warehouseId, taskId, input, userId) {
        await SubscriptionLimitService.assertCanUpdate(companyId);
        const result = await this.repository.cancelWarehouseTask(companyId, warehouseId, taskId, input, userId);
        await this.audit(companyId, warehouseId, userId, "task.cancelled", taskId, undefined, input);
        return result;
    }
    async addNote(companyId, warehouseId, taskId, input, userId) {
        const result = await this.repository.addWarehouseTaskNote(companyId, warehouseId, taskId, input, userId);
        await this.audit(companyId, warehouseId, userId, "task.note_added", taskId, undefined, input);
        return result;
    }
    async addAttachment(companyId, warehouseId, taskId, input, userId) {
        const result = await this.repository.addWarehouseTaskAttachment(companyId, warehouseId, taskId, input, userId);
        await this.audit(companyId, warehouseId, userId, "task.attachment_uploaded", taskId, undefined, input);
        return result;
    }
    async audit(companyId, warehouseId, userId, action, entityId, beforeState, afterState) {
        await AuditLoggingService.record({
            companyId,
            warehouseId,
            userId,
            action,
            module: "warehouse",
            entityType: "task",
            entityId,
            status: "success",
            beforeState,
            afterState,
        });
    }
}
export class WarehousePickWaveUseCases {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async list(companyId, warehouseId, query) {
        return this.repository.listPickWaves(companyId, warehouseId, query);
    }
    async dashboard(companyId, warehouseId, query) {
        return this.repository.getPickWaveDashboard(companyId, warehouseId, query);
    }
    async create(companyId, warehouseId, input, userId) {
        await SubscriptionLimitService.assertCanUpdate(companyId);
        const result = await this.repository.createPickWave(companyId, warehouseId, input, userId);
        await AuditLoggingService.record({
            companyId,
            warehouseId,
            userId,
            action: "pick_wave.create",
            module: "warehouse",
            entityType: "pick_wave",
            entityId: result.waveId,
            status: "success",
            afterState: input
        });
        return result;
    }
    async update(companyId, warehouseId, waveId, input, userId) {
        await SubscriptionLimitService.assertCanUpdate(companyId);
        const beforeState = await this.repository.getPickWave(companyId, warehouseId, waveId);
        await this.repository.updatePickWave(companyId, warehouseId, waveId, input, userId);
        const afterState = await this.repository.getPickWave(companyId, warehouseId, waveId);
        await AuditLoggingService.record({
            companyId,
            warehouseId,
            userId,
            action: "pick_wave.update",
            module: "warehouse",
            entityType: "pick_wave",
            entityId: waveId,
            status: "success",
            beforeState,
            afterState
        });
        return { updated: true };
    }
    async delete(companyId, warehouseId, waveId) {
        await SubscriptionLimitService.assertCanUpdate(companyId);
        const beforeState = await this.repository.getPickWave(companyId, warehouseId, waveId);
        await this.repository.deletePickWave(companyId, warehouseId, waveId);
        await AuditLoggingService.record({
            companyId,
            warehouseId,
            action: "pick_wave.delete",
            module: "warehouse",
            entityType: "pick_wave",
            entityId: waveId,
            status: "success",
            beforeState
        });
        return { deleted: true };
    }
    async get(companyId, warehouseId, waveId) {
        const wave = await this.repository.getPickWave(companyId, warehouseId, waveId);
        if (!wave)
            throw new AppError("Pick wave not found", 404, "PICK_WAVE_NOT_FOUND");
        return wave;
    }
    async getDetails(companyId, warehouseId, waveId) {
        const details = await this.repository.getPickWaveDetails(companyId, warehouseId, waveId);
        if (!details)
            throw new AppError("Pick wave details not found", 404, "PICK_WAVE_NOT_FOUND");
        return details;
    }
    async release(companyId, warehouseId, waveId, userId) {
        await SubscriptionLimitService.assertCanUpdate(companyId);
        const beforeState = await this.repository.getPickWave(companyId, warehouseId, waveId);
        await this.repository.releasePickWave(companyId, warehouseId, waveId, userId);
        const afterState = await this.repository.getPickWave(companyId, warehouseId, waveId);
        await AuditLoggingService.record({
            companyId,
            warehouseId,
            userId,
            action: "pick_wave.release",
            module: "warehouse",
            entityType: "pick_wave",
            entityId: waveId,
            status: "success",
            beforeState,
            afterState
        });
        return { released: true };
    }
    async cancel(companyId, warehouseId, waveId, userId) {
        await SubscriptionLimitService.assertCanUpdate(companyId);
        const beforeState = await this.repository.getPickWave(companyId, warehouseId, waveId);
        await this.repository.cancelPickWave(companyId, warehouseId, waveId, userId);
        const afterState = await this.repository.getPickWave(companyId, warehouseId, waveId);
        await AuditLoggingService.record({
            companyId,
            warehouseId,
            userId,
            action: "pick_wave.cancel",
            module: "warehouse",
            entityType: "pick_wave",
            entityId: waveId,
            status: "success",
            beforeState,
            afterState
        });
        return { cancelled: true };
    }
    async duplicate(companyId, warehouseId, waveId, userId) {
        await SubscriptionLimitService.assertCanUpdate(companyId);
        const result = await this.repository.duplicatePickWave(companyId, warehouseId, waveId, userId);
        await AuditLoggingService.record({
            companyId,
            warehouseId,
            userId,
            action: "pick_wave.duplicate",
            module: "warehouse",
            entityType: "pick_wave",
            entityId: result.waveId,
            status: "success",
            metadata: { sourceWaveId: waveId }
        });
        return result;
    }
    async assignPickers(companyId, warehouseId, waveId, pickerIds) {
        await SubscriptionLimitService.assertCanUpdate(companyId);
        const beforeState = await this.repository.getPickWave(companyId, warehouseId, waveId);
        await this.repository.assignWavePickers(companyId, warehouseId, waveId, pickerIds);
        const afterState = await this.repository.getPickWave(companyId, warehouseId, waveId);
        await AuditLoggingService.record({
            companyId,
            warehouseId,
            action: "pick_wave.assign_pickers",
            module: "warehouse",
            entityType: "pick_wave",
            entityId: waveId,
            status: "success",
            beforeState,
            afterState,
            metadata: { pickerIds }
        });
        return { assigned: true };
    }
    async recalculate(companyId, warehouseId, waveId) {
        const beforeState = await this.repository.getPickWave(companyId, warehouseId, waveId);
        const result = await this.repository.recalculateWave(companyId, warehouseId, waveId);
        const afterState = await this.repository.getPickWave(companyId, warehouseId, waveId);
        await AuditLoggingService.record({
            companyId,
            warehouseId,
            action: "pick_wave.recalculate",
            module: "warehouse",
            entityType: "pick_wave",
            entityId: waveId,
            status: "success",
            beforeState,
            afterState,
            metadata: result
        });
        return result;
    }
    async listAvailableOrders(companyId, warehouseId, query) {
        return this.repository.listAvailableOrderPool(companyId, warehouseId, query);
    }
    async autoGroup(companyId, warehouseId, input, userId) {
        await SubscriptionLimitService.assertCanUpdate(companyId);
        const result = await this.repository.autoGroupOrdersIntoWaves(companyId, warehouseId, input, userId);
        await AuditLoggingService.record({
            companyId,
            warehouseId,
            userId,
            action: "pick_wave.auto_group",
            module: "warehouse",
            entityType: "pick_wave",
            entityId: warehouseId,
            status: "success",
            afterState: { input, result }
        });
        return result;
    }
    // Templates
    async listTemplates(companyId, warehouseId, query) {
        return this.repository.listWaveTemplates(companyId, warehouseId, query);
    }
    async createTemplate(companyId, warehouseId, input) {
        await SubscriptionLimitService.assertCanUpdate(companyId);
        const result = await this.repository.createWaveTemplate(companyId, warehouseId, input);
        await AuditLoggingService.record({
            companyId,
            warehouseId,
            action: "wave_template.create",
            module: "warehouse",
            entityType: "wave_template",
            entityId: result.templateId,
            status: "success",
            afterState: input
        });
        return result;
    }
    async updateTemplate(companyId, warehouseId, templateId, input) {
        await SubscriptionLimitService.assertCanUpdate(companyId);
        const beforeState = await this.repository.getWaveTemplate(companyId, warehouseId, templateId);
        await this.repository.updateWaveTemplate(companyId, warehouseId, templateId, input);
        const afterState = await this.repository.getWaveTemplate(companyId, warehouseId, templateId);
        await AuditLoggingService.record({
            companyId,
            warehouseId,
            action: "wave_template.update",
            module: "warehouse",
            entityType: "wave_template",
            entityId: templateId,
            status: "success",
            beforeState,
            afterState
        });
        return { updated: true };
    }
    async deleteTemplate(companyId, warehouseId, templateId) {
        await SubscriptionLimitService.assertCanUpdate(companyId);
        const beforeState = await this.repository.getWaveTemplate(companyId, warehouseId, templateId);
        await this.repository.deleteWaveTemplate(companyId, warehouseId, templateId);
        await AuditLoggingService.record({
            companyId,
            warehouseId,
            action: "wave_template.delete",
            module: "warehouse",
            entityType: "wave_template",
            entityId: templateId,
            status: "success",
            beforeState
        });
        return { deleted: true };
    }
    async getTemplate(companyId, warehouseId, templateId) {
        const template = await this.repository.getWaveTemplate(companyId, warehouseId, templateId);
        if (!template)
            throw new AppError("Wave template not found", 404, "WAVE_TEMPLATE_NOT_FOUND");
        return template;
    }
    async applyTemplate(companyId, warehouseId, templateId, waveName, waveCode, userId) {
        await SubscriptionLimitService.assertCanUpdate(companyId);
        const result = await this.repository.applyWaveTemplate(companyId, warehouseId, templateId, waveName, waveCode, userId);
        await AuditLoggingService.record({
            companyId,
            warehouseId,
            userId,
            action: "wave_template.apply",
            module: "warehouse",
            entityType: "pick_wave",
            entityId: result.waveId,
            status: "success",
            metadata: { templateId, waveName, waveCode }
        });
        return result;
    }
}
export class WarehousePickListUseCases {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async list(companyId, warehouseId, query) {
        return this.repository.listPickLists(companyId, warehouseId, query);
    }
    async dashboard(companyId, warehouseId) {
        return this.repository.getPickListDashboard(companyId, warehouseId);
    }
    async create(companyId, warehouseId, input, userId) {
        await SubscriptionLimitService.assertCanUpdate(companyId);
        return this.repository.createPickList(companyId, warehouseId, input, userId);
    }
    async update(companyId, warehouseId, pickListId, input, userId) {
        await SubscriptionLimitService.assertCanUpdate(companyId);
        await this.repository.updatePickList(companyId, warehouseId, pickListId, input, userId);
        return { updated: true };
    }
    async delete(companyId, warehouseId, pickListId) {
        await SubscriptionLimitService.assertCanUpdate(companyId);
        await this.repository.deletePickList(companyId, warehouseId, pickListId);
        return { deleted: true };
    }
    async get(companyId, warehouseId, pickListId) {
        const list = await this.repository.getPickList(companyId, warehouseId, pickListId);
        if (!list)
            throw new AppError("Pick list not found", 404, "PICK_LIST_NOT_FOUND");
        return list;
    }
    async getDetails(companyId, warehouseId, pickListId) {
        const details = await this.repository.getPickListDetails(companyId, warehouseId, pickListId);
        if (!details)
            throw new AppError("Pick list details not found", 404, "PICK_LIST_NOT_FOUND");
        return details;
    }
    async assignPicker(companyId, warehouseId, pickListId, pickerId, userId) {
        await SubscriptionLimitService.assertCanUpdate(companyId);
        await this.repository.assignPicker(companyId, warehouseId, pickListId, pickerId, userId);
        return { assigned: true };
    }
    async changePriority(companyId, warehouseId, pickListId, priority, userId) {
        await SubscriptionLimitService.assertCanUpdate(companyId);
        await this.repository.changePriority(companyId, warehouseId, pickListId, priority, userId);
        return { updated: true };
    }
    async updateStatus(companyId, warehouseId, pickListId, status, userId) {
        await SubscriptionLimitService.assertCanUpdate(companyId);
        await this.repository.updateStatus(companyId, warehouseId, pickListId, status, userId);
        return { updated: true };
    }
    async recordScan(companyId, warehouseId, pickListId, input, userId) {
        return this.repository.recordScan(companyId, warehouseId, pickListId, input, userId);
    }
    async recordShortPick(companyId, warehouseId, pickListId, input, userId) {
        return this.repository.recordShortPick(companyId, warehouseId, pickListId, input, userId);
    }
    async confirmPickItem(companyId, warehouseId, pickListId, itemId, quantity, userId) {
        return this.repository.confirmPickItem(companyId, warehouseId, pickListId, itemId, quantity, userId);
    }
    async skipLocation(companyId, warehouseId, pickListId, binId, userId) {
        await this.repository.skipLocation(companyId, warehouseId, pickListId, binId, userId);
        return { skipped: true };
    }
    async reportIssue(companyId, warehouseId, pickListId, issue, userId) {
        await this.repository.reportIssue(companyId, warehouseId, pickListId, issue, userId);
        return { reported: true };
    }
    async addNote(companyId, warehouseId, pickListId, note, userId) {
        await this.repository.addNote(companyId, warehouseId, pickListId, note, userId);
        return { added: true };
    }
    async listPickerPerformance(companyId, query) {
        return this.repository.listPickerPerformance(companyId, query);
    }
    async listPickerWorkloads(companyId, query) {
        return this.repository.listPickerWorkloads(companyId, query);
    }
}
export class WarehousePackingWorkbenchUseCases {
    repository;
    validTransitions = {
        DRAFT: ["PENDING", "CANCELLED"],
        PENDING: ["IN_PROGRESS", "ON_HOLD", "CANCELLED"],
        IN_PROGRESS: ["COMPLETED", "ON_HOLD", "CANCELLED"],
        ON_HOLD: ["IN_PROGRESS", "CANCELLED"],
        COMPLETED: [],
        CANCELLED: [],
    };
    constructor(repository) {
        this.repository = repository;
    }
    async list(companyId, warehouseId, query) {
        return this.repository.listPackingWorkbenches(companyId, warehouseId, query);
    }
    async summary(companyId, warehouseId) {
        return this.repository.getPackingWorkbenchDashboard(companyId, warehouseId);
    }
    async get(companyId, warehouseId, workbenchId) {
        const workbench = await this.repository.getPackingWorkbenchDetails(companyId, warehouseId, workbenchId);
        if (!workbench)
            throw new AppError("Packing workbench not found", 404, "PACKING_WORKBENCH_NOT_FOUND");
        return workbench;
    }
    async create(companyId, warehouseId, input, userId) {
        await SubscriptionLimitService.assertCanUpdate(companyId);
        const result = await this.repository.createPackingWorkbench(companyId, warehouseId, input, userId);
        await AuditLoggingService.record({
            companyId,
            warehouseId,
            userId,
            action: "packing_workbench.create",
            module: "warehouse",
            entityType: "packing_workbench",
            entityId: result.workbenchId,
            status: "success",
            afterState: input
        });
        return result;
    }
    async update(companyId, warehouseId, workbenchId, input, userId) {
        await SubscriptionLimitService.assertCanUpdate(companyId);
        await this.repository.updatePackingWorkbench(companyId, warehouseId, workbenchId, input, userId);
        await AuditLoggingService.record({
            companyId,
            warehouseId,
            userId,
            action: "packing_workbench.update",
            module: "warehouse",
            entityType: "packing_workbench",
            entityId: workbenchId,
            status: "success",
            afterState: input
        });
        return { updated: true };
    }
    async delete(companyId, warehouseId, workbenchId) {
        await SubscriptionLimitService.assertCanUpdate(companyId);
        await this.repository.deletePackingWorkbench(companyId, warehouseId, workbenchId);
        await AuditLoggingService.record({
            companyId,
            warehouseId,
            action: "packing_workbench.delete",
            module: "warehouse",
            entityType: "packing_workbench",
            entityId: workbenchId,
            status: "success"
        });
        return { deleted: true };
    }
    async changeStatus(companyId, warehouseId, workbenchId, status, userId) {
        const current = await this.repository.getPackingWorkbench(companyId, warehouseId, workbenchId);
        if (!current)
            throw new AppError("Packing workbench not found", 404, "PACKING_WORKBENCH_NOT_FOUND");
        const next = status.toUpperCase();
        const currentStatus = current.status.toUpperCase();
        if (!(this.validTransitions[currentStatus] ?? []).includes(next)) {
            throw new AppError("Invalid packing status transition", 409, "INVALID_PACKING_STATUS_TRANSITION");
        }
        await this.repository.updatePackingStatus(companyId, warehouseId, workbenchId, next, userId);
        await AuditLoggingService.record({
            companyId,
            warehouseId,
            userId,
            action: "packing_workbench.change_status",
            module: "warehouse",
            entityType: "packing_workbench",
            entityId: workbenchId,
            status: "success",
            afterState: { status: next }
        });
        return { updated: true, status: next };
    }
    async assign(companyId, warehouseId, workbenchId, packerId, userId) {
        await SubscriptionLimitService.assertCanUpdate(companyId);
        await this.repository.assignPacker(companyId, warehouseId, workbenchId, packerId, userId);
        await AuditLoggingService.record({
            companyId,
            warehouseId,
            userId,
            action: "packing_workbench.assign",
            module: "warehouse",
            entityType: "packing_workbench",
            entityId: workbenchId,
            status: "success",
            afterState: { packerId }
        });
        return { assigned: true };
    }
    async scan(companyId, warehouseId, workbenchId, input, userId) {
        const result = await this.repository.recordPackingScan(companyId, warehouseId, workbenchId, input, userId);
        await AuditLoggingService.record({
            companyId,
            warehouseId,
            userId,
            action: "packing_workbench.scan",
            module: "warehouse",
            entityType: "packing_workbench",
            entityId: workbenchId,
            status: result.matched !== false ? "success" : "failed",
            afterState: { barcode: input.barcode, matched: result.matched }
        });
        return result;
    }
    async packItem(companyId, warehouseId, workbenchId, input, userId) {
        const result = await this.repository.packWorkbenchItem(companyId, warehouseId, workbenchId, input, userId);
        await AuditLoggingService.record({
            companyId,
            warehouseId,
            userId,
            action: "packing_workbench.pack_item",
            module: "warehouse",
            entityType: "packing_workbench",
            entityId: workbenchId,
            status: "success",
            afterState: input
        });
        return result;
    }
    async createCarton(companyId, warehouseId, workbenchId, input, userId) {
        const result = await this.repository.createPackingCarton(companyId, warehouseId, workbenchId, input, userId);
        await AuditLoggingService.record({
            companyId,
            warehouseId,
            userId,
            action: "packing_workbench.create_carton",
            module: "warehouse",
            entityType: "packing_carton",
            entityId: result.cartonId,
            status: "success",
            afterState: input
        });
        return result;
    }
    async sealCarton(companyId, warehouseId, cartonId, userId) {
        const result = await this.repository.sealPackingCarton(companyId, warehouseId, cartonId, userId);
        await AuditLoggingService.record({
            companyId,
            warehouseId,
            userId,
            action: "packing_workbench.seal_carton",
            module: "warehouse",
            entityType: "packing_carton",
            entityId: cartonId,
            status: "success"
        });
        return result;
    }
    async reopenCarton(companyId, warehouseId, cartonId, userId) {
        const result = await this.repository.reopenPackingCarton(companyId, warehouseId, cartonId, userId);
        await AuditLoggingService.record({
            companyId,
            warehouseId,
            userId,
            action: "packing_workbench.reopen_carton",
            module: "warehouse",
            entityType: "packing_carton",
            entityId: cartonId,
            status: "success"
        });
        return result;
    }
    async complete(companyId, warehouseId, workbenchId, userId) {
        const result = await this.repository.completePackingWorkbench(companyId, warehouseId, workbenchId, userId);
        await AuditLoggingService.record({
            companyId,
            warehouseId,
            userId,
            action: "packing_workbench.complete",
            module: "warehouse",
            entityType: "packing_workbench",
            entityId: workbenchId,
            status: "success"
        });
        return result;
    }
    async shortPick(companyId, warehouseId, workbenchId, input, userId) {
        const result = await this.repository.recordPackingShortPick(companyId, warehouseId, workbenchId, input, userId);
        await AuditLoggingService.record({
            companyId,
            warehouseId,
            userId,
            action: "packing_workbench.short_pick",
            module: "warehouse",
            entityType: "packing_workbench",
            entityId: workbenchId,
            status: "success",
            afterState: input
        });
        return result;
    }
    async addNote(companyId, warehouseId, workbenchId, noteText, noteType, userId) {
        await SubscriptionLimitService.assertCanUpdate(companyId);
        await this.repository.addPackingNote(companyId, warehouseId, workbenchId, noteText, noteType, userId);
        await AuditLoggingService.record({
            companyId,
            warehouseId,
            userId,
            action: "packing_workbench.add_note",
            module: "warehouse",
            entityType: "packing_workbench",
            entityId: workbenchId,
            status: "success",
            afterState: { noteText, noteType }
        });
        return { created: true };
    }
    async moveToShipment(companyId, warehouseId, workbenchId, userId) {
        await SubscriptionLimitService.assertCanUpdate(companyId);
        const result = await this.repository.moveToShipment(companyId, warehouseId, workbenchId, userId);
        await AuditLoggingService.record({
            companyId,
            warehouseId,
            userId,
            action: "packing_workbench.move_to_shipment",
            module: "warehouse",
            entityType: "packing_workbench",
            entityId: workbenchId,
            status: "success",
            afterState: result
        });
        return result;
    }
    async documents(companyId, warehouseId, workbenchId) {
        return this.repository.listPackingDocuments(companyId, warehouseId, workbenchId);
    }
    async generateDocument(companyId, warehouseId, workbenchId, documentType, userId) {
        const result = await this.repository.generatePackingDocument(companyId, warehouseId, workbenchId, documentType, userId);
        await AuditLoggingService.record({
            companyId,
            warehouseId,
            userId,
            action: "packing_workbench.generate_document",
            module: "warehouse",
            entityType: "packing_workbench",
            entityId: workbenchId,
            status: "success",
            afterState: { documentType }
        });
        return result;
    }
    async topPackers(companyId, warehouseId) {
        return this.repository.getPackingTopPackers(companyId, warehouseId);
    }
    async stationUtilization(companyId, warehouseId) {
        return this.repository.getPackingStationUtilization(companyId, warehouseId);
    }
    async recentActivity(companyId, warehouseId) {
        return this.repository.getPackingRecentActivity(companyId, warehouseId);
    }
}
