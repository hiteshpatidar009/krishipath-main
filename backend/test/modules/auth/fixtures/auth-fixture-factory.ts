import { faker } from "@faker-js/faker";
import { AuthTestUserState } from "../utils/auth-test.types";

export class AuthFixtureFactory {
  constructor(private readonly runId: string) {}

  public user(label: string): AuthTestUserState {
    const suffix = this.suffix(label);
    return {
      email: `auth.${suffix}@example.test`,
      phone: `+1555${faker.string.numeric(7)}`,
      password: `Rsbc#${faker.string.alphanumeric(10)}9`,
      firstName: `Auth${label}`,
      lastName: "Tester",
      roleIds: [],
      roles: [],
      permissions: [],
      backupCodes: [],
    };
  }

  public organizationName(label = "primary"): string {
    return `Auth Test ${label} ${this.runId.slice(0, 8)}`;
  }

  public tenantPayload(label = "primary"): Record<string, string> {
    return {
      companyName: this.organizationName(label),
      country: "US",
      timezone: "Asia/Calcutta",
      currencyCode: "USD",
      taxNumber: `TAX-${this.runId.slice(0, 8).toUpperCase()}`,
    };
  }

  public signupPayload(user: AuthTestUserState): Record<string, unknown> {
    return {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: user.password,
      phone: user.phone,
      acceptedTerms: true,
    };
  }

  public device(label: string): Record<string, string> {
    return {
      deviceId: `auth-test-${this.runId.slice(0, 8)}-${label}`,
      deviceName: `Auth Test ${label}`,
      deviceType: "cli",
      operatingSystem: process.platform,
      browser: "tsx",
    };
  }

  private suffix(label: string): string {
    return `${label}.${this.runId.replace(/-/g, "").slice(0, 12)}`.toLowerCase();
  }
}
