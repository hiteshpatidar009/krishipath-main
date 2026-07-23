export interface MfaAppStartDto {
  email: string;
  password?: string;
  setupToken?: string;
}
