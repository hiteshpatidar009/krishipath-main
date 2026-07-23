import { z } from "zod";
export class StockCountingReconciliationValidator {
    // ─── Legacy session validators ───────────────────────────────────────────────
    static createSession = z.object({
        warehouseId: z.string().uuid(),
        zoneId: z.string().uuid().optional(),
        binId: z.string().uuid().optional(),
        skuId: z.string().uuid().optional(),
        countType: z.enum(["full_physical", "cycle_count", "spot_count", "blind_count", "scheduled_count", "ad_hoc"]),
        scheduledAt: z.coerce.date().optional(),
        supervisorId: z.string().uuid().optional(),
        counterIds: z.array(z.string().uuid()).default([]),
        blindCount: z.boolean().default(false),
        metadata: z.record(z.string(), z.unknown()).default({}),
    });
    static recordCount = z.object({
        stockItemId: z.string().uuid(),
        countedQuantity: z.coerce.number().nonnegative(),
        method: z.enum(["manual", "qr_scan", "barcode_scan", "mobile_scan"]).default("manual"),
        notes: z.string().max(1000).optional(),
        evidence: z.record(z.string(), z.unknown()).default({}),
    });
    static listSessions = z.object({
        warehouseId: z.string().uuid().optional(),
        status: z.enum(["draft", "scheduled", "in_progress", "completed", "approved", "cancelled"]).optional(),
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(20),
    });
    static listDiscrepancies = z.object({
        status: z.enum(["open", "investigating", "approved", "adjustment_requested", "closed"]).optional(),
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(20),
    });
    static calculateCoverage = z.object({
        warehouseId: z.string().uuid("warehouseId must be a valid UUID"),
        selectedZoneIds: z.array(z.string().uuid()),
        includeZeroStock: z.boolean().default(true),
        includeInactiveItems: z.boolean().default(false),
    });
    // ─── Stock Take Plan validators ──────────────────────────────────────────────
    static createStockTakePlan = z.object({
        warehouseId: z.string().uuid("warehouseId must be a valid UUID"),
        planName: z.string().min(1, "Plan name is required").max(255),
        planType: z.enum(["full_count", "cycle_count", "spot_count"]),
        countMethod: z.enum(["zone_based", "bin_based", "sku_based"]),
        description: z.string().max(2000).optional(),
        selectedZoneIds: z.array(z.string().uuid()).min(1, "At least one zone must be selected"),
        includeZeroStock: z.boolean().default(true),
        includeInactiveItems: z.boolean().default(false),
        startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "startDate must be YYYY-MM-DD"),
        startTime: z.string().regex(/^\d{2}:\d{2}$/, "startTime must be HH:MM"),
        endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "endDate must be YYYY-MM-DD"),
        endTime: z.string().regex(/^\d{2}:\d{2}$/, "endTime must be HH:MM"),
        bufferDays: z.coerce.number().int().min(0).max(30).default(0),
        teamLeadId: z.string().uuid("teamLeadId must be a valid UUID"),
        counterIds: z.array(z.string().uuid()).min(1, "At least one counter must be assigned"),
        backupCounterIds: z.array(z.string().uuid()).default([]),
        twoStepCounting: z.boolean().default(false),
        lockInventory: z.boolean().default(true),
        allowPartialCounts: z.boolean().default(true),
        generateCountSheets: z.boolean().default(true),
        sendNotifications: z.boolean().default(true),
        varianceThreshold: z.coerce.number().min(0).max(100).default(5),
        requiresApproval: z.boolean().default(false),
        approverId: z.string().uuid().optional(),
    }).refine((d) => d.endDate >= d.startDate, {
        message: "End date must be on or after start date",
        path: ["endDate"],
    }).refine((d) => !d.requiresApproval || !!d.approverId, {
        message: "approverId is required when requiresApproval is true",
        path: ["approverId"],
    }).refine((d) => {
        const counterSet = new Set(d.counterIds);
        return d.backupCounterIds.every((id) => !counterSet.has(id));
    }, {
        message: "Backup counters cannot also be assigned as primary counters",
        path: ["backupCounterIds"],
    });
    static updateStockTakePlan = z.object({
        planName: z.string().min(1).max(255).optional(),
        planType: z.enum(["full_count", "cycle_count", "spot_count"]).optional(),
        countMethod: z.enum(["zone_based", "bin_based", "sku_based"]).optional(),
        description: z.string().max(2000).optional(),
        selectedZoneIds: z.array(z.string().uuid()).min(1).optional(),
        includeZeroStock: z.boolean().optional(),
        includeInactiveItems: z.boolean().optional(),
        startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
        startTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
        endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
        endTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
        bufferDays: z.coerce.number().int().min(0).max(30).optional(),
        teamLeadId: z.string().uuid().optional(),
        counterIds: z.array(z.string().uuid()).min(1).optional(),
        backupCounterIds: z.array(z.string().uuid()).optional(),
        twoStepCounting: z.boolean().optional(),
        lockInventory: z.boolean().optional(),
        allowPartialCounts: z.boolean().optional(),
        generateCountSheets: z.boolean().optional(),
        sendNotifications: z.boolean().optional(),
        varianceThreshold: z.coerce.number().min(0).max(100).optional(),
        requiresApproval: z.boolean().optional(),
        approverId: z.string().uuid().optional(),
    });
    static listStockTakePlans = z.object({
        warehouseId: z.string().uuid().optional(),
        planType: z.enum(["full_count", "cycle_count", "spot_count"]).optional(),
        status: z.enum(["draft", "scheduled", "ready", "locked", "in_progress", "paused", "completed", "cancelled"]).optional(),
        dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
        dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
        search: z.string().max(200).optional(),
        sortBy: z.enum(["planCode", "planName", "status", "startDate", "createdAt"]).default("createdAt"),
        sortOrder: z.enum(["asc", "desc"]).default("desc"),
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(20),
    });
    static lockInventory = z.object({
        warehouseId: z.string().uuid("warehouseId must be a valid UUID"),
        planId: z.string().uuid("planId must be a valid UUID"),
        estimatedUnlock: z.coerce.date().optional(),
        reason: z.string().max(500).optional(),
    });
    static unlockInventory = z.object({
        reason: z.string().max(500).optional(),
        planId: z.string().uuid("planId must be a valid UUID"),
    });
    static cancelPlan = z.object({
        reason: z.string().max(500).optional(),
    });
    static approveRejectPlan = z.object({
        notes: z.string().max(1000).optional(),
    });
    static extendDeadline = z.object({
        endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "endDate must be YYYY-MM-DD"),
        endTime: z.string().regex(/^\d{2}:\d{2}$/, "endTime must be HH:MM"),
        reason: z.string().max(500).optional(),
    });
    static reassignTeam = z.object({
        teamLeadId: z.string().uuid("teamLeadId must be a valid UUID"),
        counterIds: z.array(z.string().uuid()).min(1, "At least one counter must be assigned"),
        backupCounterIds: z.array(z.string().uuid()).default([]),
    });
}
