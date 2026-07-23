import { createHmac, timingSafeEqual } from "crypto";
export class SignatureService {
    sign(payload, secret) {
        return createHmac("sha256", secret).update(payload).digest("hex");
    }
    verify(payload, signature, secret) {
        const expected = this.sign(payload, secret);
        const expectedBuffer = Buffer.from(expected, "hex");
        const signatureBuffer = Buffer.from(signature, "hex");
        if (expectedBuffer.length !== signatureBuffer.length) {
            return false;
        }
        return timingSafeEqual(expectedBuffer, signatureBuffer);
    }
}
