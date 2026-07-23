export interface CaptchaStartResponse {
  provider: string;
  verificationRequired: boolean;
  [key: string]: unknown;
}

export interface CaptchaVerifyContext {
  remoteIp?: string;
  userAgent?: string;
}

export interface ICaptchaProvider {
  start(): Promise<CaptchaStartResponse>;
  verify(value: string, context?: CaptchaVerifyContext): Promise<boolean>;
}
