export interface MfaAppVerifyDto {
  secret?: string;
  setupToken?: string;
  code: string;
}
