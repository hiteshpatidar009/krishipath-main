import { AppError } from "../../../../shared/errors/app.error";
export class OptimisticLockUtil {
    static nextVersion(currentVersion) {
        return currentVersion + 1;
    }
    static assertRowsAffected(rowsAffected, entityName) {
        if (rowsAffected > 0) {
            return;
        }
        throw new AppError(`${entityName} changed by another operation`, 409, "OPTIMISTIC_LOCK_CONFLICT");
    }
}
