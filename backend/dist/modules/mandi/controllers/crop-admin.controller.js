import { ApiResponse } from "../../../shared/http/api-response";
import { ErrorResponsePresenter } from "../../../shared/http/error-response.presenter";
export class CropAdminController {
    cropAdminService;
    constructor(cropAdminService) {
        this.cropAdminService = cropAdminService;
    }
    getCrops = async (req, res) => {
        try {
            const crops = await this.cropAdminService.getCrops();
            ApiResponse.ok(res, crops, "Crops fetched successfully");
        }
        catch (e) {
            const err = ErrorResponsePresenter.from(e, 400);
            res.status(err.statusCode).json(err.body);
        }
    };
    getCrop = async (req, res) => {
        try {
            const crop = await this.cropAdminService.getCrop(req.params.id);
            ApiResponse.ok(res, crop, "Crop fetched successfully");
        }
        catch (e) {
            const err = ErrorResponsePresenter.from(e, 400);
            res.status(err.statusCode).json(err.body);
        }
    };
    createCrop = async (req, res) => {
        try {
            const { name, category } = req.body;
            if (!name || !category) {
                ApiResponse.badRequest(res, "name and category are required");
                return;
            }
            const crop = await this.cropAdminService.createCrop(req.body);
            ApiResponse.created(res, crop, "Crop created successfully");
        }
        catch (e) {
            const err = ErrorResponsePresenter.from(e, 400);
            res.status(err.statusCode).json(err.body);
        }
    };
    updateCrop = async (req, res) => {
        try {
            const updated = await this.cropAdminService.updateCrop(req.params.id, req.body);
            ApiResponse.ok(res, updated, "Crop updated successfully");
        }
        catch (e) {
            const err = ErrorResponsePresenter.from(e, 400);
            res.status(err.statusCode).json(err.body);
        }
    };
}
