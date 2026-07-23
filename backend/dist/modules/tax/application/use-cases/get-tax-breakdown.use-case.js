import { AppError } from "../../../../shared/errors/app.error";
export class GetTaxBreakdownUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(id, context) {
        const snapshot = await this.repository.findSnapshotById(context.companyId, id);
        if (!snapshot) {
            throw new AppError("Tax calculation snapshot not found", 404, "TAX_SNAPSHOT_NOT_FOUND");
        }
        return snapshot;
    }
}
