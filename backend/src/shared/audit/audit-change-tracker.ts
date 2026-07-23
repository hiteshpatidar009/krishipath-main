import { LoggerUtils } from "../../infrastructure/logger/logger.utils";
import { AuditFieldChange } from "./audit-event.interface";

export class AuditChangeTracker {
  public static diff(beforeState: unknown, afterState: unknown): readonly AuditFieldChange[] {
    const before = this.toRecord(beforeState);
    const after = this.toRecord(afterState);
    const fields = new Set([...Object.keys(before), ...Object.keys(after)]);

    return [...fields]
      .filter((field) => JSON.stringify(before[field]) !== JSON.stringify(after[field]))
      .map((field) => ({
        field,
        beforeValue: LoggerUtils.maskSensitiveData(before[field]),
        afterValue: LoggerUtils.maskSensitiveData(after[field]),
      }));
  }

  private static toRecord(value: unknown): Record<string, unknown> {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return {};
    }

    return LoggerUtils.maskSensitiveData(value) as Record<string, unknown>;
  }
}
