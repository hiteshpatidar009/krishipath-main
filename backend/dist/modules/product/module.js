import { ArchiveSkuUseCase, CreateProductUseCase, GetProductUseCase, GetSkuUseCase, ListProductsUseCase, ProductReferenceDataUseCase, UpdateProductUseCase, } from "./application";
import { PostgresProductRepository } from "./infrastructure/repositories/postgres-product.repository";
import { ProductController } from "./presentation/controllers/product.controller";
import { ProductRoutes } from "./presentation/routes/product.routes";
export class ProductModule {
    repository = new PostgresProductRepository();
    controller = new ProductController(new CreateProductUseCase(this.repository), new ListProductsUseCase(this.repository), new GetProductUseCase(this.repository), new GetSkuUseCase(this.repository), new UpdateProductUseCase(this.repository), new ArchiveSkuUseCase(this.repository), new ProductReferenceDataUseCase(this.repository));
    routes = new ProductRoutes(this.controller);
    getRouter() {
        return this.routes.getRouter();
    }
}
