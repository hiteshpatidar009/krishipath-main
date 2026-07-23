import { loadAuthTestConfig } from "./config/auth-test.config";
import { AuthTestContext } from "./context/auth-test-context";
import { AuthCleanupEngine } from "./cleanup/auth-cleanup-engine";
import { AuthReportWriter } from "./reports/auth-report-writer";
import { AuthTestServer } from "./setup/auth-test-server";
import { runAbuseSuite } from "./auth/abuse/abuse.suite";
import { runActivitySuite } from "./auth/activity/activity.suite";
import { runAuditSuite } from "./auth/audit/audit.suite";
import { runCaptchaSuite } from "./auth/captcha/captcha.suite";
import { runConcurrencySuite } from "./auth/concurrency/concurrency.suite";
import { runIdempotencySuite } from "./auth/idempotency/idempotency.suite";
import { runLoadSuite } from "./auth/load/load.suite";
import { runLoginSuite } from "./auth/login/login.suite";
import { runLogoutSuite } from "./auth/logout/logout.suite";
import { runMfaSuite } from "./auth/mfa/mfa.suite";
import { runNotificationSuite } from "./auth/notification/notification.suite";
import { runOrganizationSuite } from "./auth/organization/organization.suite";
import { runPasswordSuite } from "./auth/password/password.suite";
import { runPerformanceSuite } from "./auth/performance/performance.suite";
import { runRbacSuite } from "./auth/role-permission/rbac.suite";
import { runRefreshSuite } from "./auth/refresh/refresh.suite";
import { runSecuritySuite } from "./auth/security/security.suite";
import { runSessionSuite } from "./auth/session/session.suite";
import { runSignupSuite } from "./auth/signup/signup.suite";
import { runSubscriptionSuite } from "./auth/subscription/subscription.suite";

const config = loadAuthTestConfig();
let server: AuthTestServer | undefined;
let context: AuthTestContext | undefined;

try {
  const baseUrl = await resolveBaseUrl();
  context = new AuthTestContext(config, baseUrl);

  if (config.cleanupEnabled) {
    await new AuthCleanupEngine(
      context.database,
      context.redis,
      context.logger,
    ).run();
  }

  await runCaptchaSuite(context);
  await runSignupSuite(context);
  await runOrganizationSuite(context);
  await runSubscriptionSuite(context);
  await runLoginSuite(context);
  await runSessionSuite(context);
  await runRefreshSuite(context);
  await runMfaSuite(context);
  await runPasswordSuite(context);
  await runRbacSuite(context);
  await runSecuritySuite(context);
  await runIdempotencySuite(context);
  await runConcurrencySuite(context);
  await runLoadSuite(context);
  await runPerformanceSuite(context);
  await runAuditSuite(context);
  await runActivitySuite(context);
  await runNotificationSuite(context);
  await runLogoutSuite(context);
  await runAbuseSuite(context);

  await new AuthReportWriter(config, context.metrics).writeAll();

  const failures = context.metrics.failCount();
  const warnings = context.metrics.warnCount();
  context.logger.info("auth test complete", {
    failures,
    warnings,
    reports: config.reportDir,
  });

  if (
    !config.allowFailures &&
    (failures > 0 || (config.failOnWarnings && warnings > 0))
  ) {
    process.exitCode = 1;
  }
} catch (error: unknown) {
  const message = error instanceof Error ? error.stack ?? error.message : String(error);
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
} finally {
  if (context) {
    await new AuthReportWriter(config, context.metrics).writeAll().catch(() => undefined);
    await context.disconnect();
  }
  await server?.stop();
}

async function resolveBaseUrl(): Promise<string> {
  if (config.baseUrl) {
    return config.baseUrl;
  }

  if (!config.startInternalServer) {
    throw new Error("AUTH_TEST_BASE_URL required when internal server disabled");
  }

  server = new AuthTestServer();
  return server.start();
}
