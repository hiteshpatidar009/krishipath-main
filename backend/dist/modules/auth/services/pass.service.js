import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "crypto";
import { promisify } from "util";
const scrypt = promisify(scryptCallback);
export class PassService {
    async hash(password) {
        const salt = randomBytes(16).toString("hex");
        const derived = (await scrypt(password, salt, 64));
        return {
            hash: derived.toString("hex"),
            salt,
        };
    }
    async verify(password, hash, salt) {
        const derived = (await scrypt(password, salt, 64));
        const stored = Buffer.from(hash, "hex");
        if (derived.length !== stored.length) {
            return false;
        }
        return timingSafeEqual(derived, stored);
    }
}
