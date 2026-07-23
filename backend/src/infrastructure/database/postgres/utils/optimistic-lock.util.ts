import { AppError } from "../../../../shared/errors/app.error";

export class OptimisticLockUtil {
  public static nextVersion(currentVersion: number): number {
    return currentVersion + 1;
  }

  public static assertRowsAffected(
    rowsAffected: number,
    entityName: string,
  ): void {
    if (rowsAffected > 0) {
      return;
    }

    throw new AppError(
      `${entityName} changed by another operation`,
      409,
      "OPTIMISTIC_LOCK_CONFLICT",
    );
  }
}
