import speakeasy from "speakeasy";
import { expectStatus, expectSuccess, responseData } from "../../utils/auth-assertions";
import { AuthTestContext } from "../../context/auth-test-context";
import { loginWithMfa } from "../../utils/auth-flow-helpers";
import { SecService } from "../../../../../src/modules/auth/services/sec.service";

interface PermissionRow {
  readonly id: string;
  readonly key: string;
}

export async function runRbacSuite(context: AuthTestContext): Promise<void> {
  await context.runner.step(
    "rbac",
    "rbac",
    "lists owner permissions",
    "super admin sees permission catalog",
    "critical",
    async () => {
      const response = await context.adminClient.get("/auth/permissions", {
        actor: "admin",
        scenario: "auth permissions list",
        category: "rbac",
      });
      expectSuccess(response);
      const permissions = flattenPermissions(responseData(response));
      context.users.orgOwner.permissions = permissions.map((item) => item.key);
    },
  );

  await context.runner.step(
    "rbac",
    "rbac",
    "creates restricted role and user",
    "limited permission user can be provisioned",
    "high",
    async () => {
      const permissionsResponse = await context.adminClient.get("/auth/permissions", {
        actor: "admin",
        scenario: "permission catalog for restricted role",
        category: "rbac",
      });
      expectSuccess(permissionsResponse);
      const permissions = flattenPermissions(responseData(permissionsResponse));
      const usersRead = permissions.find((permission) => permission.key === "users.read");
      if (!usersRead) {
        throw new Error("users.read permission missing");
      }

      const roleResponse = await context.adminClient.post("/auth/roles", {
        actor: "admin",
        scenario: "restricted role create",
        category: "rbac",
        data: {
          name: `Restricted Auth ${context.config.runId.slice(0, 8)}`,
          description: "Auth test restricted role",
          permissionIds: [usersRead.id],
          color: "#64748b",
        },
      });
      expectStatus(roleResponse, 201);
      const roleId = responseData<{ roleId: string }>(roleResponse).roleId;
      context.users.admin.roleIds = [roleId];
      context.users.admin.roles = ["Restricted Auth"];
      context.users.admin.permissions = ["users.read"];

      const userResponse = await context.adminClient.post("/auth/users", {
        actor: "admin",
        scenario: "restricted user create",
        category: "rbac",
        data: {
          ...context.fixtures.signupPayload(context.users.admin),
          roleIds: [roleId],
        },
      });
      expectStatus(userResponse, 201);
      context.users.admin.id = responseData<{ userId: string }>(userResponse).userId;

      const secret = speakeasy.generateSecret({ length: 20 }).base32;
      const encrypted = new SecService().encrypt(secret);
      await context.database.configureAuthAppMfa(context.users.admin.id, encrypted);
      context.users.admin.mfaSecret = secret;
      const tokens = await loginWithMfa(context, context.users.admin, "restricted-rbac");
      context.setTokens("admin", tokens);
    },
  );

  await context.runner.step(
    "rbac",
    "rbac",
    "blocks missing permission",
    "restricted user cannot access roles management",
    "critical",
    async () => {
      const response = await context.adminClient.get("/role-permission/roles", {
        actor: "tenantAdmin",
        scenario: "restricted roles access",
        category: "rbac",
      });
      expectStatus(response, 403);
    },
  );

  await context.runner.step(
    "rbac",
    "rbac",
    "mounts role-permission module",
    "role-permission routes exist in application",
    "critical",
    async () => {
      const response = await context.anonymousClient.get(
        "/role-permission/rbac/status",
        {
          scenario: "role permission status route",
          category: "rbac",
        },
      );
      expectStatus(response, 200);
    },
  );
}

function flattenPermissions(value: unknown): PermissionRow[] {
  const groups = (value as { groups?: readonly { permissions?: PermissionRow[] }[] })
    .groups;
  return (groups ?? []).flatMap((group) => group.permissions ?? []);
}
