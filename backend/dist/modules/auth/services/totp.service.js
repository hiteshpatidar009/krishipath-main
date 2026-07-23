import speakeasy from "speakeasy";
export class TotpService {
    createSecret(length = 20) {
        return speakeasy.generateSecret({ length }).base32;
    }
    verify(secret, code, window = 2) {
        const normalizedSecret = this.normalizeSecret(secret);
        const normalizedCode = this.normalizeCode(code);
        return Boolean(speakeasy.totp.verify({
            secret: normalizedSecret,
            encoding: "base32",
            token: normalizedCode,
            window,
        }));
    }
    buildOtpAuthUri(secret, issuer, account) {
        return speakeasy.otpauthURL({
            secret,
            label: `${issuer}:${account}`,
            issuer,
            encoding: "base32",
        });
    }
    normalizeSecret(secret) {
        return secret.replace(/\s+/g, "").toUpperCase();
    }
    normalizeCode(code) {
        return code.replace(/\s+/g, "");
    }
}
