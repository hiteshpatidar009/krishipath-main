import { describe, expect, it, vi } from "vitest";
import { PlatformAdminOnlyGuard } from "./guards/platform-admin-only.guard";
import { PlatformSuperAdminOnlyGuard } from "./guards/platform-super-admin-only.guard";
import { LogRouterService } from "./services/log-router.service";
import { LogRetentionPolicyService } from "./services/log-retention-policy.service";

describe("enterprise logger", () => {
  it("routes payment logs correctly", () => {
    const router = new LogRouterService();
    expect(router.resolveCategory({
      severity: "info",
      module: "billing",
      action: "payment.retry.completed",
      message: "Payment retry completed",
    })).toBe("payment");
  });

  it("routes audit logs correctly", () => {
    const router = new LogRouterService();
    expect(router.resolveCategory({
      severity: "security",
      module: "role-permission",
      action: "roles.permission.assign",
      message: "Role permission assigned",
    })).toBe("audit");
  });

  it("routes activity logs correctly", () => {
    const router = new LogRouterService();
    expect(router.resolveCategory({
      severity: "info",
      module: "customer",
      action: "customer.create",
      message: "Customer created",
    })).toBe("user_activity");
  });

  it("routes platform logs by default", () => {
    const router = new LogRouterService();
    expect(router.resolveCategory({
      severity: "error",
      module: "database",
      action: "database.connection.failed",
      message: "DB failed",
    })).toBe("platform");
  });

  it("maps legacy severities", () => {
    const router = new LogRouterService();
    expect(router.mapSeverity("warn")).toBe("warning");
    expect(router.mapSeverity("fatal")).toBe("critical");
  });

  it("enforces retention minimums", () => {
    expect(LogRetentionPolicyService.ttlSeconds("audit_logs")).toBeGreaterThanOrEqual(2555 * 24 * 60 * 60);
    expect(LogRetentionPolicyService.ttlSeconds("platform_logs")).toBe(90 * 24 * 60 * 60);
  });

  it("blocks non-platform admins", () => {
    const response = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    const next = vi.fn();
    PlatformAdminOnlyGuard.use({ securityContext: { roles: [], permissions: [], requestFingerprint: "" } } as never, response as never, next);
    expect(response.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it("allows platform log readers", () => {
    const response = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    const next = vi.fn();
    PlatformAdminOnlyGuard.use({ securityContext: { roles: [], permissions: ["platform.logs.read"], requestFingerprint: "" } } as never, response as never, next);
    expect(next).toHaveBeenCalled();
  });

  it("allows platform super admin export", () => {
    const response = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    const next = vi.fn();
    PlatformSuperAdminOnlyGuard.use({ securityContext: { roles: ["Platform Super Admin"], permissions: [], requestFingerprint: "" } } as never, response as never, next);
    expect(next).toHaveBeenCalled();
  });
});
