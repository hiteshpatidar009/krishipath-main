export interface AccessClaims {
  sub: string;
  companyId?: string;
  sessionId: string;
  accessLevel: "restricted" | "limited" | "full";
  isRoot?: boolean;
  authType?: "root" | "iam";
  userType?: "farmer" | "creator" | "trader" | "company" | "admin" | "employee";
  profileStatus?: "INCOMPLETE" | "PENDING_VERIFICATION" | "COMPLETE" | "COMPLETED";
  farmerId?: string;
}
