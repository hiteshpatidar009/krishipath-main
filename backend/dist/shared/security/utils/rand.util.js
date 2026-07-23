import { randomBytes, randomUUID } from "crypto";
export class RandUtil {
    static uuid() {
        return randomUUID();
    }
    static hex(bytes = 32) {
        return randomBytes(bytes).toString("hex");
    }
}
