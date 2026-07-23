import { z } from "zod";
const pagination = {
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
};
export class InventoryValidator {
    static receive = z.object({
        skuId: z.string().uuid(),
        warehouseId: z.string().uuid(),
        zoneId: z.string().uuid().optional(),
        binId: z.string().uuid().optional(),
        quantity: z.coerce.number().positive(),
        unitCost: z.coerce.number().nonnegative().optional(),
        referenceType: z.string().min(2).max(50),
        referenceId: z.string().min(1).max(100).optional(),
        metadata: z.record(z.string(), z.unknown()).optional(),
    });
    static balances = z.object({
        ...pagination,
        warehouseId: z.string().uuid().optional(),
        skuId: z.string().uuid().optional(),
        binId: z.string().uuid().optional(),
        tab: z.enum(["top_by_quantity", "top_by_value", "low_stock", "near_expiry", "recently_added"]).optional(),
        search: z.string().optional(),
        skuSearch: z.string().optional(),
        productSearch: z.string().optional(),
        barcodeSearch: z.string().optional(),
        categoryId: z.string().uuid().optional(),
        stockStatus: z.string().optional(),
        sortBy: z.string().optional(),
        sortOrder: z.enum(["asc", "desc"]).optional(),
    });
    static movements = z.object({
        ...pagination,
        stockItemId: z.string().uuid().optional(),
        warehouseId: z.string().uuid().optional(),
        movementType: z.enum([
            "receiving", "adjustment", "reservation", "release", "allocation",
            "transfer", "shipment", "return", "correction",
        ]).optional(),
    });
    static overview = z.object({
        warehouseId: z.string().uuid().optional(),
        locationId: z.string().uuid().optional(),
        categoryId: z.string().uuid().optional(),
        stockStatus: z.string().optional(),
        search: z.string().optional(),
        skuSearch: z.string().optional(),
        productSearch: z.string().optional(),
        barcodeSearch: z.string().optional(),
    });
    static byLocation = z.object({
        ...pagination,
        warehouseId: z.string().uuid().optional(),
        zoneId: z.string().uuid().optional(),
        binId: z.string().uuid().optional(),
        skuId: z.string().uuid().optional(),
        productId: z.string().uuid().optional(),
        search: z.string().optional(),
        skuSearch: z.string().optional(),
        productSearch: z.string().optional(),
        barcodeSearch: z.string().optional(),
        stockStatus: z.string().optional(),
        sortBy: z.string().optional(),
        sortOrder: z.enum(["asc", "desc"]).optional(),
    });
    static locationKpis = z.object({
        warehouseId: z.string().uuid().optional(),
        zoneId: z.string().uuid().optional(),
        binId: z.string().uuid().optional(),
    });
    static agingReport = z.object({
        warehouseId: z.string().uuid().optional(),
        locationId: z.string().uuid().optional(),
        categoryId: z.string().uuid().optional(),
        product: z.string().optional(),
        agingBasisDate: z.string().optional(),
    });
    static agingDetails = z.object({
        ...pagination,
        warehouseId: z.string().uuid().optional(),
        locationId: z.string().uuid().optional(),
        categoryId: z.string().uuid().optional(),
        product: z.string().optional(),
        agingBucket: z.enum(["0-30", "31-60", "61-90", "91-180", "181-270", "271-365", ">365"]).optional(),
        stockType: z.string().optional(),
        movementDays: z.coerce.number().optional(),
        deadStockStatus: z.string().optional(),
        agingBasisDate: z.string().optional(),
    });
    static scan = z.object({
        code: z.string().min(1),
        warehouseId: z.string().uuid().optional(),
    });
    static alerts = z.object({
        ...pagination,
        warehouseId: z.string().uuid().optional(),
        locationId: z.string().uuid().optional(),
        categoryId: z.string().uuid().optional(),
        alertType: z.enum(["low_stock", "out_of_stock", "expiring_soon", "overstock"]).optional(),
        search: z.string().optional(),
        skuSearch: z.string().optional(),
        productSearch: z.string().optional(),
        barcodeSearch: z.string().optional(),
    });
}
