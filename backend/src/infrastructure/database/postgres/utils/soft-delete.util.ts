export interface SoftDeleteFields {
  deletedAt: Date;
  updatedAt: Date;
}

export class SoftDeleteUtil {
  public static markDeleted(now = new Date()): SoftDeleteFields {
    return {
      deletedAt: now,
      updatedAt: now,
    };
  }
}
