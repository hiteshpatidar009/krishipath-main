export interface UserView {
  id: string;
  companyId: string | null;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  displayName: string | null;
  phone: string | null;
  status: string | null;
  roleName?: string | null;
  roles?: Array<{ id: string | null; name: string | null }>;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface UserListResult {
  items: UserView[];
  total: number;
  page: number;
  limit: number;
}
