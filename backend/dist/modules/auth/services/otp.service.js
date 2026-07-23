import { createHash, randomInt } from "crypto";
export class OtpService {
    generateCode() {
        return randomInt(100000, 999999).toString();
    }
    hash(code) {
        return createHash("sha256").update(code).digest("hex");
    }
    equals(code, codeHash) {
        return this.hash(code) === codeHash;
    }
}
