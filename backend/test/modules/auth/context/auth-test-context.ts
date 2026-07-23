import { AuthTestConfig } from "../config/auth-test.config";
import { AuthSuiteRunner } from "../utils/auth-suite-runner";
import { AuthTestHttpClient } from "../utils/auth-test-http-client";
import { AuthTestLogger } from "../utils/auth-test-logger";
import {
  AuthActor,
  AuthTestOrganizationState,
  AuthTestSubscriptionState,
  AuthTestUserState,
  AuthTokens,
} from "../utils/auth-test.types";
import { AuthTestMetrics } from "../utils/auth-metrics";
import { AuthDatabaseClient } from "../setup/auth-database-client";
import { AuthRedisClient } from "../setup/auth-redis-client";
import { AuthFixtureFactory } from "../fixtures/auth-fixture-factory";

export class AuthTestContext {
  public readonly metrics = new AuthTestMetrics();
  public readonly logger = new AuthTestLogger();
  public readonly runner = new AuthSuiteRunner(this.metrics, this.logger);
  public readonly database = new AuthDatabaseClient();
  public readonly redis = new AuthRedisClient();
  public readonly fixtures: AuthFixtureFactory;
  public readonly anonymousClient: AuthTestHttpClient;
  public readonly authenticatedClient: AuthTestHttpClient;
  public readonly adminClient: AuthTestHttpClient;
  public readonly users: {
    superAdmin: AuthTestUserState;
    orgOwner: AuthTestUserState;
    admin: AuthTestUserState;
    manager: AuthTestUserState;
    restrictedUser: AuthTestUserState;
    suspendedUser: AuthTestUserState;
  };
  public readonly sessions: string[] = [];
  public readonly refreshTokens: string[] = [];
  public readonly mfaSecrets = new Map<string, string>();
  public readonly captchaTokens: string[] = [];
  public readonly apiKeys: string[] = [];
  public readonly auditEvents: unknown[] = [];
  public readonly activityEvents: unknown[] = [];
  public readonly organization: AuthTestOrganizationState;
  public readonly subscription: AuthTestSubscriptionState;
  private baseUrl: string;

  constructor(
    public readonly config: AuthTestConfig,
    baseUrl: string,
  ) {
    this.baseUrl = baseUrl;
    this.fixtures = new AuthFixtureFactory(config.runId);
    this.users = {
      superAdmin: this.fixtures.user("super-admin"),
      orgOwner: this.fixtures.user("owner"),
      admin: this.fixtures.user("admin"),
      manager: this.fixtures.user("manager"),
      restrictedUser: this.fixtures.user("restricted"),
      suspendedUser: this.fixtures.user("suspended"),
    };
    this.organization = {
      name: this.fixtures.organizationName(),
    };
    this.subscription = {
      billingCycle: config.billingCycle,
    };

    this.anonymousClient = this.createClient();
    this.authenticatedClient = this.createClient();
    this.adminClient = this.createClient();
  }

  public setBaseUrl(baseUrl: string): void {
    this.baseUrl = baseUrl;
  }

  public setTokens(actor: keyof AuthTestContext["users"], tokens: AuthTokens): void {
    this.users[actor].tokens = tokens;
    this.refreshTokens.push(tokens.refreshToken);
  }

  public tokenFor(actor: AuthActor): AuthTokens | undefined {
    if (actor === "anonymous") {
      return undefined;
    }
    if (actor === "admin") {
      return this.users.orgOwner.tokens;
    }
    if (actor === "tenantAdmin") {
      return this.users.admin.tokens;
    }
    if (actor === "authenticated") {
      return this.users.orgOwner.tokens;
    }
    return this.users[actor]?.tokens;
  }

  public metaFor(actor: AuthActor): {
    tenant?: string;
    user?: string;
    role?: string;
    permissions?: readonly string[];
  } {
    const user =
      actor === "admin" || actor === "authenticated"
        ? this.users.orgOwner
        : actor === "tenantAdmin"
          ? this.users.admin
        : actor === "anonymous"
          ? undefined
          : this.users[actor];

    return {
      tenant: this.organization.companyId,
      user: user?.id ?? user?.email,
      role: user?.roles.join(","),
      permissions: user?.permissions,
    };
  }

  public async disconnect(): Promise<void> {
    await Promise.allSettled([
      this.database.disconnect(),
      this.redis.disconnect(),
    ]);
  }

  private createClient(): AuthTestHttpClient {
    return new AuthTestHttpClient(
      this.config,
      this.metrics,
      (actor) => this.tokenFor(actor),
      (actor) => this.metaFor(actor),
      this.baseUrl,
    );
  }
}
