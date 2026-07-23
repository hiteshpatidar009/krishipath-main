import { LoggerUtils } from "../../infrastructure/logger/logger.utils";
export class AuditChangeTracker {
    static diff(beforeState, afterState) {
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
    static toRecord(value) {
        if (!value || typeof value !== "object" || Array.isArray(value)) {
            return {};
        }
        return LoggerUtils.maskSensitiveData(value);
    }
}
