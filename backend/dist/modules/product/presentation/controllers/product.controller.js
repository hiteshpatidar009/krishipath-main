import { RequestContext } from "../../../../shared/context/request-context";
import { ApiResponse } from "../../../../shared/http/api-response";
import { ProductValidator } from "../validators/product.validator";
export class ProductController {
    createProductUseCase;
    listProductsUseCase;
    getProductUseCase;
    getSkuUseCase;
    updateProductUseCase;
    archiveSkuUseCase;
    referenceDataUseCase;
    constructor(createProductUseCase, listProductsUseCase, getProductUseCase, getSkuUseCase, updateProductUseCase, archiveSkuUseCase, referenceDataUseCase) {
        this.createProductUseCase = createProductUseCase;
        this.listProductsUseCase = listProductsUseCase;
        this.getProductUseCase = getProductUseCase;
        this.getSkuUseCase = getSkuUseCase;
        this.updateProductUseCase = updateProductUseCase;
        this.archiveSkuUseCase = archiveSkuUseCase;
        this.referenceDataUseCase = referenceDataUseCase;
    }
    create = async (request, response) => {
        const input = ProductValidator.create.parse(request.body);
        ApiResponse.created(response, await this.createProductUseCase.execute({
            companyId: RequestContext.companyId(request),
            createdBy: RequestContext.userId(request),
            ...input,
        }), "Product created");
    };
    list = async (request, response) => {
        const query = ProductValidator.list.parse(request.query);
        ApiResponse.ok(response, await this.listProductsUseCase.execute({ companyId: RequestContext.companyId(request), ...query }), "Products loaded");
    };
    get = async (request, response) => {
        ApiResponse.ok(response, await this.getProductUseCase.execute(RequestContext.companyId(request), String(request.params.productId ?? "")), "Product loaded");
    };
    getSku = async (request, response) => {
        ApiResponse.ok(response, await this.getSkuUseCase.execute(RequestContext.companyId(request), String(request.params.skuId ?? "")), "SKU loaded");
    };
    update = async (request, response) => {
        const input = ProductValidator.update.parse(request.body);
        ApiResponse.ok(response, await this.updateProductUseCase.execute({ companyId: RequestContext.companyId(request), productId: String(request.params.productId ?? ""), ...input }), "Product updated");
    };
    archiveSku = async (request, response) => {
        ApiResponse.ok(response, await this.archiveSkuUseCase.execute(RequestContext.companyId(request), String(request.params.skuId ?? "")), "SKU archived");
    };
    createCategory = async (request, response) => {
        const input = ProductValidator.category.parse(request.body);
        ApiResponse.created(response, await this.referenceDataUseCase.createCategory({ companyId: RequestContext.companyId(request), ...input }), "Category created");
    };
    listCategories = async (request, response) => {
        ApiResponse.ok(response, await this.referenceDataUseCase.listCategories(RequestContext.companyId(request)), "Categories loaded");
    };
    createBrand = async (request, response) => {
        const input = ProductValidator.brand.parse(request.body);
        ApiResponse.created(response, await this.referenceDataUseCase.createBrand({ companyId: RequestContext.companyId(request), ...input }), "Brand created");
    };
    listBrands = async (request, response) => {
        ApiResponse.ok(response, await this.referenceDataUseCase.listBrands(RequestContext.companyId(request)), "Brands loaded");
    };
    createUnit = async (request, response) => {
        const input = ProductValidator.unit.parse(request.body);
        ApiResponse.created(response, await this.referenceDataUseCase.createUnit({ companyId: RequestContext.companyId(request), ...input }), "Unit created");
    };
    listUnits = async (request, response) => {
        ApiResponse.ok(response, await this.referenceDataUseCase.listUnits(RequestContext.companyId(request)), "Units loaded");
    };
}
