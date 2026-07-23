import { createCipheriv, createDecipheriv, randomBytes, createHash } from "crypto";
import { env } from "../../infrastructure/config/env";
export class EncryptionUtil {
    static getKey() {
        // Derive a 256-bit key from the jwtAccessSecretKey using sha256
        const secret = env.jwtAccessSecretKey || "fallback-secret-key-32-chars-length!!";
        return createHash("sha256").update(secret).digest();
    }
    /**
     * Encrypts a plaintext string using AES-256-CBC.
     * Returns a string in format "iv_hex:encrypted_hex"
     */
    static encrypt(text) {
        if (!text)
            return "";
        const iv = randomBytes(16);
        const cipher = createCipheriv("aes-256-cbc", this.getKey(), iv);
        let encrypted = cipher.update(text, "utf8", "hex");
        encrypted += cipher.final("hex");
        return `${iv.toString("hex")}:${encrypted}`;
    }
    /**
     * Decrypts a ciphertext string in format "iv_hex:encrypted_hex"
     */
    static decrypt(encryptedText) {
        if (!encryptedText)
            return "";
        const [ivHex, encrypted] = encryptedText.split(":");
        if (!ivHex || !encrypted) {
            throw new Error("Invalid encrypted format");
        }
        const iv = Buffer.from(ivHex, "hex");
        const decipher = createDecipheriv("aes-256-cbc", this.getKey(), iv);
        let decrypted = decipher.update(encrypted, "hex", "utf8");
        decrypted += decipher.final("utf8");
        return decrypted;
    }
}
