import { z } from "zod";
export class StockTransferValidator {
    static createLineItem = z.object({
        stockItemId: z.string().uuid(),
        quantity: z.coerce.number().positive(),
        lotNumber: z.string().max(100).optional().nullable(),
        batchNumber: z.string().max(100).optional().nullable(),
        serialNumber: z.string().max(100).optional().nullable(),
        sourceBinId: z.string().uuid().optional().nullable(),
        destinationBinId: z.string().uuid().optional().nullable(),
        unitCost: z.coerce.number().nonnegative().optional().nullable(),
    });
    static create = z.object({
        sourceWarehouseId: z.string().uuid(),
        destinationWarehouseId: z.string().uuid(),
        sourceBinId: z.string().uuid().optional().nullable(),
        destinationBinId: z.string().uuid().optional().nullable(),
        notes: z.string().max(1000).optional().nullable(),
        priority: z.enum(["Normal", "High", "Urgent", "Low"]).optional().default("Normal"),
        sourceType: z.string().max(50).optional().default("Warehouse"),
        destinationType: z.string().max(50).optional().default("Warehouse"),
        reason: z.string().max(100).optional().nullable(),
        department: z.string().max(100).optional().nullable(),
        items: z.array(this.createLineItem).min(1),
    });
    static update = z.object({
        notes: z.string().max(1000).optional().nullable(),
        priority: z.enum(["Normal", "High", "Urgent", "Low"]).optional(),
        sourceType: z.string().max(50).optional(),
        destinationType: z.string().max(50).optional(),
        reason: z.string().max(100).optional().nullable(),
        department: z.string().max(100).optional().nullable(),
        items: z.array(this.createLineItem).optional(),
    });
    static list = z.object({
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(20),
        status: z.enum([
            "draft",
            "submitted",
            "pending_approval",
            "approved",
            "rejected",
            "picked",
            "in_transit",
            "partially_received",
            "received",
            "completed",
            "cancelled",
        ]).optional(),
        priority: z.enum(["Normal", "High", "Urgent", "Low"]).optional(),
        sourceWarehouseId: z.string().uuid().optional(),
        destinationWarehouseId: z.string().uuid().optional(),
        sourceBinId: z.string().uuid().optional(),
        destinationBinId: z.string().uuid().optional(),
        reason: z.string().optional(),
        department: z.string().optional(),
        search: z.string().optional(),
        requester: z.string().optional(),
        dateFrom: z.string().optional(),
        dateTo: z.string().optional(),
    });
    static preCheck = z.object({
        sourceWarehouseId: z.string().uuid(),
        destinationWarehouseId: z.string().uuid(),
        sourceBinId: z.string().uuid().optional().nullable(),
        destinationBinId: z.string().uuid().optional().nullable(),
        items: z.array(z.object({
            stockItemId: z.string().uuid(),
            quantity: z.coerce.number().positive(),
        })).min(1),
    });
    static decide = z.object({
        decision: z.enum(["approve", "reject"]),
        comments: z.string().max(1000).optional().default(""),
    }).refine((data) => data.decision !== "reject" || data.comments.trim().length > 0, {
        message: "Comment is required for rejection",
        path: ["comments"],
    });
    static receiveLineItem = z.object({
        itemId: z.string().uuid(),
        quantityReceived: z.coerce.number().nonnegative(),
        quantityRejected: z.coerce.number().nonnegative(),
    });
    static receive = z.object({
        lines: z.array(this.receiveLineItem).min(1),
    });
    static attachment = z.object({
        fileName: z.string().min(1),
        fileType: z.enum(["PDF", "JPG", "PNG", "XLSX"]),
        fileSize: z.coerce.number().positive(),
        fileUrl: z.string().url(),
    });
}
