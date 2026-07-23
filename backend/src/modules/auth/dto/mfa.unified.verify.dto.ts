import { MfaFactorType, MfaFlow } from "./mfa.start.dto";

export interface MfaUnifiedVerifyDto {
  flow?: MfaFlow;
  type: MfaFactorType;
  code: string;
  challengeId?: string;
  email?: string;
  password?: string;
  phone?: string;
  setupToken?: string;
  secret?: string;
  companyId?: string;
  deviceId?: string;
  deviceName?: string;
  deviceType?: string;
  operatingSystem?: string;
  browser?: string;
  mfaTrustToken?: string;
}
