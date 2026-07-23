import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";
import { env } from "../../../infrastructure/config/env";
export class EncryptionService {
    key;
    constructor() {
        this.key = createHash("sha256").update(env.jwtAccessSecretKey).digest();
    }
    encrypt(plainText) {
        const iv = randomBytes(12);
        const cipher = createCipheriv("aes-256-gcm", this.key, iv);
        const encrypted = Buffer.concat([
            cipher.update(plainText, "utf8"),
            cipher.final(),
        ]);
        const tag = cipher.getAuthTag();
        return `${iv.toString("hex")}.${tag.toString("hex")}.${encrypted.toString("hex")}`;
    }
    decrypt(cipherText) {
        const [ivHex, tagHex, encryptedHex] = cipherText.split(".");
        if (!ivHex || !tagHex || !encryptedHex) {
            throw new Error("Invalid encrypted payload");
        }
        const decipher = createDecipheriv("aes-256-gcm", this.key, Buffer.from(ivHex, "hex"));
        decipher.setAuthTag(Buffer.from(tagHex, "hex"));
        const decrypted = Buffer.concat([
            decipher.update(Buffer.from(encryptedHex, "hex")),
            decipher.final(),
        ]);
        return decrypted.toString("utf8");
    }
}
