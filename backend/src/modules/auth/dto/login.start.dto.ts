export type MfaMethod = "email_otp" | "phone_otp" | "auth_app_otp";
export type LoginPrimaryMethod = "email_password" | "email_otp" | "phone_otp";
export type OtpDeliveryChannel = "sms" | "whatsapp";

export interface LoginStartDto {
  email?: string;
  phone?: string;
  password?: string;
  companyId?: string;
  isRoot: boolean;
  captchaToken?: string;
  method?: LoginPrimaryMethod;
  otpChannel?: OtpDeliveryChannel;
  deviceId?: string;
  deviceName?: string;
  deviceType?: string;
  operatingSystem?: string;
  browser?: string;
  mfaTrustToken?: string;
  captchaCode?: string;
}
