import { MfaMethod } from "./login.start.dto";

export interface LoginVerifyDto {
  challengeId: string;
  method: MfaMethod;
  code: string;
  companyId?: string;
  deviceId?: string;
  deviceName?: string;
  deviceType?: string;
  operatingSystem?: string;
  browser?: string;
  mfaTrustToken?: string;
}
