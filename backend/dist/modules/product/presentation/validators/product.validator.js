import { z } from "zod";
const uuid = z.string().uuid();
export class ProductValidator {
    static variantAttribute = z.object({
        name: z.string().trim().min(1),
        values: z.array(z.string().trim().min(1)).min(1),
    });
    static create = z.object({
        productCode: z.string().trim().min(2),
        productName: z.string().trim().min(2),
        shortDescription: z.string().optional(),
        longDescription: z.string().optional(),
        categoryId: uuid.optional(),
        brandId: uuid.optional(),
        defaultUomId: uuid.optional(),
        productType: z.enum(["stockable", "sellable", "service", "bundle"]).default("stockable"),
        productStatus: z.enum(["draft", "active", "inactive", "archived"]).default("active"),
        tags: z.array(z.string().trim().min(1)).optional(),
        variantAttributes: z.array(ProductValidator.variantAttribute).default([]),
        supplierMappings: z.array(z.record(z.string(), z.unknown())).optional(),
        inventoryProfile: z.record(z.string(), z.unknown()).optional(),
        warehouseProfile: z.record(z.string(), z.unknown()).optional(),
        taxProfile: z.record(z.string(), z.unknown()).optional(),
    });
    static update = z.object({
        productName: z.string().trim().min(2).optional(),
        shortDescription: z.string().optional(),
        longDescription: z.string().optional(),
        productStatus: z.enum(["draft", "active", "inactive", "archived"]).optional(),
        tags: z.array(z.string().trim().min(1)).optional(),
    });
    static list = z.object({
        page: z.coerce.number().int().min(1).default(1),
        limit: z.coerce.number().int().min(1).max(100).default(20),
        search: z.string().optional(),
        status: z.string().optional(),
    });
    static category = z.object({
        categoryCode: z.string().trim().min(2),
        categoryName: z.string().trim().min(2),
        description: z.string().optional(),
        parentCategoryId: uuid.optional(),
    });
    static brand = z.object({
        brandCode: z.string().trim().min(2),
        brandName: z.string().trim().min(2),
        description: z.string().optional(),
        website: z.string().url().optional(),
    });
    static unit = z.object({
        uomCode: z.string().trim().min(1),
        uomName: z.string().trim().min(1),
        uomCategory: z.string().trim().min(1),
        decimalPrecision: z.number().int().min(0).max(6).optional(),
    });
}
