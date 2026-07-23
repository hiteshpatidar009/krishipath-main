export interface AuditLog {
  action: string;
  performedBy: string;
  createdAt?: Date;
}
