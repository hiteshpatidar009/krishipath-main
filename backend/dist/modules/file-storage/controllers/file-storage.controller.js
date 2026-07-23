import { RequestContext } from "../../../shared/context/request-context";
import { ApiErrorHandler } from "../../../shared/http/api-error";
import { ApiResponse } from "../../../shared/http/api-response";
import { FileSignValidator } from "../validators/file-sign.validator";
export class FileStorageController {
    fileStorageService;
    validator = new FileSignValidator();
    constructor(fileStorageService) {
        this.fileStorageService = fileStorageService;
    }
    signUpload = async (request, response, next) => {
        try {
            const dto = this.validator.parse(request.body);
            const result = await this.fileStorageService.createUploadTarget(RequestContext.companyId(request), RequestContext.userId(request), dto);
            ApiResponse.created(response, result, "Upload target created");
        }
        catch (error) {
            await ApiErrorHandler.handle(error, response, next, "file-storage.controller");
        }
    };
}
