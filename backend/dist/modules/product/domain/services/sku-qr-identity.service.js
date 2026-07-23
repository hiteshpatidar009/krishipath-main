import { createHash, randomUUID } from "crypto";
export class SkuQrIdentityService {
    create(input) {
        const traceId = randomUUID();
        const payload = {
            companyId: input.companyId,
            productId: input.productId,
            skuId: input.skuId,
            skuCode: input.skuCode,
            version: input.version,
            traceId,
            attributes: input.attributes,
        };
        const unsignedPayload = JSON.stringify(payload);
        const checksum = createHash("sha256").update(unsignedPayload).digest("hex");
        const qrPayload = JSON.stringify({ ...payload, checksum });
        return {
            qrCode: `RSBC-SKU-${input.skuCode}-${checksum.slice(0, 12).toUpperCase()}`,
            qrIdentifier: `qr_${input.skuId}`,
            qrPayload,
            qrChecksum: checksum,
        };
    }
}
