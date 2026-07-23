import { CoreEventBus, EventEnvelopeFactory } from "../../../core";
import { logger } from "../../../infrastructure/logger";
import { AppError } from "../../../shared/errors/app.error";
import { BarcodeEvents } from "../events/barcode.events";
export class ResolveBarcodeUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(input) {
        await CoreEventBus.publish(EventEnvelopeFactory.create({
            id: `${input.companyId}:${Date.now()}`,
            name: BarcodeEvents.scanned,
            source: "barcode",
            payload: { code: input.code, scannerType: input.scannerType },
            metadata: { companyId: input.companyId, userId: input.actorId },
        }));
        try {
            const resolution = await this.repository.resolve(input);
            await this.repository.recordScan(input, resolution, resolution ? undefined : "BARCODE_NOT_FOUND");
            if (!resolution) {
                throw new AppError("Barcode not found", 404, "BARCODE_NOT_FOUND");
            }
            await CoreEventBus.publish(EventEnvelopeFactory.create({
                id: resolution.identity.entityId,
                name: BarcodeEvents.resolved,
                source: "barcode",
                payload: resolution,
                metadata: { companyId: input.companyId, userId: input.actorId },
            }));
            await logger.info("Barcode resolved", {
                category: "user_activity",
                module: "barcode",
                action: BarcodeEvents.resolved,
                companyId: input.companyId,
                userId: input.actorId,
                actorId: input.actorId,
                payload: {
                    entityType: resolution.identity.entityType,
                    entityId: resolution.identity.entityId,
                    scanAction: input.scanAction,
                },
            });
            return resolution;
        }
        catch (error) {
            await logger.error(error instanceof Error ? error : new Error("Barcode resolution failed"), {
                category: "platform",
                module: "barcode",
                action: "barcode.resolve.failed",
                companyId: input.companyId,
                userId: input.actorId,
                actorId: input.actorId,
            });
            throw error;
        }
    }
}
export class EnsureLocationBarcodeUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(input) {
        const identity = await this.repository.ensureLocationIdentity(input);
        await CoreEventBus.publish(EventEnvelopeFactory.create({
            id: identity.entityId,
            name: BarcodeEvents.locationQrGenerated,
            source: "barcode",
            payload: identity,
            metadata: { companyId: input.companyId, userId: input.actorId },
        }));
        return identity;
    }
}
export class GetSkuBarcodeUseCase {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    async execute(companyId, skuId) {
        const identity = await this.repository.getSkuIdentity(companyId, skuId);
        if (!identity) {
            throw new AppError("SKU barcode not found", 404, "SKU_BARCODE_NOT_FOUND");
        }
        return identity;
    }
}
