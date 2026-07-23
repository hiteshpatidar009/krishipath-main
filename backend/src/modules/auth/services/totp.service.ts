import speakeasy from "speakeasy";

export class TotpService {
  public createSecret(length = 20): string {
    return speakeasy.generateSecret({ length }).base32;
  }

  public verify(secret: string, code: string, window = 2): boolean {
    const normalizedSecret = this.normalizeSecret(secret);
    const normalizedCode = this.normalizeCode(code);

    return Boolean(
      speakeasy.totp.verify({
        secret: normalizedSecret,
        encoding: "base32",
        token: normalizedCode,
        window,
      }),
    );
  }

  public buildOtpAuthUri(secret: string, issuer: string, account: string): string {
    return speakeasy.otpauthURL({
      secret,
      label: `${issuer}:${account}`,
      issuer,
      encoding: "base32",
    });
  }

  private normalizeSecret(secret: string): string {
    return secret.replace(/\s+/g, "").toUpperCase();
  }

  private normalizeCode(code: string): string {
    return code.replace(/\s+/g, "");
  }
}
