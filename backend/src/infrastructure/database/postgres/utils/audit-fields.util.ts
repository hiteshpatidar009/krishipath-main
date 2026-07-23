export interface AuditInsertFields {
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditUpdateFields {
  updatedAt: Date;
}

export class AuditFieldsUtil {
  public static insertFields(now = new Date()): AuditInsertFields {
    return {
      createdAt: now,
      updatedAt: now,
    };
  }

  public static updateFields(now = new Date()): AuditUpdateFields {
    return {
      updatedAt: now,
    };
  }
}
