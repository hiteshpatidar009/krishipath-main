import { expectStatus } from "../../utils/auth-assertions";
import { AuthTestContext } from "../../context/auth-test-context";
import { forgeUnsignedJwt, malformedJwt, tamperJwtPayload } from "../../utils/token-forgery";

export async function runSecuritySuite(context: AuthTestContext): Promise<void> {
  await context.runner.step(
    "security",
    "security",
    "blocks tampered JWT claims",
    "payload mutation invalidates signature",
    "critical",
    async () => {
      const token = context.users.orgOwner.tokens?.accessToken;
      if (!token) {
        throw new Error("owner token missing");
      }
      const response = await context.adminClient.get("/auth/me", {
        actor: "anonymous",
        scenario: "tampered jwt",
        category: "security",
        headers: {
          Authorization: `Bearer ${tamperJwtPayload(token)}`,
        },
      });
      expectStatus(response, 401);
    },
  );

  await context.runner.step(
    "security",
    "security",
    "blocks unsigned JWT",
    "alg none token is rejected",
    "critical",
    async () => {
      const response = await context.adminClient.get("/auth/me", {
        actor: "anonymous",
        scenario: "unsigned jwt",
        category: "security",
        headers: {
          Authorization: `Bearer ${forgeUnsignedJwt({ sub: context.users.orgOwner.id })}`,
        },
      });
      expectStatus(response, 401);
    },
  );

  await context.runner.step(
    "security",
    "security",
    "blocks malformed JWT",
    "malformed token rejected",
    "high",
    async () => {
      const response = await context.adminClient.get("/auth/me", {
        actor: "anonymous",
        scenario: "malformed jwt",
        category: "security",
        headers: {
          Authorization: `Bearer ${malformedJwt()}`,
        },
      });
      expectStatus(response, 401);
    },
  );

  await context.runner.step(
    "security",
    "security",
    "handles injection payloads safely",
    "XSS and SQL payloads do not mutate auth state",
    "high",
    async () => {
      const response = await context.anonymousClient.post("/auth/login", {
        scenario: "injection login payload",
        category: "security",
        data: {
          email: "' union select password from users --",
          password: "<script>alert(1)</script>",
        },
      });
      expectStatus(response, [401, 422]);
    },
  );

  await context.runner.step(
    "security",
    "security",
    "blocks header injection",
    "control characters do not bypass auth",
    "medium",
    async () => {
      const response = await context.adminClient.get("/auth/me", {
        actor: "anonymous",
        scenario: "header injection",
        category: "security",
        headers: {
          Authorization: "Bearer malformed.jwt.structure",
          "X-Company-Id": `${context.organization.companyId ?? ""}\r\nX-Role: admin`,
        },
      });
      expectStatus(response, 401);
    },
  );

  await context.runner.step(
    "security",
    "security",
    "blocks path traversal probes",
    "path traversal cannot reach auth internals",
    "medium",
    async () => {
      const response = await context.anonymousClient.get("/auth/../auth/me", {
        scenario: "path traversal",
        category: "security",
      });
      expectStatus(response, [401, 404]);
    },
  );
}
