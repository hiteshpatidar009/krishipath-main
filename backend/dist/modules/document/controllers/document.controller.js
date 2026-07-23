import { RequestContext } from "../../../shared/context/request-context";
import { ApiErrorHandler } from "../../../shared/http/api-error";
import { ApiResponse } from "../../../shared/http/api-response";
import { PaginationValidator } from "../../../shared/validators/pagination.validator";
import { DocumentValidator } from "../validators/document.validator";
export class DocumentController {
    documentService;
    validator = new DocumentValidator();
    paginationValidator = new PaginationValidator();
    constructor(documentService) {
        this.documentService = documentService;
    }
    create = async (request, response, next) => {
        try {
            const dto = this.validator.parse({
                ...request.body,
                companyId: RequestContext.companyId(request),
                uploadedBy: RequestContext.userId(request),
            });
            const result = await this.documentService.create(dto);
            ApiResponse.created(response, result, "Document created");
        }
        catch (error) {
            await ApiErrorHandler.handle(error, response, next, "document.controller");
        }
    };
    list = async (request, response, next) => {
        try {
            const paging = this.paginationValidator.normalize(request.query);
            const result = await this.documentService.list(RequestContext.companyId(request), paging.limit, paging.offset);
            ApiResponse.ok(response, result, "Documents fetched");
        }
        catch (error) {
            await ApiErrorHandler.handle(error, response, next, "document.controller");
        }
    };
    getById = async (request, response, next) => {
        try {
            const result = await this.documentService.findById(RequestContext.companyId(request), String(request.params.id));
            ApiResponse.ok(response, result, "Document fetched");
        }
        catch (error) {
            await ApiErrorHandler.handle(error, response, next, "document.controller");
        }
    };
}
