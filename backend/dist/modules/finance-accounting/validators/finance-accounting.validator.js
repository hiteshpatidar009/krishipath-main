import { z } from "zod";
const uuid = z.string().uuid();
const invoiceType = z.enum(["customer", "purchase"]);
const invoiceStatus = z.enum(["draft", "approved", "sent", "paid", "partially_paid", "overdue", "cancelled", "closed"]);
export class FinanceAccountingValidator {
    static invoice = z.object({
        organizationId: uuid.optional(),
        invoiceType,
        customerId: uuid.optional(),
        supplierId: uuid.optional(),
        purchaseOrderId: uuid.optional(),
        goodsReceiptId: uuid.optional(),
        invoiceDate: z.string().min(8).max(20),
        dueDate: z.string().min(8).max(20),
        currencyCode: z.string().min(3).max(3).default("INR"),
        notes: z.string().max(4000).optional(),
        attachments: z.array(z.object({
            fileKey: z.string().min(2).max(500),
            fileName: z.string().min(1).max(255),
        })).default([]),
        lines: z.array(z.object({
            productId: uuid.optional(),
            productVariantId: uuid.optional(),
            description: z.string().min(2).max(500),
            quantity: z.coerce.number().positive(),
            unitPrice: z.coerce.number().nonnegative(),
            discountAmount: z.coerce.number().nonnegative().default(0),
            taxRate: z.coerce.number().min(0).max(100).default(0),
            taxType: z.enum(["gst", "vat", "sales_tax", "exempt"]).default("gst"),
        })).min(1),
    }).superRefine((input, ctx) => {
        if (input.invoiceType === "customer" && !input.customerId) {
            ctx.addIssue({ code: "custom", path: ["customerId"], message: "Customer required" });
        }
        if (input.invoiceType === "purchase" && !input.supplierId) {
            ctx.addIssue({ code: "custom", path: ["supplierId"], message: "Supplier required" });
        }
    });
    static update = z.object({
        notes: z.string().max(4000).optional(),
        dueDate: z.string().min(8).max(20).optional(),
    });
    static decision = z.object({
        notes: z.string().max(4000).optional(),
    });
    static payment = z.object({
        amount: z.coerce.number().positive(),
        paymentMethod: z.string().min(2).max(80),
        paymentReference: z.string().min(2).max(160),
        paidAt: z.string().optional(),
    });
    static list = z.object({
        invoiceType: invoiceType.optional(),
        status: invoiceStatus.optional(),
        page: z.coerce.number().int().positive().default(1),
        limit: z.coerce.number().int().positive().max(100).default(20),
    });
}
