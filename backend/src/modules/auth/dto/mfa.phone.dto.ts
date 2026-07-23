export interface MfaPhoneDto {
  phone: string;
  channel?: "sms" | "whatsapp";
}
