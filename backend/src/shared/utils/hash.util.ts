import { createHash } from "crypto";

export class HashUtil {
  public static sha256(value: unknown): string {
    const serialized = typeof value === "string" ? value : JSON.stringify(value);
    return createHash("sha256").update(serialized ?? "").digest("hex");
  }
}
