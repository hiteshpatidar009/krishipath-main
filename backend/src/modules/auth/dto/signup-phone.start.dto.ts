import { OtpDeliveryChannel } from "./login.start.dto";

export interface SignupPhoneStartDto {
  email: string;
  phone?: string;
  channel?: OtpDeliveryChannel;
}
