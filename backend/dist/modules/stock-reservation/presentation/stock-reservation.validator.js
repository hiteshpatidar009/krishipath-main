import { z } from "zod";
export class StockReservationValidator {
    static create = z.object({
        stockItemId: z.string().uuid(),
        sourceType: z.enum(["sales_order", "quotation", "shipment", "manufacturing", "production"]),
        sourceId: z.string().min(1).max(100),
        sourceItemId: z.string().min(1).max(100).optional(),
        quantity: z.coerce.number().positive(),
        expiresAt: z.coerce.date().optional(),
        reservationName: z.string().min(1).max(255).optional(),
        description: z.string().max(1000).optional(),
        priority: z.enum(["high", "medium", "low"]).optional(),
        releaseAfterDate: z.coerce.date().optional(),
        allocationStrategy: z.enum(["fifo", "lifo", "fefo", "standard"]).optional(),
        allowPartialAllocation: z.boolean().optional(),
        holdForFuture: z.boolean().optional(),
        requireApproval: z.boolean().optional(),
        notifyOnExpiry: z.boolean().optional(),
        notes: z.string().max(1000).optional(),
    });
    static list = z.object({
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(20),
        status: z.enum(["pending", "active", "allocated", "fulfilled", "released", "expired", "cancelled"]).optional(),
    });
}
