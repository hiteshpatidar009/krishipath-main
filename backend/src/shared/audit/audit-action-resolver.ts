import { Request } from "express";

const MODULE_ALIASES: Record<string, string> = {
  iam: "user-management",
  users: "user-management",
  user: "user-management",
  auth: "authentication",
  billing: "subscription",
  subscription: "subscription",
  stock: "inventory",
  "stock-reservation": "inventory",
  "stock-adjustment": "inventory",
  "stock-transfer": "inventory",
  purchase: "purchase",
  procurement: "purchase",
  "purchase-procurement": "purchase",
};

const ACTION_ALIASES: Record<string, string> = {
  POST: "create",
  PUT: "update",
  PATCH: "update",
  DELETE: "delete",
};

export class AuditActionResolver {
  public static isAuditable(request: Request): boolean {
    if (!["POST", "PUT", "PATCH", "DELETE"].includes(request.method)) {
      return false;
    }

    return !request.path.includes("/audit-log") && !request.path.includes("/audit-logs");
  }

  public static module(request: Request): string {
    const segment = this.apiSegments(request)[0] ?? "platform";
    return MODULE_ALIASES[segment] ?? segment;
  }

  public static entityType(request: Request): string {
    const segments = this.apiSegments(request);
    const candidate = segments.find((segment) => !this.isIdentifier(segment)) ?? segments[0];
    return this.singular(candidate ?? "resource");
  }

  public static entityId(request: Request): string | undefined {
    const params = Object.values(request.params ?? {});
    const paramId = params.find((value): value is string => typeof value === "string" && value.length > 0);
    if (paramId) {
      return paramId;
    }

    const body = request.body as Record<string, unknown> | undefined;
    const bodyId = body?.id ?? body?.entityId;
    return typeof bodyId === "string" ? bodyId : undefined;
  }

  public static action(request: Request): string {
    const moduleName = this.module(request);
    const routeAction = this.routeAction(request);
    return `${moduleName}.${routeAction}`;
  }

  private static routeAction(request: Request): string {
    const segments = this.apiSegments(request);
    const terminal = segments.at(-1);
    if (terminal && !this.isIdentifier(terminal) && !["api", "v1"].includes(terminal)) {
      const normalized = terminal.replace(/[^a-z0-9]+/gi, ".").toLowerCase();
      if (!["create", "update", "delete"].includes(normalized)) {
        return normalized;
      }
    }

    return ACTION_ALIASES[request.method] ?? request.method.toLowerCase();
  }

  private static apiSegments(request: Request): string[] {
    return request.originalUrl
      .split("?")[0]
      .split("/")
      .map((segment) => segment.trim().toLowerCase())
      .filter((segment) => segment && segment !== "api" && segment !== "v1");
  }

  private static isIdentifier(value: string): boolean {
    return /^[0-9a-f-]{16,}$/i.test(value) || /^[0-9]+$/.test(value);
  }

  private static singular(value: string): string {
    return value.endsWith("s") ? value.slice(0, -1) : value;
  }
}
