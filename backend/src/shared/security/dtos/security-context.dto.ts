export interface SecurityContextDto {
  userId?: string;
  membershipIds?: string[];
  enterpriseIds?: string[];
  companyIds?: string[];
  organizationIds?: string[];
  warehouseIds?: string[];
  activeEnterpriseId?: string;
  activeCompanyId?: string;
  activeOrganizationId?: string;
  activeWarehouseId?: string;
  companyId?: string;
  organizationId?: string;
  warehouseId?: string;
  sessionId?: string;
  accessLevel?: "restricted" | "limited" | "full";
  isRoot?: boolean;
  isCompanyOwner?: boolean;
  authType?: "root" | "iam";
  subscriptionStatus?: string;
  roles: string[];
  permissions: string[];
  requestFingerprint: string;
}
