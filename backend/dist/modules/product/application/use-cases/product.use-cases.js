import { CoreEventBus, EventEnvelopeFactory } from "../../../../core";
import { AppError } from "../../../../shared/errors/app.error";
import { VariantCombinationService } from "../../domain/services/variant-combination.service";
import { ProductEvents } from "../../events/product.events";
import { SubscriptionLimitService } from "../../../subscription";
export class CreateProductUseCase {
    repository;
    variantCombinationService = new VariantCombinationService();
    constructor(repository) {
        this.repository = repository;
    }
    async execute(input) {
        await SubscriptionLimitService.assertCanCreateProduct(input.companyId);
        const existingProduct = await this.repository.findProductByCode(input.companyId, input.productCode);
        if (existingProduct) {
            throw new AppError("Product code already exists", 409, "PRODUCT_CODE_EXISTS");
        }
        const skuCandidates = this.variantCombinationService.generate(input.productCode, input.variantAttributes);
        const result = await this.repository.createProduct(input, skuCandidates);
        await this.publish(ProductEvents.productCreated, result.productId, input.companyId, { productId: result.productId });
        for (const skuId of result.skuIds) {
            await this.publish(ProductEvents.skuCreated, skuId, input.companyId, {
                productId: result.productId,
                skuId,
            });
            await this.publish(ProductEvents.skuQrGenerated, skuId, input.companyId, {
                productId: result.productId,
                skuId,
            });
        }
        await SubscriptionLimitService.checkProductLimit(input.companyId, undefined);
        return { ...result, skuCount: result.skuIds.length };
    }
    async publish(name, id, companyId, payload) {
        await CoreEventBus.publish(EventEnvelopeFactory.create({
            id,
            name,
            source: "product",
            payload,
            metadata: { companyId },
        }));
    }
}
export class ListProductsUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(query) {
        const result = await this.repository.listProducts(query);
        return { ...result, page: query.page, limit: query.limit };
    }
}
export class GetProductUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(companyId, productId) {
        const product = await this.repository.findProductById(companyId, productId);
        if (!product) {
            throw new AppError("Product not found", 404, "PRODUCT_NOT_FOUND");
        }
        const skus = await this.repository.listSkus(companyId, productId);
        return { product, skus };
    }
}
export class GetSkuUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(companyId, skuId) {
        const sku = await this.repository.findSkuById(companyId, skuId);
        if (!sku) {
            throw new AppError("SKU not found", 404, "SKU_NOT_FOUND");
        }
        return { sku };
    }
}
export class UpdateProductUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(input) {
        await SubscriptionLimitService.assertCanUpdate(input.companyId);
        const product = await this.repository.findProductById(input.companyId, input.productId);
        if (!product) {
            throw new AppError("Product not found", 404, "PRODUCT_NOT_FOUND");
        }
        await this.repository.updateProduct(input);
        await CoreEventBus.publish(EventEnvelopeFactory.create({
            id: input.productId,
            name: ProductEvents.productUpdated,
            source: "product",
            payload: { productId: input.productId },
            metadata: { companyId: input.companyId },
        }));
        return { updated: true, productId: input.productId };
    }
}
export class ArchiveSkuUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(companyId, skuId) {
        const sku = await this.repository.findSkuById(companyId, skuId);
        if (!sku) {
            throw new AppError("SKU not found", 404, "SKU_NOT_FOUND");
        }
        await this.repository.archiveSku(companyId, skuId);
        await CoreEventBus.publish(EventEnvelopeFactory.create({
            id: skuId,
            name: ProductEvents.skuArchived,
            source: "product",
            payload: { skuId },
            metadata: { companyId },
        }));
        return { archived: true, skuId };
    }
}
export class ProductReferenceDataUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    createCategory(input) {
        return this.repository.createCategory(input);
    }
    listCategories(companyId) {
        return this.repository.listCategories(companyId);
    }
    createBrand(input) {
        return this.repository.createBrand(input);
    }
    listBrands(companyId) {
        return this.repository.listBrands(companyId);
    }
    createUnit(input) {
        return this.repository.createUnit(input);
    }
    listUnits(companyId) {
        return this.repository.listUnits(companyId);
    }
}
