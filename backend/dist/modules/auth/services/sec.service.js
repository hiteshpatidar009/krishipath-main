import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";
import { env } from "../../../infrastructure/config/env";
export class SecService {
    key;
    constructor() {
        this.key = createHash("sha256")
            .update(env.jwtAccessSecretKey)
            .digest();
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
            throw new Error("Invalid cipher text");
        }
        const iv = Buffer.from(ivHex, "hex");
        const tag = Buffer.from(tagHex, "hex");
        const encrypted = Buffer.from(encryptedHex, "hex");
        const decipher = createDecipheriv("aes-256-gcm", this.key, iv);
        decipher.setAuthTag(tag);
        const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
        return decrypted.toString("utf8");
    }
}
