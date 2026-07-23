export interface MfaAppVerifySetupDto {
  email: string;
  password?: string;
  setupToken?: string;
  secret?: string;
  code: string;
}
