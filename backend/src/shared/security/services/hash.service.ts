import { createHash, timingSafeEqual } from "crypto";

export class HashService {
  public sha256(value: string): string {
    return createHash("sha256").update(value).digest("hex");
  }

  public equals(left: string, right: string): boolean {
    const leftBuffer = Buffer.from(left);
    const rightBuffer = Buffer.from(right);

    if (leftBuffer.length !== rightBuffer.length) {
      return false;
    }

    return timingSafeEqual(leftBuffer, rightBuffer);
  }
}
