import { createHash } from "crypto";
export class HashUtil {
    static sha256(value) {
        const serialized = typeof value === "string" ? value : JSON.stringify(value);
        return createHash("sha256").update(serialized ?? "").digest("hex");
    }
}
