import { randomUUID } from "crypto";
import { and, count, desc, eq, ilike, isNull, or } from "drizzle-orm";
import { Db2Connection } from "../../../../infrastructure/database";
import { AppError } from "../../../../shared/errors/app.error";
import { brandsTable, productCategoriesTable, productsTable, productVariantsTable, unitsOfMeasureTable, } from "../../../../infrastructure/database/postgres/schemas/db2";
import { SkuQrIdentityService } from "../../domain/services/sku-qr-identity.service";
export class PostgresProductRepository {
    qrIdentityService = new SkuQrIdentityService();
    async createProduct(input, skuCandidates) {
        const db = Db2Connection.getInstance();
        const now = new Date();
        const productId = randomUUID();
        try {
            return await db.transaction(async (tx) => {
                await tx.insert(productsTable).values({
                    id: productId,
                    companyId: input.companyId,
                    productCode: input.productCode,
                    categoryId: input.categoryId,
                    brandId: input.brandId,
                    defaultUomId: input.defaultUomId,
                    productName: input.productName,
                    shortDescription: input.shortDescription,
                    longDescription: input.longDescription,
                    productType: input.productType ?? "stockable",
                    productStatus: input.productStatus ?? "active",
                    lifecycleStatus: "draft",
                    tags: input.tags ? [...input.tags] : [],
                    searchMetadata: {
                        productCode: input.productCode,
                        productName: input.productName,
                        tags: input.tags ?? [],
                    },
                    createdAt: now,
                    updatedAt: now,
                    version: 1,
                });
                const skuIds = [];
                for (const candidate of skuCandidates) {
                    const skuId = randomUUID();
                    const qr = this.qrIdentityService.create({
                        companyId: input.companyId,
                        productId,
                        skuId,
                        skuCode: candidate.skuCode,
                        attributes: candidate.attributes,
                        version: 1,
                    });
                    skuIds.push(skuId);
                    await tx.insert(productVariantsTable).values({
                        id: skuId,
                        companyId: input.companyId,
                        productId,
                        variantCode: candidate.variantCode,
                        variantName: candidate.variantName,
                        variantAttributes: candidate.attributes,
                        color: candidate.attributes.Color ?? candidate.attributes.color,
                        size: candidate.attributes.Size ?? candidate.attributes.size,
                        material: candidate.attributes.Material ?? candidate.attributes.material,
                        sku: candidate.skuCode,
                        skuStatus: "active",
                        qrCode: qr.qrCode,
                        qrIdentifier: qr.qrIdentifier,
                        qrPayload: qr.qrPayload,
                        qrChecksum: qr.qrChecksum,
                        supplierMappings: input.supplierMappings ? [...input.supplierMappings] : [],
                        inventoryProfile: input.inventoryProfile ?? {},
                        warehouseProfile: input.warehouseProfile ?? {},
                        taxProfile: input.taxProfile ?? {},
                        createdAt: now,
                        updatedAt: now,
                        version: 1,
                    });
                }
                return { productId, skuIds };
            });
        }
        catch (error) {
            if (this.isUniqueConstraintError(error)) {
                throw new AppError("Product code or SKU already exists", 409, "PRODUCT_DUPLICATE");
            }
            throw error;
        }
    }
    async findProductByCode(companyId, productCode) {
        const rows = await Db2Connection.getInstance()
            .select(this.productShape())
            .from(productsTable)
            .where(and(eq(productsTable.companyId, companyId), eq(productsTable.productCode, productCode), isNull(productsTable.deletedAt)))
            .limit(1);
        return rows[0] ?? null;
    }
    async listProducts(query) {
        const db = Db2Connection.getInstance();
        const filters = [eq(productsTable.companyId, query.companyId), isNull(productsTable.deletedAt)];
        if (query.status) {
            filters.push(eq(productsTable.productStatus, query.status));
        }
        if (query.search) {
            const search = `%${query.search}%`;
            filters.push(or(ilike(productsTable.productName, search), ilike(productsTable.productCode, search)));
        }
        const where = and(...filters);
        const offset = (query.page - 1) * query.limit;
        const [totalRow] = await db.select({ total: count() }).from(productsTable).where(where);
        const items = await db
            .select(this.productShape())
            .from(productsTable)
            .where(where)
            .orderBy(desc(productsTable.createdAt))
            .limit(query.limit)
            .offset(offset);
        return { items, total: Number(totalRow?.total ?? 0) };
    }
    async findProductById(companyId, productId) {
        const rows = await Db2Connection.getInstance()
            .select(this.productShape())
            .from(productsTable)
            .where(and(eq(productsTable.id, productId), eq(productsTable.companyId, companyId), isNull(productsTable.deletedAt)))
            .limit(1);
        return rows[0] ?? null;
    }
    async listSkus(companyId, productId) {
        return Db2Connection.getInstance()
            .select(this.skuShape())
            .from(productVariantsTable)
            .where(and(eq(productVariantsTable.companyId, companyId), eq(productVariantsTable.productId, productId), isNull(productVariantsTable.deletedAt)))
            .orderBy(productVariantsTable.sku);
    }
    async findSkuById(companyId, skuId) {
        const rows = await Db2Connection.getInstance()
            .select(this.skuShape())
            .from(productVariantsTable)
            .where(and(eq(productVariantsTable.id, skuId), eq(productVariantsTable.companyId, companyId), isNull(productVariantsTable.deletedAt)))
            .limit(1);
        return rows[0] ?? null;
    }
    async updateProduct(input) {
        await Db2Connection.getInstance()
            .update(productsTable)
            .set({
            productName: input.productName,
            shortDescription: input.shortDescription,
            longDescription: input.longDescription,
            productStatus: input.productStatus,
            tags: input.tags ? [...input.tags] : undefined,
            updatedAt: new Date(),
        })
            .where(and(eq(productsTable.id, input.productId), eq(productsTable.companyId, input.companyId), isNull(productsTable.deletedAt)));
    }
    async archiveSku(companyId, skuId) {
        await Db2Connection.getInstance()
            .update(productVariantsTable)
            .set({ skuStatus: "archived", deletedAt: new Date(), updatedAt: new Date() })
            .where(and(eq(productVariantsTable.id, skuId), eq(productVariantsTable.companyId, companyId), isNull(productVariantsTable.deletedAt)));
    }
    async createCategory(input) {
        const categoryId = randomUUID();
        await Db2Connection.getInstance().insert(productCategoriesTable).values({
            id: categoryId,
            companyId: input.companyId,
            parentCategoryId: input.parentCategoryId,
            categoryCode: input.categoryCode,
            categoryName: input.categoryName,
            description: input.description,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        return { categoryId };
    }
    async listCategories(companyId) {
        return Db2Connection.getInstance().select().from(productCategoriesTable).where(eq(productCategoriesTable.companyId, companyId));
    }
    async createBrand(input) {
        const brandId = randomUUID();
        await Db2Connection.getInstance().insert(brandsTable).values({
            id: brandId,
            companyId: input.companyId,
            brandCode: input.brandCode,
            brandName: input.brandName,
            description: input.description,
            website: input.website,
            createdAt: new Date(),
        });
        return { brandId };
    }
    async listBrands(companyId) {
        return Db2Connection.getInstance().select().from(brandsTable).where(eq(brandsTable.companyId, companyId));
    }
    async createUnit(input) {
        const uomId = randomUUID();
        await Db2Connection.getInstance().insert(unitsOfMeasureTable).values({
            id: uomId,
            companyId: input.companyId,
            uomCode: input.uomCode,
            uomName: input.uomName,
            uomCategory: input.uomCategory,
            decimalPrecision: input.decimalPrecision ?? 0,
            createdAt: new Date(),
        });
        return { uomId };
    }
    async listUnits(companyId) {
        return Db2Connection.getInstance().select().from(unitsOfMeasureTable).where(eq(unitsOfMeasureTable.companyId, companyId));
    }
    productShape() {
        return {
            id: productsTable.id,
            companyId: productsTable.companyId,
            productCode: productsTable.productCode,
            productName: productsTable.productName,
            productStatus: productsTable.productStatus,
            shortDescription: productsTable.shortDescription,
            longDescription: productsTable.longDescription,
            createdAt: productsTable.createdAt,
            updatedAt: productsTable.updatedAt,
        };
    }
    skuShape() {
        return {
            id: productVariantsTable.id,
            companyId: productVariantsTable.companyId,
            productId: productVariantsTable.productId,
            sku: productVariantsTable.sku,
            variantCode: productVariantsTable.variantCode,
            variantName: productVariantsTable.variantName,
            skuStatus: productVariantsTable.skuStatus,
            qrCode: productVariantsTable.qrCode,
            qrIdentifier: productVariantsTable.qrIdentifier,
            qrPayload: productVariantsTable.qrPayload,
            qrChecksum: productVariantsTable.qrChecksum,
            variantAttributes: productVariantsTable.variantAttributes,
        };
    }
    isUniqueConstraintError(error) {
        const errorLike = error;
        const code = String(errorLike.code ?? errorLike.cause?.code ?? "");
        const constraint = String(errorLike.constraint ?? errorLike.cause?.constraint ?? "");
        return (code === "23505" &&
            (constraint.includes("products") || constraint.includes("product")));
    }
}
