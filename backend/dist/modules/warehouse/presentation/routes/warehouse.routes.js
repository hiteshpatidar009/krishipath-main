import { Router } from "express";
import { AuthorizationMiddleware, IdempotencyMiddleware, SharedAuthMiddleware, CompanyGuard, } from "../../../../shared/security";
function ar(handler) {
    return (req, res, next) => {
        handler(req, res).catch(next);
    };
}
export class WarehouseRoutes {
    controller;
    router = Router();
    packingRouter = Router();
    constructor(controller) {
        this.controller = controller;
        this.register();
    }
    getRouter() {
        return this.router;
    }
    getPackingWorkbenchRouter() {
        return this.packingRouter;
    }
    register() {
        this.router.use(SharedAuthMiddleware.use, CompanyGuard.requireCompany);
        this.packingRouter.use(SharedAuthMiddleware.use, CompanyGuard.requireCompany);
        this.registerPackingWorkbenchRoutes(this.packingRouter, "");
        this.router.post("/", AuthorizationMiddleware.requirePermissions("warehouse.create"), IdempotencyMiddleware.requireForMutations(), ar(this.controller.create));
        this.router.get("/", AuthorizationMiddleware.requirePermissions("warehouse.read"), ar(this.controller.list));
        this.router.get("/dashboard", AuthorizationMiddleware.requirePermissions("warehouse.read"), ar(this.controller.dashboard));
        this.router.get("/:warehouseId/details", AuthorizationMiddleware.requirePermissions("warehouse.read"), ar(this.controller.details));
        this.router.get("/:warehouseId/zones/dashboard", AuthorizationMiddleware.requirePermissions("warehouse.read"), ar(this.controller.zoneDashboard));
        this.router.get("/:warehouseId/zones", AuthorizationMiddleware.requirePermissions("warehouse.read"), ar(this.controller.listZones));
        this.router.post("/:warehouseId/zones", AuthorizationMiddleware.requirePermissions("warehouse.update"), IdempotencyMiddleware.requireForMutations(), ar(this.controller.createZone));
        this.router.get("/:warehouseId/zones/:zoneId/details", AuthorizationMiddleware.requirePermissions("warehouse.read"), ar(this.controller.zoneDetails));
        this.router.get("/:warehouseId/zones/:zoneId/staff", AuthorizationMiddleware.requirePermissions("warehouse.read"), ar(this.controller.listZoneStaff));
        this.router.post("/:warehouseId/zones/:zoneId/staff", AuthorizationMiddleware.requirePermissions("warehouse.update"), IdempotencyMiddleware.requireForMutations(), ar(this.controller.assignZoneStaff));
        this.router.get("/:warehouseId/zones/:zoneId/activity", AuthorizationMiddleware.requirePermissions("warehouse.read"), ar(this.controller.zoneActivity));
        this.router.get("/:warehouseId/zones/:zoneId", AuthorizationMiddleware.requirePermissions("warehouse.read"), ar(this.controller.getZone));
        this.router.patch("/:warehouseId/zones/:zoneId", AuthorizationMiddleware.requirePermissions("warehouse.update"), IdempotencyMiddleware.requireForMutations(), ar(this.controller.updateZone));
        this.router.delete("/:warehouseId/zones/:zoneId", AuthorizationMiddleware.requirePermissions("warehouse.update"), IdempotencyMiddleware.requireForMutations(), ar(this.controller.deleteZone));
        // Bin Routes
        this.router.get("/:warehouseId/bins/dashboard", AuthorizationMiddleware.requirePermissions("warehouse.read"), ar(this.controller.binDashboard));
        this.router.get("/:warehouseId/bins", AuthorizationMiddleware.requirePermissions("warehouse.read"), ar(this.controller.listBins));
        this.router.post("/:warehouseId/bins", AuthorizationMiddleware.requirePermissions("warehouse.update"), IdempotencyMiddleware.requireForMutations(), ar(this.controller.createBin));
        this.router.get("/:warehouseId/bins/:binId/details", AuthorizationMiddleware.requirePermissions("warehouse.read"), ar(this.controller.getBinDetails));
        this.router.get("/:warehouseId/bins/:binId/inventory", AuthorizationMiddleware.requirePermissions("warehouse.read"), ar(this.controller.listBinInventory));
        this.router.get("/:warehouseId/bins/:binId/movements", AuthorizationMiddleware.requirePermissions("warehouse.read"), ar(this.controller.listBinMovements));
        this.router.get("/:warehouseId/bins/:binId/adjacent", AuthorizationMiddleware.requirePermissions("warehouse.read"), ar(this.controller.getAdjacentBins));
        this.router.get("/:warehouseId/bins/:binId/activity", AuthorizationMiddleware.requirePermissions("warehouse.read"), ar(this.controller.binActivity));
        this.router.post("/:warehouseId/bins/:binId/lock", AuthorizationMiddleware.requirePermissions("warehouse.update"), IdempotencyMiddleware.requireForMutations(), ar(this.controller.lockBin));
        this.router.post("/:warehouseId/bins/:binId/unlock", AuthorizationMiddleware.requirePermissions("warehouse.update"), IdempotencyMiddleware.requireForMutations(), ar(this.controller.unlockBin));
        this.router.post("/:warehouseId/bins/:binId/maintenance", AuthorizationMiddleware.requirePermissions("warehouse.update"), IdempotencyMiddleware.requireForMutations(), ar(this.controller.setBinMaintenance));
        this.router.post("/:warehouseId/bins/:binId/transfer", AuthorizationMiddleware.requirePermissions("warehouse.update"), IdempotencyMiddleware.requireForMutations(), ar(this.controller.transferBinContents));
        this.router.post("/:warehouseId/bins/:binId/merge", AuthorizationMiddleware.requirePermissions("warehouse.update"), IdempotencyMiddleware.requireForMutations(), ar(this.controller.mergeBins));
        this.router.post("/:warehouseId/bins/:binId/split", AuthorizationMiddleware.requirePermissions("warehouse.update"), IdempotencyMiddleware.requireForMutations(), ar(this.controller.splitBin));
        this.router.get("/:warehouseId/bins/:binId", AuthorizationMiddleware.requirePermissions("warehouse.read"), ar(this.controller.getBin));
        this.router.patch("/:warehouseId/bins/:binId", AuthorizationMiddleware.requirePermissions("warehouse.update"), IdempotencyMiddleware.requireForMutations(), ar(this.controller.updateBin));
        this.router.delete("/:warehouseId/bins/:binId", AuthorizationMiddleware.requirePermissions("warehouse.update"), IdempotencyMiddleware.requireForMutations(), ar(this.controller.deleteBin));
        // Putaway Rules & Suggestion Routes
        this.router.get("/:warehouseId/putaway/rules/dashboard", AuthorizationMiddleware.requirePermissions("warehouse.read"), ar(this.controller.getPutawayRulesDashboard));
        this.router.get("/:warehouseId/putaway/rules", AuthorizationMiddleware.requirePermissions("warehouse.read"), ar(this.controller.listPutawayRules));
        this.router.post("/:warehouseId/putaway/rules", AuthorizationMiddleware.requirePermissions("warehouse.update"), IdempotencyMiddleware.requireForMutations(), ar(this.controller.createPutawayRule));
        this.router.post("/:warehouseId/putaway/rules/import", AuthorizationMiddleware.requirePermissions("warehouse.update"), IdempotencyMiddleware.requireForMutations(), ar(this.controller.importPutawayRules));
        this.router.get("/:warehouseId/putaway/rules/export", AuthorizationMiddleware.requirePermissions("warehouse.read"), ar(this.controller.exportPutawayRules));
        this.router.get("/:warehouseId/putaway/rules/:ruleId/details", AuthorizationMiddleware.requirePermissions("warehouse.read"), ar(this.controller.getPutawayRuleDetails));
        this.router.get("/:warehouseId/putaway/rules/:ruleId/history", AuthorizationMiddleware.requirePermissions("warehouse.read"), ar(this.controller.getPutawayRuleHistory));
        this.router.get("/:warehouseId/putaway/rules/:ruleId/activity", AuthorizationMiddleware.requirePermissions("warehouse.read"), ar(this.controller.getPutawayRuleActivity));
        this.router.post("/:warehouseId/putaway/rules/:ruleId/duplicate", AuthorizationMiddleware.requirePermissions("warehouse.update"), IdempotencyMiddleware.requireForMutations(), ar(this.controller.duplicatePutawayRule));
        this.router.post("/:warehouseId/putaway/rules/:ruleId/activate", AuthorizationMiddleware.requirePermissions("warehouse.update"), IdempotencyMiddleware.requireForMutations(), ar(this.controller.activatePutawayRule));
        this.router.post("/:warehouseId/putaway/rules/:ruleId/deactivate", AuthorizationMiddleware.requirePermissions("warehouse.update"), IdempotencyMiddleware.requireForMutations(), ar(this.controller.deactivatePutawayRule));
        this.router.post("/:warehouseId/putaway/rules/:ruleId/test", AuthorizationMiddleware.requirePermissions("warehouse.update"), IdempotencyMiddleware.requireForMutations(), ar(this.controller.testSingleRule));
        this.router.get("/:warehouseId/putaway/rules/:ruleId", AuthorizationMiddleware.requirePermissions("warehouse.read"), ar(this.controller.getPutawayRule));
        this.router.patch("/:warehouseId/putaway/rules/:ruleId", AuthorizationMiddleware.requirePermissions("warehouse.update"), IdempotencyMiddleware.requireForMutations(), ar(this.controller.updatePutawayRule));
        this.router.delete("/:warehouseId/putaway/rules/:ruleId", AuthorizationMiddleware.requirePermissions("warehouse.update"), IdempotencyMiddleware.requireForMutations(), ar(this.controller.deletePutawayRule));
        this.router.post("/:warehouseId/putaway/suggestion", AuthorizationMiddleware.requirePermissions("warehouse.read"), ar(this.controller.testPutawaySuggestion));
        // Putaway Groups Routes
        this.router.get("/:warehouseId/putaway/groups", AuthorizationMiddleware.requirePermissions("warehouse.read"), ar(this.controller.listPutawayRuleGroups));
        this.router.post("/:warehouseId/putaway/groups", AuthorizationMiddleware.requirePermissions("warehouse.update"), IdempotencyMiddleware.requireForMutations(), ar(this.controller.createPutawayRuleGroup));
        this.router.get("/:warehouseId/putaway/groups/:groupId", AuthorizationMiddleware.requirePermissions("warehouse.read"), ar(this.controller.getPutawayRuleGroup));
        this.router.patch("/:warehouseId/putaway/groups/:groupId", AuthorizationMiddleware.requirePermissions("warehouse.update"), IdempotencyMiddleware.requireForMutations(), ar(this.controller.updatePutawayRuleGroup));
        this.router.delete("/:warehouseId/putaway/groups/:groupId", AuthorizationMiddleware.requirePermissions("warehouse.update"), IdempotencyMiddleware.requireForMutations(), ar(this.controller.deletePutawayRuleGroup));
        this.router.post("/:warehouseId/putaway/groups/:groupId/activate", AuthorizationMiddleware.requirePermissions("warehouse.update"), IdempotencyMiddleware.requireForMutations(), ar(this.controller.activatePutawayRuleGroup));
        this.router.post("/:warehouseId/putaway/groups/:groupId/deactivate", AuthorizationMiddleware.requirePermissions("warehouse.update"), IdempotencyMiddleware.requireForMutations(), ar(this.controller.deactivatePutawayRuleGroup));
        // Slotting Strategies Routes
        this.router.get("/:warehouseId/putaway/slotting", AuthorizationMiddleware.requirePermissions("warehouse.read"), ar(this.controller.listSlottingStrategies));
        this.router.post("/:warehouseId/putaway/slotting", AuthorizationMiddleware.requirePermissions("warehouse.update"), IdempotencyMiddleware.requireForMutations(), ar(this.controller.createSlottingStrategy));
        this.router.get("/:warehouseId/putaway/slotting/:strategyId", AuthorizationMiddleware.requirePermissions("warehouse.read"), ar(this.controller.getSlottingStrategy));
        this.router.patch("/:warehouseId/putaway/slotting/:strategyId", AuthorizationMiddleware.requirePermissions("warehouse.update"), IdempotencyMiddleware.requireForMutations(), ar(this.controller.updateSlottingStrategy));
        this.router.delete("/:warehouseId/putaway/slotting/:strategyId", AuthorizationMiddleware.requirePermissions("warehouse.update"), IdempotencyMiddleware.requireForMutations(), ar(this.controller.deleteSlottingStrategy));
        // Slotting Optimization Routes
        this.router.get("/:warehouseId/slotting-optimization/dashboard", AuthorizationMiddleware.requirePermissions("warehouse.slotting.view"), ar(this.controller.getSlottingOptimizationDashboard));
        this.router.get("/:warehouseId/slotting-optimization/layout", AuthorizationMiddleware.requirePermissions("warehouse.slotting.view"), ar(this.controller.getSlottingLayoutComparison));
        this.router.get("/:warehouseId/slotting-optimization/recommendations", AuthorizationMiddleware.requirePermissions("warehouse.slotting.view"), ar(this.controller.listSlottingRecommendations));
        this.router.get("/:warehouseId/slotting-optimization/analytics", AuthorizationMiddleware.requirePermissions("warehouse.slotting.analytics"), ar(this.controller.getSlottingAnalytics));
        this.router.get("/:warehouseId/slotting-optimization/tasks", AuthorizationMiddleware.requirePermissions("warehouse.slotting.view"), ar(this.controller.listSlottingTasks));
        this.router.post("/:warehouseId/slotting-optimization/run", AuthorizationMiddleware.requirePermissions("warehouse.slotting.run"), IdempotencyMiddleware.requireForMutations(), ar(this.controller.runSlottingOptimization));
        this.router.patch("/:warehouseId/slotting-optimization/parameters", AuthorizationMiddleware.requirePermissions("warehouse.slotting.configure"), IdempotencyMiddleware.requireForMutations(), ar(this.controller.updateSlottingParameters));
        this.router.post("/:warehouseId/slotting-optimization/profiles", AuthorizationMiddleware.requirePermissions("warehouse.slotting.configure"), IdempotencyMiddleware.requireForMutations(), ar(this.controller.saveSlottingProfile));
        this.router.post("/:warehouseId/slotting-optimization/recommendations/approve", AuthorizationMiddleware.requirePermissions("warehouse.slotting.approve"), IdempotencyMiddleware.requireForMutations(), ar(this.controller.approveSlottingRecommendations));
        this.router.post("/:warehouseId/slotting-optimization/recommendations/reject", AuthorizationMiddleware.requirePermissions("warehouse.slotting.approve"), IdempotencyMiddleware.requireForMutations(), ar(this.controller.rejectSlottingRecommendations));
        this.router.post("/:warehouseId/slotting-optimization/tasks", AuthorizationMiddleware.requirePermissions("warehouse.slotting.tasks.create"), IdempotencyMiddleware.requireForMutations(), ar(this.controller.createSlottingTasks));
        this.router.post("/:warehouseId/slotting-optimization/export", AuthorizationMiddleware.requirePermissions("warehouse.slotting.export"), IdempotencyMiddleware.requireForMutations(), ar(this.controller.exportSlottingReport));
        this.router.post("/:warehouseId/slotting-optimization/scenarios", AuthorizationMiddleware.requirePermissions("warehouse.slotting.configure"), IdempotencyMiddleware.requireForMutations(), ar(this.controller.saveSlottingScenario));
        // Task Board Routes
        this.router.get("/:warehouseId/tasks", AuthorizationMiddleware.requirePermissions("warehouse.tasks.view"), ar(this.controller.listTasks));
        this.router.get("/:warehouseId/tasks/board", AuthorizationMiddleware.requirePermissions("warehouse.tasks.view"), ar(this.controller.listTasks));
        this.router.get("/:warehouseId/tasks/analytics", AuthorizationMiddleware.requirePermissions("warehouse.tasks.analytics"), ar(this.controller.getTaskAnalytics));
        this.router.get("/:warehouseId/tasks/templates", AuthorizationMiddleware.requirePermissions("warehouse.tasks.templates.manage"), ar(this.controller.listTaskTemplates));
        this.router.post("/:warehouseId/tasks", AuthorizationMiddleware.requirePermissions("warehouse.tasks.create"), IdempotencyMiddleware.requireForMutations(), ar(this.controller.createTask));
        this.router.post("/:warehouseId/tasks/assign", AuthorizationMiddleware.requirePermissions("warehouse.tasks.assign"), IdempotencyMiddleware.requireForMutations(), ar(this.controller.assignTasks));
        this.router.post("/:warehouseId/tasks/bulk-update", AuthorizationMiddleware.requirePermissions("warehouse.tasks.update"), IdempotencyMiddleware.requireForMutations(), ar(this.controller.bulkUpdateTasks));
        this.router.post("/:warehouseId/tasks/import", AuthorizationMiddleware.requirePermissions("warehouse.tasks.import"), IdempotencyMiddleware.requireForMutations(), ar(this.controller.bulkUpdateTasks));
        this.router.get("/:warehouseId/tasks/export", AuthorizationMiddleware.requirePermissions("warehouse.tasks.export"), ar(this.controller.listTasks));
        this.router.get("/:warehouseId/tasks/:taskId", AuthorizationMiddleware.requirePermissions("warehouse.tasks.view"), ar(this.controller.getTask));
        this.router.patch("/:warehouseId/tasks/:taskId", AuthorizationMiddleware.requirePermissions("warehouse.tasks.update"), IdempotencyMiddleware.requireForMutations(), ar(this.controller.updateTask));
        this.router.patch("/:warehouseId/tasks/:taskId/status", AuthorizationMiddleware.requirePermissions("warehouse.tasks.update"), IdempotencyMiddleware.requireForMutations(), ar(this.controller.updateTaskStatus));
        this.router.patch("/:warehouseId/tasks/:taskId/priority", AuthorizationMiddleware.requirePermissions("warehouse.tasks.update"), IdempotencyMiddleware.requireForMutations(), ar(this.controller.updateTaskPriority));
        this.router.patch("/:warehouseId/tasks/:taskId/progress", AuthorizationMiddleware.requirePermissions("warehouse.tasks.update"), IdempotencyMiddleware.requireForMutations(), ar(this.controller.updateTaskProgress));
        this.router.post("/:warehouseId/tasks/:taskId/complete", AuthorizationMiddleware.requirePermissions("warehouse.tasks.complete"), IdempotencyMiddleware.requireForMutations(), ar(this.controller.completeTask));
        this.router.post("/:warehouseId/tasks/:taskId/cancel", AuthorizationMiddleware.requirePermissions("warehouse.tasks.update"), IdempotencyMiddleware.requireForMutations(), ar(this.controller.cancelTask));
        this.router.post("/:warehouseId/tasks/:taskId/notes", AuthorizationMiddleware.requirePermissions("warehouse.tasks.update"), IdempotencyMiddleware.requireForMutations(), ar(this.controller.addTaskNote));
        this.router.post("/:warehouseId/tasks/:taskId/attachments", AuthorizationMiddleware.requirePermissions("warehouse.tasks.update"), IdempotencyMiddleware.requireForMutations(), ar(this.controller.addTaskAttachment));
        // Pick Wave Routes
        this.router.get("/:warehouseId/pick-waves/dashboard", AuthorizationMiddleware.requirePermissions("warehouse.read"), ar(this.controller.getPickWaveDashboard));
        this.router.get("/:warehouseId/pick-waves/available-orders", AuthorizationMiddleware.requirePermissions("warehouse.read"), ar(this.controller.listAvailableOrderPool));
        this.router.post("/:warehouseId/pick-waves/auto-group", AuthorizationMiddleware.requirePermissions("warehouse.update"), IdempotencyMiddleware.requireForMutations(), ar(this.controller.autoGroupOrdersIntoWaves));
        // Wave Templates
        this.router.get("/:warehouseId/pick-waves/templates", AuthorizationMiddleware.requirePermissions("warehouse.read"), ar(this.controller.listWaveTemplates));
        this.router.post("/:warehouseId/pick-waves/templates", AuthorizationMiddleware.requirePermissions("warehouse.update"), IdempotencyMiddleware.requireForMutations(), ar(this.controller.createWaveTemplate));
        this.router.get("/:warehouseId/pick-waves/templates/:templateId", AuthorizationMiddleware.requirePermissions("warehouse.read"), ar(this.controller.getWaveTemplate));
        this.router.patch("/:warehouseId/pick-waves/templates/:templateId", AuthorizationMiddleware.requirePermissions("warehouse.update"), IdempotencyMiddleware.requireForMutations(), ar(this.controller.updateWaveTemplate));
        this.router.delete("/:warehouseId/pick-waves/templates/:templateId", AuthorizationMiddleware.requirePermissions("warehouse.update"), IdempotencyMiddleware.requireForMutations(), ar(this.controller.deleteWaveTemplate));
        this.router.post("/:warehouseId/pick-waves/templates/:templateId/apply", AuthorizationMiddleware.requirePermissions("warehouse.update"), IdempotencyMiddleware.requireForMutations(), ar(this.controller.applyWaveTemplate));
        // Waves CRUD & Actions
        this.router.get("/:warehouseId/pick-waves", AuthorizationMiddleware.requirePermissions("warehouse.read"), ar(this.controller.listPickWaves));
        this.router.post("/:warehouseId/pick-waves", AuthorizationMiddleware.requirePermissions("warehouse.update"), IdempotencyMiddleware.requireForMutations(), ar(this.controller.createPickWave));
        this.router.get("/:warehouseId/pick-waves/:waveId/details", AuthorizationMiddleware.requirePermissions("warehouse.read"), ar(this.controller.getPickWaveDetails));
        this.router.post("/:warehouseId/pick-waves/:waveId/release", AuthorizationMiddleware.requirePermissions("warehouse.update"), IdempotencyMiddleware.requireForMutations(), ar(this.controller.releasePickWave));
        this.router.post("/:warehouseId/pick-waves/:waveId/cancel", AuthorizationMiddleware.requirePermissions("warehouse.update"), IdempotencyMiddleware.requireForMutations(), ar(this.controller.cancelPickWave));
        this.router.post("/:warehouseId/pick-waves/:waveId/duplicate", AuthorizationMiddleware.requirePermissions("warehouse.update"), IdempotencyMiddleware.requireForMutations(), ar(this.controller.duplicatePickWave));
        this.router.post("/:warehouseId/pick-waves/:waveId/assign-pickers", AuthorizationMiddleware.requirePermissions("warehouse.update"), IdempotencyMiddleware.requireForMutations(), ar(this.controller.assignWavePickers));
        this.router.post("/:warehouseId/pick-waves/:waveId/recalculate", AuthorizationMiddleware.requirePermissions("warehouse.update"), IdempotencyMiddleware.requireForMutations(), ar(this.controller.recalculateWave));
        this.router.get("/:warehouseId/pick-waves/:waveId", AuthorizationMiddleware.requirePermissions("warehouse.read"), ar(this.controller.getPickWave));
        this.router.patch("/:warehouseId/pick-waves/:waveId", AuthorizationMiddleware.requirePermissions("warehouse.update"), IdempotencyMiddleware.requireForMutations(), ar(this.controller.updatePickWave));
        this.router.delete("/:warehouseId/pick-waves/:waveId", AuthorizationMiddleware.requirePermissions("warehouse.update"), IdempotencyMiddleware.requireForMutations(), ar(this.controller.deletePickWave));
        // Pick List Routes
        this.router.get("/:warehouseId/pick-lists/dashboard", AuthorizationMiddleware.requirePermissions("warehouse.read"), ar(this.controller.getPickListDashboard));
        this.router.get("/:warehouseId/pick-lists/picker-performance", AuthorizationMiddleware.requirePermissions("warehouse.read"), ar(this.controller.listPickerPerformance));
        this.router.get("/:warehouseId/pick-lists/picker-workloads", AuthorizationMiddleware.requirePermissions("warehouse.read"), ar(this.controller.listPickerWorkloads));
        this.router.get("/:warehouseId/pick-lists", AuthorizationMiddleware.requirePermissions("warehouse.read"), ar(this.controller.listPickLists));
        this.router.post("/:warehouseId/pick-lists", AuthorizationMiddleware.requirePermissions("warehouse.update"), IdempotencyMiddleware.requireForMutations(), ar(this.controller.createPickList));
        this.router.get("/:warehouseId/pick-lists/:pickListId/details", AuthorizationMiddleware.requirePermissions("warehouse.read"), ar(this.controller.getPickListDetails));
        this.router.post("/:warehouseId/pick-lists/:pickListId/assign", AuthorizationMiddleware.requirePermissions("warehouse.update"), IdempotencyMiddleware.requireForMutations(), ar(this.controller.assignPicker));
        this.router.post("/:warehouseId/pick-lists/:pickListId/priority", AuthorizationMiddleware.requirePermissions("warehouse.update"), IdempotencyMiddleware.requireForMutations(), ar(this.controller.changePriority));
        this.router.post("/:warehouseId/pick-lists/:pickListId/status", AuthorizationMiddleware.requirePermissions("warehouse.update"), IdempotencyMiddleware.requireForMutations(), ar(this.controller.updateStatus));
        this.router.post("/:warehouseId/pick-lists/:pickListId/scan", AuthorizationMiddleware.requirePermissions("warehouse.update"), IdempotencyMiddleware.requireForMutations(), ar(this.controller.recordScan));
        this.router.post("/:warehouseId/pick-lists/:pickListId/short-pick", AuthorizationMiddleware.requirePermissions("warehouse.update"), IdempotencyMiddleware.requireForMutations(), ar(this.controller.recordShortPick));
        this.router.post("/:warehouseId/pick-lists/:pickListId/items/:itemId/confirm", AuthorizationMiddleware.requirePermissions("warehouse.update"), IdempotencyMiddleware.requireForMutations(), ar(this.controller.confirmPickItem));
        this.router.post("/:warehouseId/pick-lists/:pickListId/skip", AuthorizationMiddleware.requirePermissions("warehouse.update"), IdempotencyMiddleware.requireForMutations(), ar(this.controller.skipLocation));
        this.router.post("/:warehouseId/pick-lists/:pickListId/issue", AuthorizationMiddleware.requirePermissions("warehouse.update"), IdempotencyMiddleware.requireForMutations(), ar(this.controller.reportIssue));
        this.router.post("/:warehouseId/pick-lists/:pickListId/note", AuthorizationMiddleware.requirePermissions("warehouse.update"), IdempotencyMiddleware.requireForMutations(), ar(this.controller.addNote));
        this.router.get("/:warehouseId/pick-lists/:pickListId", AuthorizationMiddleware.requirePermissions("warehouse.read"), ar(this.controller.getPickList));
        this.router.patch("/:warehouseId/pick-lists/:pickListId", AuthorizationMiddleware.requirePermissions("warehouse.update"), IdempotencyMiddleware.requireForMutations(), ar(this.controller.updatePickList));
        this.router.delete("/:warehouseId/pick-lists/:pickListId", AuthorizationMiddleware.requirePermissions("warehouse.update"), IdempotencyMiddleware.requireForMutations(), ar(this.controller.deletePickList));
        this.registerPackingWorkbenchRoutes(this.router, "/:warehouseId/packing-workbenches");
        this.router.get("/:warehouseId", AuthorizationMiddleware.requirePermissions("warehouse.read"), ar(this.controller.get));
        this.router.patch("/:warehouseId", AuthorizationMiddleware.requirePermissions("warehouse.update"), IdempotencyMiddleware.requireForMutations(), ar(this.controller.update));
        this.router.post("/:warehouseId/default", AuthorizationMiddleware.requirePermissions("warehouse.update"), IdempotencyMiddleware.requireForMutations(), ar(this.controller.setDefault));
        this.router.get("/:warehouseId/summary", AuthorizationMiddleware.requirePermissions("warehouse.read"), ar(this.controller.summary));
        this.router.get("/:warehouseId/configuration", AuthorizationMiddleware.requirePermissions("warehouse.read"), ar(this.controller.getConfiguration));
        this.router.put("/:warehouseId/configuration", AuthorizationMiddleware.requirePermissions("warehouse.update"), IdempotencyMiddleware.requireForMutations(), ar(this.controller.updateConfiguration));
        this.router.get("/:warehouseId/staff", AuthorizationMiddleware.requirePermissions("warehouse.read"), ar(this.controller.listStaff));
        this.router.post("/:warehouseId/staff", AuthorizationMiddleware.requirePermissions("warehouse.update"), IdempotencyMiddleware.requireForMutations(), ar(this.controller.assignStaff));
        this.router.delete("/:warehouseId", AuthorizationMiddleware.requirePermissions("warehouse.update"), IdempotencyMiddleware.requireForMutations(), ar(this.controller.delete));
    }
    registerPackingWorkbenchRoutes(router, prefix) {
        router.get(`${prefix}/summary`, AuthorizationMiddleware.requirePermissions("warehouse.read"), ar(this.controller.getPackingSummary));
        router.get(`${prefix}/top-packers`, AuthorizationMiddleware.requirePermissions("warehouse.read"), ar(this.controller.getPackingTopPackers));
        router.get(`${prefix}/station-utilization`, AuthorizationMiddleware.requirePermissions("warehouse.read"), ar(this.controller.getPackingStationUtilization));
        router.get(`${prefix}/recent-activity`, AuthorizationMiddleware.requirePermissions("warehouse.read"), ar(this.controller.getPackingRecentActivity));
        router.get(`${prefix}/`, AuthorizationMiddleware.requirePermissions("warehouse.read"), ar(this.controller.listPackingWorkbenches));
        router.post(`${prefix}/`, AuthorizationMiddleware.requirePermissions("warehouse.pack.execute"), IdempotencyMiddleware.requireForMutations(), ar(this.controller.createPackingWorkbench));
        router.post(`${prefix}/cartons/:cartonId/seal`, AuthorizationMiddleware.requirePermissions("warehouse.pack.execute"), IdempotencyMiddleware.requireForMutations(), ar(this.controller.sealPackingCarton));
        router.post(`${prefix}/cartons/:cartonId/reopen`, AuthorizationMiddleware.requirePermissions("warehouse.pack.execute"), IdempotencyMiddleware.requireForMutations(), ar(this.controller.reopenPackingCarton));
        router.get(`${prefix}/:id/documents`, AuthorizationMiddleware.requirePermissions("warehouse.read"), ar(this.controller.listPackingDocuments));
        router.post(`${prefix}/:id/generate-packing-slip`, AuthorizationMiddleware.requirePermissions("warehouse.pack.execute"), IdempotencyMiddleware.requireForMutations(), ar(this.controller.generatePackingSlip));
        router.post(`${prefix}/:id/generate-carton-labels`, AuthorizationMiddleware.requirePermissions("warehouse.pack.execute"), IdempotencyMiddleware.requireForMutations(), ar(this.controller.generateCartonLabels));
        router.post(`${prefix}/:id/cartons`, AuthorizationMiddleware.requirePermissions("warehouse.pack.execute"), IdempotencyMiddleware.requireForMutations(), ar(this.controller.createPackingCarton));
        router.post(`${prefix}/:id/scan`, AuthorizationMiddleware.requirePermissions("warehouse.pack.execute"), IdempotencyMiddleware.requireForMutations(), ar(this.controller.scanPackingItem));
        router.post(`${prefix}/:id/pack-item`, AuthorizationMiddleware.requirePermissions("warehouse.pack.execute"), IdempotencyMiddleware.requireForMutations(), ar(this.controller.packPackingItem));
        router.post(`${prefix}/:id/short-picks`, AuthorizationMiddleware.requirePermissions("warehouse.pack.execute"), IdempotencyMiddleware.requireForMutations(), ar(this.controller.createPackingShortPick));
        router.post(`${prefix}/:id/complete`, AuthorizationMiddleware.requirePermissions("warehouse.pack.execute"), IdempotencyMiddleware.requireForMutations(), ar(this.controller.completePackingWorkbench));
        router.post(`${prefix}/:id/assign`, AuthorizationMiddleware.requirePermissions("warehouse.task.manage"), IdempotencyMiddleware.requireForMutations(), ar(this.controller.assignPackingWorkbench));
        router.post(`${prefix}/:id/status`, AuthorizationMiddleware.requirePermissions("warehouse.task.manage"), IdempotencyMiddleware.requireForMutations(), ar(this.controller.updatePackingWorkbenchStatus));
        router.get(`${prefix}/:id`, AuthorizationMiddleware.requirePermissions("warehouse.read"), ar(this.controller.getPackingWorkbench));
        router.patch(`${prefix}/:id`, AuthorizationMiddleware.requirePermissions("warehouse.pack.execute"), IdempotencyMiddleware.requireForMutations(), ar(this.controller.updatePackingWorkbench));
        router.delete(`${prefix}/:id`, AuthorizationMiddleware.requirePermissions("warehouse.task.manage"), IdempotencyMiddleware.requireForMutations(), ar(this.controller.deletePackingWorkbench));
        router.post(`${prefix}/:id/notes`, AuthorizationMiddleware.requirePermissions("warehouse.pack.execute"), IdempotencyMiddleware.requireForMutations(), ar(this.controller.addPackingNote));
        router.post(`${prefix}/:id/move-to-shipment`, AuthorizationMiddleware.requirePermissions("warehouse.pack.execute"), IdempotencyMiddleware.requireForMutations(), ar(this.controller.moveToShipmentPreparation));
    }
}
