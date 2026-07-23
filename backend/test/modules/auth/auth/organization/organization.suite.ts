import { expectStatus, responseData } from "../../utils/auth-assertions";
import { AuthTestContext } from "../../context/auth-test-context";
import { loginWithMfa } from "../../utils/auth-flow-helpers";

export async function runOrganizationSuite(
  context: AuthTestContext,
): Promise<void> {
  await context.runner.step(
    "tenant",
    "organization",
    "creates tenant through auth flow",
    "authenticated owner creates tenant",
    "critical",
    async () => {
      const response = await context.authenticatedClient.post("/auth/tenant", {
        actor: "authenticated",
        scenario: "tenant creation",
        category: "organization",
        data: context.fixtures.tenantPayload(),
      });
      expectStatus(response, 201);
      const data = responseData<{
        companyId: string;
        tenantName: string;
        status: string;
      }>(response);
      context.organization.companyId = data.companyId;
      context.organization.tenantName = data.tenantName;
    },
  );

  await context.runner.step(
    "tenant",
    "organization",
    "blocks duplicate tenant creation",
    "same user cannot create second tenant",
    "high",
    async () => {
      const response = await context.authenticatedClient.post("/auth/tenant", {
        actor: "authenticated",
        scenario: "duplicate tenant creation",
        category: "organization",
        data: context.fixtures.tenantPayload("duplicate"),
      });
      expectStatus(response, 409);
    },
  );

  await context.runner.step(
    "organization",
    "organization",
    "blocks tenantless organization route",
    "token without tenant cannot access tenant routes",
    "high",
    async () => {
      const response = await context.adminClient.get(
        "/organizations/hierarchy",
        {
          actor: "authenticated",
          scenario: "tenantless organization access",
          category: "organization",
        },
      );
      expectStatus(response, 403);
    },
  );

  await context.runner.step(
    "tenant",
    "organization",
    "refreshes tenant token after onboarding",
    "login after tenant creation carries tenant context",
    "critical",
    async () => {
      const tokens = await loginWithMfa(
        context,
        context.users.orgOwner,
        "tenant-token",
      );
      context.setTokens("orgOwner", tokens);
    },
  );

  await context.runner.step(
    "organization",
    "organization",
    "blocks organization before subscription",
    "subscription gate blocks core organization creation",
    "high",
    async () => {
      const response = await context.adminClient.post("/organizations", {
        actor: "admin",
        scenario: "organization before subscription",
        category: "organization",
        headers: {
          "Idempotency-Key": `org-pre-sub-${context.config.runId}`,
        },
        data: {
          name: context.fixtures.organizationName("module"),
          legalName: context.fixtures.organizationName("module legal"),
          organizationCode:
            `ORG${context.config.runId.slice(0, 8)}`.toUpperCase(),
          email: "org@example.test",
          phone: "+15551230000",
        },
      });
      expectStatus(response, 403);
    },
  );
}
