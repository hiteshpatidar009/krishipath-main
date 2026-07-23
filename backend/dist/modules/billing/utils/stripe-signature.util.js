import { createHmac, timingSafeEqual } from "crypto";
export class StripeSignatureUtil {
    static verify(payload, signatureHeader, secret) {
        if (!secret || !signatureHeader) {
            return false;
        }
        const timestamp = StripeSignatureUtil.getPart(signatureHeader, "t");
        const signature = StripeSignatureUtil.getPart(signatureHeader, "v1");
        if (!timestamp || !signature) {
            return false;
        }
        const signedPayload = `${timestamp}.${payload}`;
        const expected = createHmac("sha256", secret).update(signedPayload).digest("hex");
        const actualBuffer = Buffer.from(signature, "hex");
        const expectedBuffer = Buffer.from(expected, "hex");
        return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer);
    }
    static getPart(header, key) {
        return header
            .split(",")
            .map((part) => part.trim().split("="))
            .find(([candidate]) => candidate === key)?.[1];
    }
}
