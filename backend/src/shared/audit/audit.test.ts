import { describe, expect, it, vi } from "vitest";
import { AuditActionResolver } from "./audit-action-resolver";
import { AuditChangeTracker } from "./audit-change-tracker";
import { AuditLogAccessGuard } from "./audit-log-access.guard";

describe("audit standardization", () => {
  it("detects field changes for explorer changes tab", () => {
    const changes = AuditChangeTracker.diff(
      { name: "Old", status: "draft", password: "secret" },
      { name: "New", status: "draft", password: "changed" },
    );

    expect(changes.map((change) => change.field)).toEqual(["name"]);
    expect(changes[0]).toMatchObject({
      field: "name",
      beforeValue: "Old",
      afterValue: "New",
    });
    expect(JSON.stringify(changes)).not.toContain("secret");
  });

  it("derives standardized audit metadata from mutation routes", () => {
    const request = {
      method: "POST",
      originalUrl: "/api/v1/stock-transfer/123/approve",
      path: "/stock-transfer/123/approve",
      params: { transferId: "123" },
    } as never;

    expect(AuditActionResolver.isAuditable(request)).toBe(true);
    expect(AuditActionResolver.module(request)).toBe("inventory");
    expect(AuditActionResolver.action(request)).toBe("inventory.approve");
    expect(AuditActionResolver.entityId(request)).toBe("123");
  });

  it("allows company audit viewers", () => {
    const response = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    const next = vi.fn();

    AuditLogAccessGuard.use({
      securityContext: {
        roles: [],
        permissions: ["audit.log.read"],
        requestFingerprint: "",
      },
    } as never, response as never, next);

    expect(next).toHaveBeenCalled();
  });

  it("blocks users without audit permission", () => {
    const response = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    const next = vi.fn();

    AuditLogAccessGuard.use({
      securityContext: {
        roles: ["Warehouse User"],
        permissions: [],
        requestFingerprint: "",
      },
    } as never, response as never, next);

    expect(response.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});
