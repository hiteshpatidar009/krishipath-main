import { createHash } from "crypto";
export class IdempotencyUtil {
    static hashPayload(payload) {
        return createHash("sha256").update(JSON.stringify(payload ?? {})).digest("hex");
    }
}
