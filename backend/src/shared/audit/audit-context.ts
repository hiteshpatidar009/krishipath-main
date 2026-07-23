import { Request } from "express";
import { AuditEvent } from "./audit-event.interface";

export type AuditContextInput = Partial<
  Pick<
    AuditEvent,
    | "action"
    | "module"
    | "entityType"
    | "entityId"
    | "organizationId"
    | "warehouseId"
    | "beforeState"
    | "afterState"
    | "metadata"
  >
>;

export class AuditContext {
  private static readonly key = Symbol.for("krishipath.audit.context");

  public static set(request: Request, input: AuditContextInput): void {
    const target = request as Request & { [AuditContext.key]?: AuditContextInput };
    target[AuditContext.key] = {
      ...target[AuditContext.key],
      ...input,
      metadata: {
        ...(target[AuditContext.key]?.metadata ?? {}),
        ...(input.metadata ?? {}),
      },
    };
  }

  public static get(request: Request): AuditContextInput {
    return ((request as Request & { [AuditContext.key]?: AuditContextInput })[AuditContext.key] ?? {});
  }
}
