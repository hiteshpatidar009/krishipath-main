import { z } from "zod";
const uuid = z.string().uuid();
const inspectionType = z.enum(["incoming", "warehouse", "random", "transfer", "return"]);
const status = z.enum(["draft", "pending", "in_progress", "passed", "failed", "partially_passed", "rejected"]);
export class QualityManagementValidator {
    static rule = z.object({
        organizationId: uuid.optional(),
        scope: z.enum(["product", "supplier", "warehouse"]),
        scopeId: uuid,
        inspectionType,
        requiresApproval: z.boolean().default(false),
        isActive: z.boolean().default(true),
    });
    static checklist = z.object({
        organizationId: uuid.optional(),
        name: z.string().min(2).max(160),
        inspectionType,
        items: z.array(z.object({
            label: z.string().min(2).max(240),
            category: z.string().max(120).optional(),
            isRequired: z.boolean().default(true),
        })).min(1),
    });
    static inspection = z.object({
        organizationId: uuid.optional(),
        warehouseId: uuid,
        stockItemId: uuid.optional(),
        productId: uuid.optional(),
        productVariantId: uuid.optional(),
        supplierId: uuid.optional(),
        purchaseOrderId: uuid.optional(),
        goodsReceiptId: uuid.optional(),
        inspectionType,
        checklistId: uuid.optional(),
        sampleSize: z.coerce.number().int().positive().optional(),
        quantityInspected: z.coerce.number().positive().optional(),
        notes: z.string().max(4000).optional(),
        attachments: z.array(z.object({
            fileKey: z.string().min(2).max(500),
            fileName: z.string().min(1).max(255),
            mimeType: z.string().max(120).optional(),
            fileSize: z.coerce.number().int().nonnegative().optional(),
            documentType: z.string().max(80).optional(),
        })).default([]),
    });
    static defect = z.object({
        category: z.string().min(2).max(120),
        severity: z.enum(["minor", "major", "critical"]),
        quantityAffected: z.coerce.number().positive(),
        rootCauseNotes: z.string().max(4000).optional(),
        correctiveAction: z.string().max(4000).optional(),
    });
    static decision = z.object({
        notes: z.string().max(4000).optional(),
    });
    static list = z.object({
        organizationId: uuid.optional(),
        warehouseId: uuid.optional(),
        status: status.optional(),
        inspectionType: inspectionType.optional(),
        page: z.coerce.number().int().positive().default(1),
        limit: z.coerce.number().int().positive().max(100).default(20),
    });
}
