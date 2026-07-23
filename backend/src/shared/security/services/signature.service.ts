import { createHmac, timingSafeEqual } from "crypto";

export class SignatureService {
  public sign(payload: string, secret: string): string {
    return createHmac("sha256", secret).update(payload).digest("hex");
  }

  public verify(payload: string, signature: string, secret: string): boolean {
    const expected = this.sign(payload, secret);
    const expectedBuffer = Buffer.from(expected, "hex");
    const signatureBuffer = Buffer.from(signature, "hex");

    if (expectedBuffer.length !== signatureBuffer.length) {
      return false;
    }

    return timingSafeEqual(expectedBuffer, signatureBuffer);
  }
}
