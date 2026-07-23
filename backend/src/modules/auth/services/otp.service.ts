import { createHash, randomInt } from "crypto";

export class OtpService {
  public generateCode(): string {
    return randomInt(100000, 999999).toString();
  }

  public hash(code: string): string {
    return createHash("sha256").update(code).digest("hex");
  }

  public equals(code: string, codeHash: string): boolean {
    return this.hash(code) === codeHash;
  }
}
