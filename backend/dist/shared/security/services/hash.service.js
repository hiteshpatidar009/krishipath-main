import { createHash, timingSafeEqual } from "crypto";
export class HashService {
    sha256(value) {
        return createHash("sha256").update(value).digest("hex");
    }
    equals(left, right) {
        const leftBuffer = Buffer.from(left);
        const rightBuffer = Buffer.from(right);
        if (leftBuffer.length !== rightBuffer.length) {
            return false;
        }
        return timingSafeEqual(leftBuffer, rightBuffer);
    }
}
