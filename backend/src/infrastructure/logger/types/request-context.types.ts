export interface RequestAuthContextType {
  userId?: string;
  companyId?: string;
  accessLevel?: string;
  sessionId?: string;
}

export interface RequestContextType {
  requestId?: string;
  auth?: RequestAuthContextType;
}
