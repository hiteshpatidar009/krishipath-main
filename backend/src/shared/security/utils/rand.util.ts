import { randomBytes, randomUUID } from "crypto";

export class RandUtil {
  public static uuid(): string {
    return randomUUID();
  }

  public static hex(bytes = 32): string {
    return randomBytes(bytes).toString("hex");
  }
}
