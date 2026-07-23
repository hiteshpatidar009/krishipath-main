export type MfaFlow = "signup" | "login" | "account_setup";

export type MfaFactorType =
  | "email_otp"
  | "phone_sms"
  | "phone_whatsapp"
  | "authenticator_app";

export interface MfaStartDto {
  flow?: MfaFlow;
  type: MfaFactorType;
  email?: string;
  phone?: string;
  password?: string;
  setupToken?: string;
}
