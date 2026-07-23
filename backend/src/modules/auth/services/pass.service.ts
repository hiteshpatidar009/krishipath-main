import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scrypt = promisify(scryptCallback);

export class PassService {
  public async hash(password: string): Promise<{ hash: string; salt: string }> {
    const salt = randomBytes(16).toString("hex");
    const derived = (await scrypt(password, salt, 64)) as Buffer;
    return {
      hash: derived.toString("hex"),
      salt,
    };
  }

  public async verify(
    password: string,
    hash: string,
    salt: string,
  ): Promise<boolean> {
    const derived = (await scrypt(password, salt, 64)) as Buffer;
    const stored = Buffer.from(hash, "hex");

    if (derived.length !== stored.length) {
      return false;
    }

    return timingSafeEqual(derived, stored);
  }
}
