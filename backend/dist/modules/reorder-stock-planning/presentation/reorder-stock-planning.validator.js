import { z } from "zod";
export class ReorderStockPlanningValidator {
    static createRule = z.object({
        organizationId: z.string().uuid().optional(),
        warehouseId: z.string().uuid().optional(),
        productId: z.string().uuid().optional(),
        skuId: z.string().uuid().optional(),
        scope: z.enum(["organization", "warehouse", "product", "sku"]),
        minimumStock: z.coerce.number().nonnegative(),
        maximumStock: z.coerce.number().nonnegative().optional(),
        reorderPoint: z.coerce.number().nonnegative(),
        reorderQuantity: z.coerce.number().positive(),
        safetyStock: z.coerce.number().nonnegative().optional(),
        leadTimeDays: z.coerce.number().int().nonnegative().optional(),
        supplierLeadTimeDays: z.coerce.number().int().nonnegative().optional(),
        preferredSupplierId: z.string().uuid().optional(),
        reviewMode: z.enum(["automatic", "manual"]).default("manual"),
        isActive: z.boolean().default(true),
        metadata: z.record(z.string(), z.unknown()).default({}),
    });
    static listRules = z.object({
        warehouseId: z.string().uuid().optional(),
        skuId: z.string().uuid().optional(),
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(20),
    });
    static generate = z.object({
        warehouseId: z.string().uuid().optional(),
        skuId: z.string().uuid().optional(),
    });
    static listRecommendations = z.object({
        warehouseId: z.string().uuid().optional(),
        status: z.enum(["draft", "pending_review", "approved", "rejected", "converted_to_purchase_order", "completed"]).optional(),
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(20),
    });
    static reject = z.object({ reason: z.string().min(1).max(500).optional() });
}
