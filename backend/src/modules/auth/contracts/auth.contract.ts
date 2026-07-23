import { ModuleContract } from "../../../core";

export interface AuthSessionView {
  readonly userId: string;
  readonly companyId?: string;
  readonly sessionId: string;
  readonly accessLevel: "restricted" | "limited" | "full";
}

export interface AuthContract extends ModuleContract {
  resolveSession(accessToken: string): Promise<AuthSessionView>;
  requirePermission(userId: string, permissionKey: string): Promise<void>;
}
