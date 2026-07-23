import { z } from "zod";
const adjustmentTypeEnum = z.string();
const reasonEnum = z.enum([
    "damaged",
    "expired",
    "lost",
    "found",
    "audit_correction",
    "reconciliation",
    "warehouse_error",
    "DAMAGED_GOODS",
    "THEFT",
    "SHRINKAGE",
    "INVENTORY_COUNT",
    "CORRECTION",
    "EXPIRED_GOODS",
    "LOST_INVENTORY",
    "FOUND_INVENTORY",
    "CYCLE_COUNT_VARIANCE",
]);
export class StockAdjustmentValidator {
    static createLine = z.object({
        stockItemId: z.string().uuid().optional(),
        productId: z.string().uuid().optional(),
        productVariantId: z.string().uuid(),
        lotNumber: z.string().optional(),
        batchNumber: z.string().optional(),
        serialNumber: z.string().optional(),
        binLocationId: z.string().uuid().optional(),
        uomId: z.string().uuid().optional(),
        adjustedQuantity: z.coerce.number(),
        unitCost: z.coerce.number().optional(),
        reason: z.string().optional(),
        evidence: z.record(z.string(), z.unknown()).optional(),
        expiryDate: z.string().datetime().optional().transform((val) => val ? new Date(val) : undefined),
    });
    static create = z.object({
        warehouseId: z.string().uuid(),
        stockItemId: z.string().uuid().optional(),
        adjustmentType: adjustmentTypeEnum,
        quantity: z.coerce.number().positive().optional(),
        reason: reasonEnum,
        notes: z.string().max(1000).optional(),
        evidence: z.record(z.string(), z.unknown()).optional(),
        workflowDefinitionId: z.string().uuid().optional(),
        referenceNumber: z.string().optional(),
        department: z.string().optional(),
        reasonCode: z.string().optional(),
        reasonDescription: z.string().optional(),
        adjustmentAccount: z.string().optional(),
        tags: z.record(z.string(), z.unknown()).optional(),
        lines: z.array(StockAdjustmentValidator.createLine).optional(),
        status: z.string().optional(),
        adjustmentDate: z.string().datetime().optional().transform((val) => val ? new Date(val) : undefined),
        locationId: z.string().uuid().optional(),
        approvalRequired: z.coerce.boolean().optional(),
        nextApproverUserId: z.string().uuid().optional(),
        ipAddress: z.string().optional(),
    });
    static update = z.object({
        warehouseId: z.string().uuid().optional(),
        stockItemId: z.string().uuid().optional(),
        adjustmentType: adjustmentTypeEnum.optional(),
        reason: reasonEnum.optional(),
        notes: z.string().max(1000).optional(),
        evidence: z.record(z.string(), z.unknown()).optional(),
        workflowDefinitionId: z.string().uuid().optional(),
        referenceNumber: z.string().optional(),
        department: z.string().optional(),
        reasonCode: z.string().optional(),
        reasonDescription: z.string().optional(),
        adjustmentAccount: z.string().optional(),
        tags: z.record(z.string(), z.unknown()).optional(),
        lines: z.array(StockAdjustmentValidator.createLine).optional(),
        status: z.string().optional(),
        adjustmentDate: z.string().datetime().optional().transform((val) => val ? new Date(val) : undefined),
        locationId: z.string().uuid().optional(),
        approvalRequired: z.coerce.boolean().optional(),
        nextApproverUserId: z.string().uuid().optional(),
        ipAddress: z.string().optional(),
    });
    static list = z.object({
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(20),
        status: z.string().optional(),
        warehouseId: z.string().uuid().optional(),
        startDate: z.string().datetime().optional().transform((val) => val ? new Date(val) : undefined),
        endDate: z.string().datetime().optional().transform((val) => val ? new Date(val) : undefined),
    });
    static validateLine = z.object({
        warehouseId: z.string().uuid(),
        skuId: z.string().uuid(),
        binId: z.string().uuid().optional(),
        quantity: z.coerce.number(),
    });
    static addComment = z.object({
        commentText: z.string().min(1).max(2000),
        commentType: z.enum(["internal", "external", "system"]).default("internal"),
    });
    static addAttachment = z.object({
        fileName: z.string().min(1),
        fileSize: z.coerce.number().int().positive(),
        contentType: z.string().min(1),
        fileUrl: z.string().url(),
    });
    static reassign = z.object({
        reassignedToUserId: z.string().uuid(),
        comments: z.string().optional(),
    });
    static requestChanges = z.object({
        comments: z.string().optional(),
    });
}
