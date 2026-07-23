import { expectStatus, expectSuccess, responseData } from "../../utils/auth-assertions";
import { AuthTestContext } from "../../context/auth-test-context";
import { loginWithMfa } from "../../utils/auth-flow-helpers";

export async function runSubscriptionSuite(
  context: AuthTestContext,
): Promise<void> {
  await context.runner.step(
    "subscription",
    "subscription",
    "selects discovered subscription plan",
    "tenant owner selects real plan",
    "critical",
    async () => {
      const plan = await context.database.findPlan(context.config.planCode);
      if (!plan) {
        throw new Error("subscription plan seed missing");
      }
      context.subscription.planCode = plan.code;

      const response = await context.adminClient.post("/auth/plan", {
        actor: "admin",
        scenario: "select plan",
        category: "subscription",
        data: {
          planCode: plan.code,
          billingCycle: context.subscription.billingCycle,
        },
      });
      expectSuccess(response);
      const data = responseData<{ subscriptionId?: string; status?: string }>(
        response,
      );
      context.subscription.id = data.subscriptionId;
      context.subscription.status = data.status;
    },
  );

  await context.runner.step(
    "organization",
    "organization",
    "creates organization after subscription",
    "organization module accepts tenant-scoped subscribed owner",
    "high",
    async () => {
      const response = await context.adminClient.post("/organizations", {
        actor: "admin",
        scenario: "organization create after subscription",
        category: "organization",
        headers: {
          "Idempotency-Key": `org-create-${context.config.runId}`,
        },
        data: {
          name: context.fixtures.organizationName("module"),
          legalName: context.fixtures.organizationName("module legal"),
          organizationCode: `ORG${context.config.runId.slice(0, 8)}`.toUpperCase(),
          email: "org@example.test",
          phone: "+15551230000",
        },
      });
      expectSuccess(response);
      const data = responseData<{ id?: string; organizationId?: string }>(response);
      context.organization.id = data.id ?? data.organizationId;
    },
  );

  await context.runner.step(
    "subscription",
    "subscription",
    "issues full tenant token after plan selection",
    "new login includes tenant and subscription access",
    "critical",
    async () => {
      const tokens = await loginWithMfa(
        context,
        context.users.orgOwner,
        "post-plan",
      );
      context.setTokens("orgOwner", tokens);
    },
  );

  await context.runner.step(
    "subscription",
    "subscription",
    "enforces adjacent subscription RBAC",
    "subscription module route must match seeded permissions",
    "high",
    async () => {
      const response = await context.adminClient.get("/subscriptions/current", {
        actor: "admin",
        scenario: "subscription current",
        category: "subscription",
      });
      expectStatus(response, [200, 403]);
      if (response.status === 403) {
        throw new Error("subscription permission catalog mismatch");
      }
    },
  );
}
