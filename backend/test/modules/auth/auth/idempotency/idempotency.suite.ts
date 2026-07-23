import { expectStatus } from "../../utils/auth-assertions";
import { AuthTestContext } from "../../context/auth-test-context";

export async function runIdempotencySuite(
  context: AuthTestContext,
): Promise<void> {
  await context.runner.step(
    "idempotency",
    "idempotency",
    "requires idempotency on organization mutations",
    "guarded mutation rejects missing idempotency key",
    "high",
    async () => {
      const response = await context.adminClient.post("/organizations", {
        actor: "admin",
        scenario: "missing idempotency key",
        category: "idempotency",
        data: {
          name: "No Key Org",
          organizationCode: "NOKEY",
        },
      });
      expectStatus(response, 400);
    },
  );

  await context.runner.step(
    "idempotency",
    "idempotency",
    "blocks idempotency key payload drift",
    "same key with different payload returns conflict",
    "high",
    async () => {
      const key = `idem-${context.config.runId}`;
      const first = await context.adminClient.post("/organizations", {
        actor: "admin",
        scenario: "idempotency first payload",
        category: "idempotency",
        headers: { "Idempotency-Key": key },
        data: {
          name: "Idem Org One",
          organizationCode: `IDEM1${context.config.runId.slice(0, 4)}`,
        },
      });
      expectStatus(first, [200, 201, 403]);

      const second = await context.adminClient.post("/organizations", {
        actor: "admin",
        scenario: "idempotency drift payload",
        category: "idempotency",
        headers: { "Idempotency-Key": key },
        data: {
          name: "Idem Org Two",
          organizationCode: `IDEM2${context.config.runId.slice(0, 4)}`,
        },
      });
      expectStatus(second, 409);
    },
  );
}
