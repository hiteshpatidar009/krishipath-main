import { z } from "zod";
const uuidValue = z.preprocess((value) => {
    if (typeof value === "string") {
        const trimmed = value.trim();
        return trimmed.length > 0 && !trimmed.includes("{{") ? trimmed : undefined;
    }
    return value;
}, z.string().uuid().optional());
const requiredUuidValue = z.preprocess((value) => {
    if (typeof value === "string") {
        const trimmed = value.trim();
        return trimmed.length > 0 && !trimmed.includes("{{") ? trimmed : value;
    }
    return value;
}, z.string().uuid());
const numberValue = z.preprocess((value) => {
    if (typeof value === "string" && value.trim().length > 0) {
        return Number(value);
    }
    return value;
}, z.number());
const normalizePurchaseOrderInput = (value) => {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return value;
    }
    const input = value;
    const sourceItems = Array.isArray(input.items) ? input.items : input.lines;
    const normalizedItems = Array.isArray(sourceItems) ?
        sourceItems.map((item) => {
            if (!item || typeof item !== "object" || Array.isArray(item)) {
                return item;
            }
            const line = item;
            return {
                ...line,
                productId: line.productId ?? line.itemId ?? line.itemID,
                productVariantId: line.productVariantId ?? line.skuId,
                quantityOrdered: line.quantityOrdered ?? line.quantity,
                unitCost: line.unitCost ?? line.unitPrice,
            };
        })
        : sourceItems;
    return {
        ...input,
        purchaseOrderNumber: input.purchaseOrderNumber ??
            `PO-${Date.now()}`,
        expectedDeliveryDate: input.expectedDeliveryDate ?? input.expectedDate,
        currencyCode: input.currencyCode ?? "INR",
        status: input.status ?? "draft",
        items: normalizedItems,
    };
};
export class PurchaseProcurementValidator {
    static listPurchaseOrders = z.object({
        status: z.string().optional(),
        supplierId: z.string().uuid().optional(),
    });
    static listReceipts = z.object({
        purchaseOrderId: z.string().uuid().optional(),
    });
    static supplier = z.object({
        supplierCode: z.string().min(2),
        supplierName: z.string().min(2),
        supplierType: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        website: z.string().url().optional(),
        taxNumber: z.string().optional(),
        paymentTerms: z.string().optional(),
    });
    static purchaseOrder = z.preprocess(normalizePurchaseOrderInput, z.object({
        supplierId: requiredUuidValue,
        warehouseId: requiredUuidValue,
        purchaseOrderNumber: z.string().min(2),
        expectedDeliveryDate: z.string().optional(),
        currencyCode: z.string().length(3),
        status: z.enum(["draft", "approval_required", "approved"]),
        workflowDefinitionId: uuidValue,
        items: z.array(z.object({
            productId: requiredUuidValue,
            productVariantId: uuidValue,
            quantityOrdered: numberValue.pipe(z.number().positive()),
            unitCost: numberValue.pipe(z.number().nonnegative()),
            taxAmount: numberValue.pipe(z.number().nonnegative()).optional(),
            discountAmount: numberValue.pipe(z.number().nonnegative()).optional(),
        })).min(1),
    }));
    static receive = z.object({
        warehouseId: z.string().uuid(),
        items: z.array(z.object({
            purchaseOrderItemId: z.string().uuid(),
            quantityReceived: z.number().nonnegative(),
            quantityRejected: z.number().nonnegative().optional(),
            batchNumber: z.string().optional(),
            expiryDate: z.string().optional(),
        })).min(1),
    });
}
