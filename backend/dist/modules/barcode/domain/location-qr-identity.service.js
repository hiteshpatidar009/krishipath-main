import { createHash } from "crypto";
export class LocationQrIdentityService {
    create(input) {
        const payload = {
            companyId: input.companyId,
            entityType: input.entityType,
            entityId: input.entityId,
            code: input.code,
            version: 1,
        };
        const unsignedPayload = JSON.stringify(payload);
        const qrChecksum = createHash("sha256").update(unsignedPayload).digest("hex");
        return {
            ...payload,
            qrCode: `RSBC-${input.entityType.toUpperCase()}-${input.code}-${qrChecksum.slice(0, 12).toUpperCase()}`,
            qrIdentifier: `qr_${input.entityType}_${input.entityId}`,
            qrPayload: JSON.stringify({ ...payload, checksum: qrChecksum }),
            qrChecksum,
        };
    }
}
