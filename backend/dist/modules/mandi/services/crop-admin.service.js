import { randomUUID } from "crypto";
import { BaseService } from "../../../core/base/base.service";
import { AppError } from "../../../shared/errors/app.error";
export class CropAdminService extends BaseService {
    cropRepo;
    constructor(cropRepo) {
        super("CropAdminService");
        this.cropRepo = cropRepo;
    }
    async getCrops() {
        return this.cropRepo.findAll();
    }
    async getCrop(id) {
        const crop = await this.cropRepo.findById(id);
        if (!crop)
            throw new AppError("Crop not found", 404);
        return crop;
    }
    async createCrop(data) {
        const id = randomUUID();
        const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
        const code = `CRP_${Date.now().toString().slice(-6)}`; // Simple code generation
        return this.cropRepo.create({
            id,
            code,
            name: data.name,
            slug,
            category: data.category,
            imageUrl: data.imageUrl,
            status: data.status || "ACTIVE",
        });
    }
    async updateCrop(id, data) {
        const existing = await this.cropRepo.findById(id);
        if (!existing)
            throw new AppError("Crop not found", 404);
        return this.cropRepo.update(id, data);
    }
}
